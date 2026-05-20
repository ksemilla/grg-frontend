import { useRoomStore } from "@/stores/roomStore"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

type Primitive = string | number | boolean | null

type DictValue = Primitive | DictValue[] | { [key: string]: DictValue }

type Message = {
  type: string
} & {
  [key: string]: DictValue
}

let roomSocket: WebSocket | null = null

export function getRoomWebSocket(url: string) {
  if (!roomSocket || roomSocket.readyState === WebSocket.CLOSED) {
    roomSocket = new WebSocket(url)
  }
  return roomSocket
}

export function resetRoomWebSocket() {
  if (roomSocket && roomSocket.readyState !== WebSocket.CLOSED) {
    roomSocket.close() // optional: only close on logout or page unload
  }
  roomSocket = null
}

export function useRoomSocket(
  roomUuid: string,
  code: string | unknown,
  token?: string
) {
  const BASE_WS = import.meta.env.VITE_APP_ROOT_WS
  const socketRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)
  const navigate = useNavigate()
  const roomStore = useRoomStore()

  useEffect(() => {
    let shouldReconnect = true
    const connect = () => {
      let wsRoot = BASE_WS
      if (!wsRoot.endsWith("/ws") && !wsRoot.endsWith("/ws/")) {
        wsRoot = wsRoot.replace(/\/$/, "") + "/ws"
      }
      let BASE_URL = `${wsRoot}/${roomUuid}/?code=${code}`
      if (token) {
        BASE_URL = `${BASE_URL}&token=${token}`
      }
      socketRef.current = getRoomWebSocket(BASE_URL)

      socketRef.current.onopen = () => {
        const uuid = localStorage.getItem("uuid")
        const name = localStorage.getItem("name")
        if (uuid && name) {
          socketRef.current?.send(
            JSON.stringify({
              type: "rejoin",
              uuid,
              name,
            })
          )
        }
      }

      socketRef.current.onmessage = (e: MessageEvent) => {
        const event = JSON.parse(e.data)
        switch (event.type) {
          case "admin":
            roomStore.setIsAdmin(true)
            break
          case "room.update":
            roomStore.setValue(event.room)
            break
          case "set.player":
            localStorage.setItem("name", event.player_name)
            if (typeof code === "string") {
              navigate({
                to: "/room/$roomUuid",
                params: { roomUuid },
                search: {
                  code: code,
                  token,
                },
              })
            }
            break
          case "clear.player":
            localStorage.removeItem("name")
            break
          default:
            console.log("UNKNOWN EVENT", event)
            break
        }
      }

      socketRef.current.onclose = () => {
        if (shouldReconnect) {
          const timeout = Math.min(1000 * 2 ** retryRef.current, 30000)
          retryRef.current++
          if (retryRef.current >= 3) {
            roomStore.setCode("")
            roomStore.setToken("")
            navigate({
              to: "/",
            })
          } else {
            setTimeout(connect, timeout)
          }
        } else {
          roomStore.setCode("")
          roomStore.setToken("")
        }
      }
      socketRef.current.onerror = () => {
        socketRef.current?.close()
      }
    }

    code && connect()

    return () => {
      shouldReconnect = false
      socketRef.current?.close()
    }
  }, [code, token])

  const sendMessage = (msg: Message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg))
    }
  }

  return { sendMessage }
}

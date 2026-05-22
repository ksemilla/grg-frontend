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
  const connectFnRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let shouldReconnect = true
    const connect = () => {
      roomStore.setSocketStatus("connecting")
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
        roomStore.setSocketStatus("connected")
        retryRef.current = 0
        const uuid = localStorage.getItem("uuid")
        if (uuid) {
          socketRef.current?.send(
            JSON.stringify({
              type: "rejoin",
              uuid,
            })
          )
        }
      }

      if (socketRef.current.readyState === WebSocket.OPEN) {
        roomStore.setSocketStatus("connected")
        retryRef.current = 0
        const uuid = localStorage.getItem("uuid")
        if (uuid) {
          socketRef.current.send(
            JSON.stringify({
              type: "rejoin",
              uuid,
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
          case "demote":
            roomStore.setIsAdmin(false)
            break
          case "room.update":
            roomStore.setValue(event.room)
            break
          case "set.player": {
            if (event.player_name) {
              localStorage.setItem("name", String(event.player_name))
            }
            if (event.team) {
              localStorage.setItem("team", String(event.team))
            }
            const finalCode = (typeof code === "string" ? code : null) || roomStore.code || ""
            navigate({
              to: "/room/$roomUuid",
              params: { roomUuid },
              search: {
                code: finalCode,
                token: token || roomStore.token || "",
              },
            })
            break
          }
          case "clear.player": {
            localStorage.removeItem("name")
            localStorage.removeItem("team")
            const finalCode = (typeof code === "string" ? code : null) || roomStore.code || ""
            navigate({
              to: "/room/$roomUuid/set-name",
              params: { roomUuid },
              search: {
                code: finalCode,
                token: token || roomStore.token || "",
              },
            })
            break
          }
          case "blocked.player":
            localStorage.removeItem("name")
            localStorage.removeItem("team")
            roomStore.setIsBlocked(true)
            break
          case "name_taken.player":
            alert(
              "This name is already taken by another player in this lobby. Please choose a different name!"
            )
            break
          default:
            break
        }
      }

      socketRef.current.onclose = () => {
        roomStore.setSocketStatus("disconnected")
        if (shouldReconnect) {
          const timeout = Math.min(1000 * 2 ** retryRef.current, 30000)
          retryRef.current++
          if (retryRef.current < 3) {
            roomStore.setSocketStatus("connecting")
            setTimeout(connect, timeout)
          }
        }
      }
      socketRef.current.onerror = () => {
        socketRef.current?.close()
      }
    }

    connectFnRef.current = connect
    code && connect()

    return () => {
      shouldReconnect = false
      socketRef.current?.close()
    }
  }, [code, token, roomUuid])

  const reconnect = () => {
    retryRef.current = 0
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      socketRef.current.close()
    }
    connectFnRef.current?.()
  }

  const sendMessage = (msg: Message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg))
    }
  }

  return { sendMessage, reconnect }
}

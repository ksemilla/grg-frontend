import { useMessage } from "@/components/message-provider"
import { MemoryGame } from "@/features/memory-game/memory-game"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

type RoomSearchParams = {
  code?: string
}

export const Route = createFileRoute("/room/$roomUuid/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>): RoomSearchParams => {
    return {
      code: search.code ?? "",
    }
  },
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()
  const name = localStorage.getItem("name")
  const navigate = useNavigate()
  const { sendMessage } = useMessage()
  useEffect(() => {
    if (!roomStore.code) {
      navigate({
        to: "/room/$roomUuid/enter",
        params: { roomUuid },
        search: {
          token: roomStore.token,
        },
      })
    } else if (!name) {
      navigate({
        to: "/room/$roomUuid/set-name",
        params: {
          roomUuid: roomUuid,
        },
        search: { code: roomStore.code },
      })
    }
  }, [name, roomStore.code])

  const onFinish = (data: { score: number; time: string }) => {
    const { score, time } = data
    sendMessage({
      type: "add_score",
      uuid: localStorage.getItem("uuid"),
      name: localStorage.getItem("name"),
      score,
      time,
    })
  }

  if (!roomStore.code || !name) return

  return (
    <div>
      <MemoryGame onFinish={onFinish} n={6} />
    </div>
  )
}

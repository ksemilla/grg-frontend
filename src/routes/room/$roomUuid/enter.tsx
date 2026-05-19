import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

export const Route = createFileRoute("/room/$roomUuid/enter")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()
  const navigate = useNavigate()

  const methods = useForm<{
    code: string
  }>()

  const onSubmit = (data: { code: string }) => {
    roomStore.setCode(data.code)
    navigate({
      to: "/room/$roomUuid",
      params: { roomUuid: "uuid" },
    })
  }

  useEffect(() => {
    if (roomStore.code) {
      navigate({
        to: "/room/$roomUuid",
        params: { roomUuid },
        search: { code: roomStore.code, token: roomStore.token },
      })
    }
  }, [roomStore.code])

  return (
    <div>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Input {...methods.register("code", { required: true })} />
        <Button>Enter Room</Button>
      </form>
    </div>
  )
}

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRoomStore } from "@/stores/roomStore"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useMessage } from "@/components/message-provider"

export const Route = createFileRoute("/room/$roomUuid/set-name")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const uuid = localStorage.getItem("uuid")
  const nameLS = localStorage.getItem("name")
  const roomStore = useRoomStore()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const { sendMessage } = useMessage()
  const filteredOptions =
    roomStore.value?.players.filter(
      (pn) => pn.name.toLowerCase().includes(name.toLowerCase()) && !pn.uuid
    ) ?? []

  const setPlayer = (player_name: string) => {
    if (uuid) {
      sendMessage({
        type: "set_player",
        uuid,
        player_name,
      })
    }
  }

  useEffect(() => {
    if (nameLS) {
      navigate({
        to: "/room/$roomUuid",
        params: { roomUuid },
        search: { code: roomStore.code, token: roomStore.token },
      })
    }
  }, [nameLS])

  return (
    <div>
      <Input
        placeholder="Search your name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        {filteredOptions.map((pn) => (
          <Dialog key={pn.name}>
            <DialogTrigger asChild>
              <Card className="text-center">{pn.name}</Card>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="text-center">
                Welcome {pn.name}!
              </DialogTitle>
              <DialogDescription></DialogDescription>
              <Button onClick={() => setPlayer(pn.name)}>Enter</Button>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

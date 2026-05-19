import { useMessage } from "@/components/message-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/room/$roomUuid/admin/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { sendMessage } = useMessage()
  const roomStore = useRoomStore()
  const [playerName, setPlayerName] = useState("")
  const addPlayer = () => {
    playerName &&
      sendMessage({
        type: "add_player",
        player_name: playerName,
      })
  }

  const clearPlayer = (uuid: string) => {
    if (uuid) {
      sendMessage({
        type: "clear_player",
        uuid,
      })
    }
  }

  const force = () => {
    sendMessage({
      type: "force_update",
    })
  }

  return (
    <div>
      <Button onClick={() => force()}>Force</Button>
      <Input
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <Button onClick={() => addPlayer()}>Add Player</Button>
      <div className="flex flex-col gap-2">
        {roomStore.value?.players.map((pn) => (
          <Dialog key={pn.name}>
            <DialogTrigger asChild>
              <Card className="text-center">{pn.name}</Card>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{pn.name}</DialogTitle>
              <DialogDescription>Manage this user</DialogDescription>
              <Button onClick={() => clearPlayer(pn.uuid)}>Clear User</Button>
              <Button>Block</Button>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

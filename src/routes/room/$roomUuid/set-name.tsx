import { Input } from "@/components/ui/input"
import { useRoomStore } from "@/stores/roomStore"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMessage } from "@/components/message-provider"
import { Users } from "lucide-react"

export const Route = createFileRoute("/room/$roomUuid/set-name")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const uuid = localStorage.getItem("uuid")
  const roomStore = useRoomStore()
  const myPlayer = roomStore.value?.players.find((p) => p.uuid === uuid)
  const hasExistingName = !!myPlayer?.name
  const [name, setName] = useState("")
  const { sendMessage } = useMessage()

  const setPlayer = (player_name: string, team: "boy" | "girl") => {
    if (uuid) {
      localStorage.setItem("team", team)
      sendMessage({
        type: "set_player",
        uuid,
        player_name,
        team,
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 mb-2">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Choose Your Name
          </h1>
          <p className="text-slate-400 text-xs px-4">
            Type your player name to get started and claim your leaderboard
            slot.
          </p>
        </div>

        {/* Input Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Enter your name..."
              value={name}
              maxLength={15}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11 text-center font-medium text-base tracking-wide"
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                disabled={name.trim().length < 2}
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-900/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Join Lobby
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md rounded-2xl shadow-2xl p-6">
              <div className="space-y-5 text-center py-2">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-bold text-center">
                    Welcome,{" "}
                    <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      {name.trim()}
                    </span>
                    !
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm font-medium">
                    Which team are you on?
                  </DialogDescription>
                </div>

                {/* Team Options */}
                <div className="grid grid-cols-2 gap-4 pt-3">
                  {/* Team Boy */}
                  <Button
                    onClick={() => setPlayer(name.trim(), "boy")}
                    className="h-28 bg-gradient-to-br from-sky-600 to-cyan-700 hover:from-sky-500 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-sky-900/40 transition-all hover:scale-[1.03] active:scale-95 flex flex-col gap-2 border border-sky-400/20 cursor-pointer"
                  >
                    <span className="text-3xl">👦</span>
                    <span className="tracking-wide text-sm font-extrabold uppercase">
                      Team Boy
                    </span>
                  </Button>

                  {/* Team Girl */}
                  <Button
                    onClick={() => setPlayer(name.trim(), "girl")}
                    className="h-28 bg-gradient-to-br from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 transition-all hover:scale-[1.03] active:scale-95 flex flex-col gap-2 border border-pink-400/20 cursor-pointer"
                  >
                    <span className="text-3xl">👧</span>
                    <span className="tracking-wide text-sm font-extrabold uppercase">
                      Team Girl
                    </span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {hasExistingName && (
            <Link
              to="/room/$roomUuid"
              params={{ roomUuid }}
              search={{ code: roomStore.code ?? "" }}
              className="block text-center text-xs text-slate-550 hover:text-slate-400 font-medium transition-colors mt-3 cursor-pointer"
            >
              ← Cancel & Back to Lobby
            </Link>
          )}
        </div>
      </div>

      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        ROOM ID: {roomUuid}
      </p>
    </div>
  )
}

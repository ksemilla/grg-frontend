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
import { UserCheck, Search, Users, ShieldAlert } from "lucide-react"

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

  useEffect(() => {
    if (nameLS) {
      navigate({
        to: "/room/$roomUuid",
        params: { roomUuid },
        search: { code: roomStore.code, token: roomStore.token },
      })
    }
  }, [nameLS, roomUuid])

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
          <h1 className="text-2xl font-bold tracking-tight">
            Who are you?
          </h1>
          <p className="text-slate-400 text-xs px-4">
            Search and select your name to claim your seat for the game.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 pl-10 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-10"
          />
        </div>

        {/* Players List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((pn) => (
              <Dialog key={pn.name}>
                <DialogTrigger asChild>
                  <Card className="p-4 bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 hover:border-violet-500/30 transition-all cursor-pointer flex justify-between items-center group">
                    <span className="font-semibold text-slate-200 text-sm tracking-wide">
                      {pn.name}
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-violet-400 transition-colors flex items-center gap-1">
                      Join Lobby <UserCheck className="w-3.5 h-3.5" />
                    </span>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md rounded-2xl shadow-2xl p-6">
                  <div className="space-y-5 text-center py-2">
                    <div className="space-y-1">
                      <DialogTitle className="text-2xl font-bold text-center">
                        Welcome, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{pn.name}</span>!
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 text-sm font-medium">
                        Which team are you on?
                      </DialogDescription>
                    </div>
                    
                    {/* Team Options */}
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      {/* Team Boy */}
                      <Button 
                        onClick={() => setPlayer(pn.name, "boy")}
                        className="h-28 bg-gradient-to-br from-sky-600 to-cyan-700 hover:from-sky-500 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-sky-900/40 transition-all hover:scale-[1.03] active:scale-95 flex flex-col gap-2 border border-sky-400/20"
                      >
                        <span className="text-3xl">👦</span>
                        <span className="tracking-wide text-sm font-extrabold uppercase">Team Boy</span>
                      </Button>

                      {/* Team Girl */}
                      <Button 
                        onClick={() => setPlayer(pn.name, "girl")}
                        className="h-28 bg-gradient-to-br from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 transition-all hover:scale-[1.03] active:scale-95 flex flex-col gap-2 border border-pink-400/20"
                      >
                        <span className="text-3xl">👧</span>
                        <span className="tracking-wide text-sm font-extrabold uppercase">Team Girl</span>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))
          ) : (
            <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No available slots found</p>
            </div>
          )}
        </div>
      </div>
      
      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        ROOM ID: {roomUuid}
      </p>
    </div>
  )
}

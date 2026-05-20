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
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { ShieldCheck, UserPlus, RefreshCw, LogOut, Ban, Users } from "lucide-react"

export const Route = createFileRoute("/room/$roomUuid/admin/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const { sendMessage } = useMessage()
  const roomStore = useRoomStore()
  const [playerName, setPlayerName] = useState("")

  const addPlayer = () => {
    if (playerName.trim()) {
      sendMessage({
        type: "add_player",
        player_name: playerName.trim(),
      })
      setPlayerName("")
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Executive Card */}
      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-8 animate-in fade-in zoom-in duration-300">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Host Control Center</h1>
                <p className="text-slate-500 text-[11px] font-medium tracking-wide uppercase">Lobby Manager</p>
              </div>
            </div>
            
            <Button 
              onClick={force}
              variant="outline"
              size="sm"
              className="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 h-9"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Force Refresh
            </Button>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex gap-2 w-full pt-1">
            <Link
              to="/room/$roomUuid"
              params={{ roomUuid }}
              search={{ code: roomStore.code, token: roomStore.token }}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 h-9"
              >
                🎮 Go to Game Board
              </Button>
            </Link>

            <Link
              to="/room/$roomUuid/set-name"
              params={{ roomUuid }}
              search={{ code: roomStore.code, token: roomStore.token }}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 h-9"
              >
                👤 Choose Player Slot
              </Button>
            </Link>
          </div>
        </div>

        {/* Add Player Slot Form */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-violet-400" /> Create Player Seat
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="Enter player's display name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 focus-visible:ring-rose-500/50 focus-visible:border-rose-500/50 h-10"
            />
            <Button 
              onClick={addPlayer}
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 h-10 rounded-lg shadow-lg shadow-rose-600/10"
            >
              Add Seat
            </Button>
          </div>
        </div>

        {/* Seating / Players List */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1.5 pb-1 border-b border-slate-800/40">
            <Users className="w-4 h-4 text-rose-400" /> Active Room Seating
          </h2>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {roomStore.value?.players && roomStore.value.players.length > 0 ? (
              roomStore.value.players.map((pn) => {
                const isOccupied = !!pn.uuid
                return (
                  <Dialog key={pn.name}>
                    <DialogTrigger asChild>
                      <Card className="p-4 bg-slate-950/30 border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer flex justify-between items-center group">
                        <span className="font-semibold text-slate-200 text-sm tracking-wide">
                          {pn.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isOccupied 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-slate-800/60 text-slate-500 border border-slate-700/40"
                          }`}>
                            {isOccupied ? "Occupied" : "Vacant"}
                          </span>
                        </div>
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm rounded-xl">
                      <div className="space-y-4 text-center py-4">
                        <div className="inline-flex p-3 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20 mb-2">
                          <ShieldCheck className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-center">
                          Manage Seat: {pn.name}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                          Control connectivity and state for this player slot.
                        </DialogDescription>
                        
                        <div className="flex flex-col gap-2 pt-3">
                          <Button 
                            disabled={!isOccupied}
                            onClick={() => clearPlayer(pn.uuid)}
                            variant="destructive"
                            className="bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center justify-center gap-1.5 h-10"
                          >
                            <LogOut className="w-4 h-4" />
                            Evict / Clear Seat
                          </Button>
                          <Button 
                            variant="outline"
                            className="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400 flex items-center justify-center gap-1.5 h-10"
                          >
                            <Ban className="w-4 h-4" />
                            Block Seat Name
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })
            ) : (
              <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 space-y-2">
                <Users className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No player slots configured yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        ROOM ID: {roomUuid}
      </p>
    </div>
  )
}

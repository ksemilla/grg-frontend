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
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ShieldCheck, RefreshCw, LogOut, Ban, Users, Search } from "lucide-react"

export const Route = createFileRoute("/room/$roomUuid/admin/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const { sendMessage } = useMessage()
  const roomStore = useRoomStore()
  const [searchQuery, setSearchQuery] = useState("")



  const clearPlayer = (uuid: string, name: string) => {
    sendMessage({
      type: "clear_player",
      uuid: uuid || "",
      name: name || "",
    })
  }

  const blockPlayer = (target_uuid: string) => {
    if (target_uuid) {
      sendMessage({
        type: "block_player",
        target_uuid,
      })
    }
  }

  const unblockPlayer = (target_uuid: string) => {
    if (target_uuid) {
      sendMessage({
        type: "unblock_player",
        target_uuid,
      })
    }
  }

  const makeAdmin = (target_uuid: string) => {
    if (target_uuid) {
      sendMessage({
        type: "make_admin",
        target_uuid,
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
              className="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 h-9 cursor-pointer"
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
                className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 h-9 cursor-pointer"
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
                className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 h-9 cursor-pointer"
              >
                👤 Reset / Choose Name
              </Button>
            </Link>
          </div>
        </div>

        {/* Seating / Players List */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800/40">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-400" /> Room Seating & Status
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                MAX 200 PLAYERS
              </span>
            </h2>
            
            {/* Simple Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search player name or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-650 pl-9 focus-visible:ring-rose-500/50 focus-visible:border-rose-500/50 h-10 text-sm font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {roomStore.value?.players && roomStore.value.players.length > 0 ? (
              (() => {
                const filtered = roomStore.value.players.filter((pn) => {
                  const nameToSearch = pn.is_blocked ? `Blocked Session (${pn.uuid})` : pn.name;
                  return nameToSearch.toLowerCase().includes(searchQuery.toLowerCase());
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 space-y-1">
                      <p className="text-xs text-slate-500 font-medium">No matching players found</p>
                    </div>
                  );
                }

                return filtered.map((pn) => {
                  const isOccupied = !!pn.uuid
                  const isBlocked = !!pn.is_blocked
                  const isAdmin = !!pn.is_admin

                  const displayName = isBlocked 
                    ? `Blocked Session (${pn.uuid.substring(0, 8)}...)` 
                    : pn.name || "(Vacant Player Slot)";

                  // Determine badge colors & text
                  let badgeText = "Vacant";
                  let badgeStyle = "bg-slate-800/60 text-slate-500 border border-slate-700/40";

                  if (isBlocked) {
                    badgeText = "Blocked";
                    badgeStyle = "bg-rose-500/15 text-rose-400 border border-rose-500/30";
                  } else if (isAdmin) {
                    badgeText = "Admin";
                    badgeStyle = "bg-violet-500/15 text-violet-400 border border-violet-500/30";
                  } else if (isOccupied) {
                    badgeText = "Active";
                    badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  }

                  return (
                    <Dialog key={pn.uuid || pn.name}>
                      <DialogTrigger asChild>
                        <Card className={`p-4 bg-slate-950/30 border transition-all cursor-pointer flex justify-between items-center group ${
                          isBlocked 
                            ? "border-rose-950 bg-rose-950/5 hover:border-rose-800" 
                            : "border-slate-800/80 hover:border-slate-700/80"
                        }`}>
                          <span className={`font-semibold text-sm tracking-wide ${isBlocked ? "text-rose-400" : "text-slate-200"}`}>
                            {displayName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}`}>
                              {badgeText}
                            </span>
                          </div>
                        </Card>
                      </DialogTrigger>
                      
                      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm rounded-xl">
                        <div className="space-y-4 text-center py-4">
                          <div className={`inline-flex p-3 rounded-full border mb-2 ${
                            isBlocked 
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}>
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <DialogTitle className="text-xl font-bold text-center">
                            {isBlocked ? "Unblock Session" : `Manage Player: ${pn.name || "Vacant Slot"}`}
                          </DialogTitle>
                          <DialogDescription className="text-slate-400 text-xs">
                            {isBlocked 
                              ? "Restore access for this device uuid so they can join with a new name."
                              : isOccupied
                                ? "Control connectivity and access rights for this player."
                                : "No player has claimed this slot yet."
                            }
                          </DialogDescription>
                          
                          <div className="flex flex-col gap-2 pt-3">
                            {isBlocked ? (
                              <Button 
                                onClick={() => unblockPlayer(pn.uuid)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-1.5 h-10 cursor-pointer"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                Unblock Session
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  onClick={() => clearPlayer(pn.uuid, pn.name)}
                                  variant="destructive"
                                  className="bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center justify-center gap-1.5 h-10 cursor-pointer"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Evict / Clear Seat
                                </Button>
                                <Button 
                                  disabled={!isOccupied}
                                  onClick={() => blockPlayer(pn.uuid)}
                                  variant="outline"
                                  className="bg-slate-950 border-slate-800 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/50 text-slate-400 flex items-center justify-center gap-1.5 h-10 cursor-pointer"
                                >
                                  <Ban className="w-4 h-4" />
                                  Block & Clear Name
                                </Button>
                                {!isAdmin && isOccupied && (
                                  <Button 
                                    onClick={() => makeAdmin(pn.uuid)}
                                    variant="outline"
                                    className="bg-slate-950 border-slate-800 hover:bg-violet-950/20 hover:text-violet-400 hover:border-violet-900/50 text-slate-400 flex items-center justify-center gap-1.5 h-10 cursor-pointer"
                                  >
                                    <ShieldCheck className="w-4 h-4" />
                                    Promote to Admin
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                });
              })()
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

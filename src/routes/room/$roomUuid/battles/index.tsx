import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Swords, ArrowLeft, Tv, ShieldAlert } from "lucide-react"

export const Route = createFileRoute("/room/$roomUuid/battles/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()

  // Retrieve battles array from roomStore JSON data
  const arena = (roomStore.value?.data as any)?.arena as any
  const isArenaActive = arena?.status === "active"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/room/$roomUuid"
          params={{ roomUuid }}
          search={{ code: roomStore.code ?? "" }}
          className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Lobby
        </Link>
      </div>

      {/* Battles Container Card */}
      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 mb-2">
            <Swords className="w-8 h-8 animate-pulse text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-200 to-rose-400 bg-clip-text text-transparent">
            Spectator Arena
          </h1>
          <p className="text-slate-400 text-xs px-4">
            Watch live 1v1 gridlock memory matchups happening in this room!
          </p>
        </div>

        {/* Live Battles List */}
        <div className="space-y-4 pt-2 text-left">
          {isArenaActive ? (
            <div
              className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-cyan-500/30 transition-all shadow-inner"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-sky-400">{arena?.player1?.name || "Player 1"}</span>
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase px-1.5 py-0.5 rounded-sm border border-slate-800 bg-slate-900">VS</span>
                  <span className="font-semibold text-sm text-pink-400">{arena?.player2?.name || "Player 2"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Difficulty: {arena?.difficulty}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Live Match</span>
                </div>
              </div>

              <Link
                to="/room/$roomUuid/battles/$battleId"
                params={{ roomUuid, battleId: "arena" }}
                search={{ code: roomStore.code ?? "" }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95"
              >
                <Tv className="w-3.5 h-3.5" />
                Spectate Live Duel
              </Link>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 space-y-3">
              <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold">No active 1v1 Arena match</p>
                <p className="text-[10px] text-slate-500 px-8">
                  Waiting for the host/administrator to start the next 1v1 Arena event!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

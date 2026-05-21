import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link } from "@tanstack/react-router"
import { type Transition } from "motion/react"
import * as motion from "motion/react-client"
import { Trophy, Medal, Timer, Award, ArrowLeft } from "lucide-react"

const spring: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 100,
}

export const Route = createFileRoute("/room/$roomUuid/scorers")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>) => ({
    code: search.code ?? "",
    token: search.token ?? "",
  }),
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()
  const search = Route.useSearch()

  const filtered = roomStore.value?.players.filter((pn) => pn.score && !pn.is_blocked) ?? []
  const sorted = [...filtered].sort((a, b) => b.score - a.score).slice(0, 5)

  const boyTotal = filtered.filter(p => p.team === "boy").reduce((sum, p) => sum + p.score, 0)
  const girlTotal = filtered.filter(p => p.team === "girl").reduce((sum, p) => sum + p.score, 0)
  const leading = boyTotal > girlTotal ? "boy" : girlTotal > boyTotal ? "girl" : "tie"

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
      case 1:
        return <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]" />
      default:
        return <span className="font-mono font-bold text-slate-500 w-6 text-center text-sm">#{index + 1}</span>
    }
  }

  const getRankStyles = (index: number) => {
    switch (index) {
      case 0:
        return "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
      case 1:
        return "border-slate-400/20 bg-slate-400/5 hover:border-slate-400/40"
      case 2:
        return "border-amber-700/20 bg-amber-700/5 hover:border-amber-700/40"
      default:
        return "border-slate-800 bg-slate-950/20 hover:border-slate-700"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/room/$roomUuid"
          params={{ roomUuid }}
          search={search}
          className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Lobby
        </Link>
      </div>

      {/* Leaderboard Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
            Lobby Leaders
          </h1>
          <p className="text-slate-400 text-xs px-4">
            The quickest minds and highest scores in the current active room.
          </p>
        </div>

        {/* Team Totals Banner */}
        {(boyTotal > 0 || girlTotal > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {/* Team Boy */}
            <div className={`relative flex flex-col items-center gap-1 p-4 rounded-xl border transition-all ${
              leading === "boy"
                ? "border-sky-500/50 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                : "border-slate-800 bg-slate-950/30"
            }`}>
              {leading === "boy" && (
                <span className="absolute -top-2.5 text-base">👑</span>
              )}
              <span className="text-2xl">👦</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">Team Boy</span>
              <span className="font-black text-xl text-sky-300 font-mono">{boyTotal.toLocaleString()}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">total pts</span>
            </div>

            {/* Team Girl */}
            <div className={`relative flex flex-col items-center gap-1 p-4 rounded-xl border transition-all ${
              leading === "girl"
                ? "border-pink-500/50 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.1)]"
                : "border-slate-800 bg-slate-950/30"
            }`}>
              {leading === "girl" && (
                <span className="absolute -top-2.5 text-base">👑</span>
              )}
              <span className="text-2xl">👧</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-400">Team Girl</span>
              <span className="font-black text-xl text-pink-300 font-mono">{girlTotal.toLocaleString()}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">total pts</span>
            </div>
          </div>
        )}

        {/* Podium List */}
        <div className="space-y-3">
          {sorted.length > 0 ? (
            sorted.map((pn, i) => (
              <motion.div
                key={pn.uuid}
                layout
                transition={spring}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${getRankStyles(i)}`}
              >
                <div className="flex items-center gap-3.5">
                  {getRankBadge(i)}
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200 tracking-wide text-sm">
                      {pn.name}
                    </span>
                    {pn.time && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Timer className="w-3 h-3" /> {pn.time}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="font-extrabold text-slate-100 text-lg tracking-tight font-mono">
                    {pn.score}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider ml-1">pts</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 space-y-2">
              <Award className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No scores submitted yet in this room</p>
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

import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Swords, ArrowLeft, Tv, Trophy } from "lucide-react"
import { availableIcons } from "@/features/memory-game/const"
import { RenderIcon } from "@/components/RenderIcon"

export const Route = createFileRoute("/room/$roomUuid/battles/$battleId")({
  component: RouteComponent,
})

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(array: T[], seed: number = 1): T[] {
  const rand = seed === 0 ? Math.random : mulberry32(seed)
  const arrCopy = [...array]

  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]]
  }
  return arrCopy
}

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()

  // 🏡 Persistent side-by-side view fallback for empty room/idle state
  const defaultArena = {
    status: "idle",
    difficulty: "normal",
    seed: 1234,
    player1: { uuid: null, name: "", state: { score: 0, timer: "0.00", show: [], finished: false } },
    player2: { uuid: null, name: "", state: { score: 0, timer: "0.00", show: [], finished: false } },
    winner: null,
  }

  const arena = (roomStore.value?.data as any)?.arena as any || defaultArena

  const battle = {
    id: "arena",
    difficulty: arena.difficulty || "normal",
    seed: arena.seed || 1234,
    status: arena.status || "idle",
    challenger_uuid: arena.player1?.uuid,
    challenged_uuid: arena.player2?.uuid,
    challenger_name: arena.player1?.name || "",
    challenged_name: arena.player2?.name || "",
    challenger_state: arena.player1?.state,
    challenged_state: arena.player2?.state,
    winner: arena.winner,
  }

  // Pre-generate tile icons layout based on the battle seed and difficulty
  const battleN = battle.difficulty === "easy" ? 6 : battle.difficulty === "normal" ? 8 : 10
  const initialSeed = battle.seed !== 0 ? battle.seed : 1234
  const getAvailableIcons = shuffle(availableIcons, initialSeed).slice(0, battleN)
  const cardsLayout = shuffle(getAvailableIcons.concat(getAvailableIcons), initialSeed)

  const challengerState = battle.challenger_state || { score: 0, timer: "0.00", show: [], finished: false }
  const challengedState = battle.challenged_state || { score: 0, timer: "0.00", show: [], finished: false }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col px-4 md:px-8 py-6 relative overflow-hidden select-none">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/room/$roomUuid"
            params={{ roomUuid }}
            search={{ code: roomStore.code ?? "" }}
            className="inline-flex items-center justify-center p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-violet-200 to-rose-400 bg-clip-text text-transparent">
              <Tv className="w-5 h-5 text-cyan-400 animate-pulse" /> Live Spectate View
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              BATTLE ID: {battle.id} | Mode: {battle.difficulty} | Status: {battle.status}
            </p>
          </div>
        </div>

        {/* Global Swords Icon */}
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-widest self-start md:self-auto animate-pulse">
          <Swords className="w-4 h-4" />
          Live Match Arena
        </div>
      </header>

      {/* 🏆 Cumulative Team Standings Banner */}
      {(() => {
        const teamScores = (roomStore.value?.data as any)?.team_scores || { boy: 0, girl: 0 }
        const boyScore = teamScores.boy || 0
        const girlScore = teamScores.girl || 0
        const totalPoints = boyScore + girlScore
        const boyPercent = totalPoints > 0 ? (boyScore / totalPoints) * 100 : 50
        const girlPercent = totalPoints > 0 ? (girlScore / totalPoints) * 100 : 50

        return (
          <div className="w-full max-w-4xl mx-auto mb-6 bg-slate-900/40 border border-slate-900 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xs relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <Trophy className="w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                  Team Tournament Scoreboard
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Grand Arena Standings (1 Point Per Match Win)
                </p>
              </div>
            </div>

            {/* Scores Side-by-Side with Progress Bar in Center */}
            <div className="flex-1 flex items-center justify-center gap-6 w-full md:w-auto font-sans">
              {/* Boy Score */}
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider block">Team Mateus 👦</span>
                <span className="text-xl font-black text-slate-100 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                  {boyScore} <span className="text-[9px] text-slate-500 font-bold font-sans">PTS</span>
                </span>
              </div>

              {/* Progress VS bar */}
              <div className="flex-1 max-w-[200px] space-y-1">
                <div className="h-2.5 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500" 
                    style={{ width: `${boyPercent}%` }}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500" 
                    style={{ width: `${girlPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-widest">
                  <span>{boyPercent.toFixed(0)}%</span>
                  <span className="text-[7px] text-slate-650 font-extrabold animate-pulse">VS</span>
                  <span>{girlPercent.toFixed(0)}%</span>
                </div>
              </div>

              {/* Girl Score */}
              <div className="text-left">
                <span className="text-[9px] font-black uppercase text-pink-400 tracking-wider block">Team Meira 👧</span>
                <span className="text-xl font-black text-slate-100 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                  {girlScore} <span className="text-[9px] text-slate-500 font-bold font-sans">PTS</span>
                </span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Completed Match Announcement Banner */}
      {battle.status === "completed" && (
        <div className="w-full max-w-4xl mx-auto mb-6 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 shadow-2xl relative overflow-hidden backdrop-blur-md animate-in fade-in zoom-in duration-500 z-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-violet-500 to-rose-500" />
          <Trophy className="w-10 h-10 text-amber-400 animate-bounce mb-1" />
          <h2 className="text-xl font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent uppercase tracking-wider">
            Match Completed!
          </h2>
          <p className="text-xs font-bold text-slate-200">
            {battle.winner === battle.challenger_uuid ? (
              <span>
                🏆 <strong className="text-sky-400">{battle.challenger_name || "Player 1"}</strong> won the battle against <strong className="text-slate-400">{battle.challenged_name || "Player 2"}</strong>!
              </span>
            ) : battle.winner === battle.challenged_uuid ? (
              <span>
                🏆 <strong className="text-pink-400">{battle.challenged_name || "Player 2"}</strong> won the battle against <strong className="text-slate-400">{battle.challenger_name || "Player 1"}</strong>!
              </span>
            ) : (
              <span>The duel has ended!</span>
            )}
          </p>
        </div>
      )}

      {/* Side-by-Side Dual Boards Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">
        
        {/* Left Side: Challenger (Team Boy style colors) */}
        {(() => {
          const isSeated = !!battle.challenger_uuid
          const isWinner = battle.status === "completed" && battle.winner === battle.challenger_uuid
          const isLoser = battle.status === "completed" && battle.winner !== battle.challenger_uuid && battle.winner !== null
          
          let cardBorder = "border-slate-800/80 bg-slate-900/40"
          let topBarColor = "bg-sky-500/80"
          let badge = null
          
          if (!isSeated) {
            cardBorder = "border-slate-850 border-dashed bg-slate-950/20 opacity-40"
            topBarColor = "bg-slate-800"
            badge = <span className="text-[8px] font-bold text-slate-650 bg-slate-900 px-1.5 py-0.5 rounded-sm uppercase tracking-wider border border-slate-800">Empty</span>
          } else if (isWinner) {
            cardBorder = "border-emerald-500 bg-emerald-950/10 shadow-[0_0_25px_rgba(16,185,129,0.15)] animate-in fade-in duration-500"
            topBarColor = "bg-emerald-500"
            badge = <span className="text-[8px] font-black text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-0.5 animate-bounce">🏆 Winner</span>
          } else if (isLoser) {
            cardBorder = "border-rose-950/50 bg-rose-950/5 opacity-40"
            topBarColor = "bg-rose-900/40"
            badge = <span className="text-[8px] font-black text-rose-450 bg-rose-950 border border-rose-550/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-0.5">💀 Defeated</span>
          } else if (battle.status === "active") {
            cardBorder = "border-sky-500 bg-slate-900/40 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
            topBarColor = "bg-sky-500"
            badge = <span className="text-[8px] font-extrabold text-sky-400 bg-sky-950 border border-sky-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1 animate-pulse">● Live</span>
          } else {
            // Preparing
            cardBorder = "border-slate-805 bg-slate-900/20"
            topBarColor = "bg-sky-500/30"
            badge = <span className="text-[8px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Ready</span>
          }
          
          return (
            <div className={`flex flex-col border rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-4 transition-all duration-300 ${cardBorder}`}>
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${topBarColor}`} />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isSeated ? "👤" : "💤"}</span>
                  <div className="flex flex-col">
                    <span className={`font-extrabold text-sm ${isSeated ? "text-sky-400" : "text-slate-500"}`}>
                      {battle.challenger_name || "Waiting for Player..."}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      {isSeated ? "Challenger (Slot 1)" : "Vacant Seat"}
                    </span>
                  </div>
                </div>
                {badge}
              </div>

              {/* Challenger Mini Grid */}
              <div className="flex-1 flex items-center justify-center py-4">
                <div className={`grid gap-2 w-full max-w-sm ${
                  battleN === 6 ? "grid-cols-3" : "grid-cols-4"
                }`}>
                  {cardsLayout.map((el, i) => {
                    const isRevealed = challengerState.show?.[i]
                    return (
                      <div
                        key={i}
                        className={`h-14 sm:h-16 rounded-xl border flex items-center justify-center transition-all ${
                          isRevealed
                            ? "bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.15)]"
                            : "bg-slate-950/60 border-slate-850 text-slate-700"
                        }`}
                      >
                        {isRevealed ? (
                          <RenderIcon name={el} size={20} />
                        ) : (
                          <span className="font-bold text-[10px] opacity-25">?</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Right Side: Challenged Player (Team Girl style colors) */}
        {(() => {
          const isSeated = !!battle.challenged_uuid
          const isWinner = battle.status === "completed" && battle.winner === battle.challenged_uuid
          const isLoser = battle.status === "completed" && battle.winner !== battle.challenged_uuid && battle.winner !== null
          
          let cardBorder = "border-slate-800/80 bg-slate-900/40"
          let topBarColor = "bg-pink-500/80"
          let badge = null
          
          if (!isSeated) {
            cardBorder = "border-slate-850 border-dashed bg-slate-950/20 opacity-40"
            topBarColor = "bg-slate-800"
            badge = <span className="text-[8px] font-bold text-slate-655 bg-slate-900 px-1.5 py-0.5 rounded-sm uppercase tracking-wider border border-slate-800">Empty</span>
          } else if (isWinner) {
            cardBorder = "border-emerald-500 bg-emerald-950/10 shadow-[0_0_25px_rgba(16,185,129,0.15)] animate-in fade-in duration-500"
            topBarColor = "bg-emerald-500"
            badge = <span className="text-[8px] font-black text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-0.5 animate-bounce">🏆 Winner</span>
          } else if (isLoser) {
            cardBorder = "border-rose-950/50 bg-rose-950/5 opacity-40"
            topBarColor = "bg-rose-900/40"
            badge = <span className="text-[8px] font-black text-rose-455 bg-rose-950 border border-rose-550/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-0.5">💀 Defeated</span>
          } else if (battle.status === "active") {
            cardBorder = "border-pink-500 bg-slate-900/40 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
            topBarColor = "bg-pink-500"
            badge = <span className="text-[8px] font-extrabold text-pink-400 bg-pink-950 border border-pink-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1 animate-pulse">● Live</span>
          } else {
            // Preparing
            cardBorder = "border-slate-805 bg-slate-900/20"
            topBarColor = "bg-pink-500/30"
            badge = <span className="text-[8px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Ready</span>
          }
          
          return (
            <div className={`flex flex-col border rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-4 transition-all duration-300 ${cardBorder}`}>
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${topBarColor}`} />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isSeated ? "👤" : "💤"}</span>
                  <div className="flex flex-col">
                    <span className={`font-extrabold text-sm ${isSeated ? "text-pink-400" : "text-slate-500"}`}>
                      {battle.challenged_name || "Waiting for Player..."}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      {isSeated ? "Defender (Slot 2)" : "Vacant Seat"}
                    </span>
                  </div>
                </div>
                {badge}
              </div>

              {/* Defender Mini Grid */}
              <div className="flex-1 flex items-center justify-center py-4">
                <div className={`grid gap-2 w-full max-w-sm ${
                  battleN === 6 ? "grid-cols-3" : "grid-cols-4"
                }`}>
                  {cardsLayout.map((el, i) => {
                    const isRevealed = challengedState.show?.[i]
                    return (
                      <div
                        key={i}
                        className={`h-14 sm:h-16 rounded-xl border flex items-center justify-center transition-all ${
                          isRevealed
                            ? "bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.15)]"
                            : "bg-slate-950/60 border-slate-850 text-slate-700"
                        }`}
                      >
                        {isRevealed ? (
                          <RenderIcon name={el} size={20} />
                        ) : (
                          <span className="font-bold text-[10px] opacity-25">?</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}
        
      </div>
    </div>
  )
}

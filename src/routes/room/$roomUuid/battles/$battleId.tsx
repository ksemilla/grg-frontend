import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useEffect } from "react"
import { Swords, ArrowLeft, Tv } from "lucide-react"
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
  const navigate = useNavigate()

  const arena = (roomStore.value?.data as any)?.arena as any
  const battle = arena ? {
    id: "arena",
    difficulty: arena.difficulty,
    seed: arena.seed,
    status: arena.status,
    challenger_name: arena.player1.name,
    challenged_name: arena.player2.name,
    challenger_state: arena.player1.state,
    challenged_state: arena.player2.state,
  } : null

  // Auto redirect back to battle list once match finishes or is deleted
  useEffect(() => {
    if (!battle || battle.status === "completed") {
      const timerId = setTimeout(() => {
        navigate({
          to: "/room/$roomUuid/battles",
          params: { roomUuid },
        })
      }, 3000)
      return () => clearTimeout(timerId)
    }
  }, [battle, navigate, roomUuid])

  if (!battle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">Loading battle or redirecting...</p>
        </div>
      </div>
    )
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
            to="/room/$roomUuid/battles"
            params={{ roomUuid }}
            search={{ code: roomStore.code ?? "" }}
            className="inline-flex items-center justify-center p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-violet-200 to-rose-400 bg-clip-text text-transparent">
              <Tv className="w-5 h-5 text-cyan-400 animate-pulse" /> Live Spectate View
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">BATTLE ID: {battle.id} | Mode: {battle.difficulty}</p>
          </div>
        </div>

        {/* Global Swords Icon */}
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-widest self-start md:self-auto animate-pulse">
          <Swords className="w-4 h-4" />
          Live Match Arena
        </div>
      </header>

      {/* Side-by-Side Dual Boards Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">
        {/* Left Side: Challenger (Team Boy style colors) */}
        <div className="flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500/80" />
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-sky-400">{battle.challenger_name}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Challenger</span>
              </div>
            </div>
          </div>

          {/* Challenger Mini Preview Grid */}
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

        {/* Right Side: Challenged Player (Team Girl style colors) */}
        <div className="flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-pink-500/80" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-pink-400">{battle.challenged_name}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Defender</span>
              </div>
            </div>
          </div>

          {/* Defender Mini Preview Grid */}
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
      </div>
    </div>
  )
}

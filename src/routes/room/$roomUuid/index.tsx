import { useMessage } from "@/components/message-provider"
import { MemoryGame } from "@/features/memory-game/memory-game"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  Play,
  Trophy,
  Timer,
  Sparkles,
  Swords,
  Gauge,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type RoomSearchParams = {
  code?: string
}

export const Route = createFileRoute("/room/$roomUuid/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>): RoomSearchParams => {
    return {
      code: search.code ?? "",
    }
  },
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()
  const myUuid = localStorage.getItem("uuid")
  const myPlayer = roomStore.value?.players.find((p) => p.uuid === myUuid)
  const name = myPlayer?.name || ""

  const navigate = useNavigate()
  const { sendMessage } = useMessage()

  // State to track if the player is actively playing
  const [isPlaying, setIsPlaying] = useState(false)
  const [nPairs, setNPairs] = useState<6 | 8 | 10>(6) // Default 6 pairs (12 tiles)
  const [shareMsg, setShareMsg] = useState("")
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false)

  // Read previous score from local storage
  const [prevScore, setPrevScore] = useState<string | null>(null)
  const [prevTime, setPrevTime] = useState<string | null>(null)

  useEffect(() => {
    setPrevScore(localStorage.getItem("prev_score"))
    setPrevTime(localStorage.getItem("prev_time"))
  }, [isPlaying])

  useEffect(() => {
    if (!roomStore.code) {
      navigate({
        to: "/room/$roomUuid/enter",
        params: { roomUuid },
        search: {
          token: roomStore.token,
        },
      })
    } else if (roomStore.value && !myPlayer) {
      navigate({
        to: "/room/$roomUuid/set-name",
        params: {
          roomUuid: roomUuid,
        },
        search: { code: roomStore.code },
      })
    }
  }, [myPlayer, roomStore.code, roomStore.value, roomUuid])

  const onScore = (data: { score: number; time: string }) => {
    const { score, time } = data

    // Save to local storage for menu rendering
    localStorage.setItem("prev_score", String(score))
    localStorage.setItem("prev_time", time)

    sendMessage({
      type: "add_score",
      uuid: localStorage.getItem("uuid"),
      score,
      time,
    })
  }

  const onBackToLobby = () => {
    // Return to Lobby menu
    setIsPlaying(false)
  }

  const handleStartGame = (pairs: 6 | 8 | 10) => {
    setNPairs(pairs)
    setIsDiffModalOpen(false)
    setIsPlaying(true)
  }

  const handleShareChallenge = () => {
    const challengeUrl = `${window.location.origin}/room/${roomUuid}/`
    navigator.clipboard.writeText(challengeUrl).then(() => {
      setShareMsg("Lobby link copied to clipboard!")
      setTimeout(() => setShareMsg(""), 3000)
    })
  }

  if (!roomStore.code || !name) return

  // Read team from DB if loaded, falling back to local storage
  const team = myPlayer?.team || localStorage.getItem("team") || ""

  const handleSwitchTeam = () => {
    const nextTeam = team === "boy" ? "girl" : "boy"
    const playerUuid = localStorage.getItem("uuid")
    if (playerUuid) {
      localStorage.setItem("team", nextTeam)
      sendMessage({
        type: "switch_team",
        uuid: playerUuid,
        team: nextTeam,
      })
    }
  }

  const getTeamStyles = () => {
    if (team === "boy") {
      return {
        text: "text-sky-400 font-extrabold",
        badge:
          "bg-sky-500/10 text-sky-400 border-sky-500/25 hover:border-sky-500/50 hover:bg-sky-500/15",
        label: "👦 Team Boy",
      }
    }
    if (team === "girl") {
      return {
        text: "text-pink-400 font-extrabold",
        badge:
          "bg-pink-500/10 text-pink-400 border-pink-500/25 hover:border-pink-500/50 hover:bg-pink-500/15",
        label: "👧 Team Girl",
      }
    }
    return {
      text: "text-violet-400 font-semibold",
      badge: "hidden",
      label: "",
    }
  }

  const teamStyles = getTeamStyles()

  // 🎮 RENDER ACTIVE GAME SCREEN
  if (isPlaying) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Info Pill */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 text-xs shadow-lg shadow-black/30">
            <span className="text-slate-400 flex items-center gap-2">
              Playing as: <strong className={teamStyles.text}>{name}</strong>
              {team && (
                <button
                  onClick={handleSwitchTeam}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border transition-all cursor-pointer flex items-center gap-1 ${teamStyles.badge}`}
                  title="Click to switch teams!"
                  type="button"
                >
                  {teamStyles.label}{" "}
                  <span className="text-[8px] opacity-60">⇄</span>
                </button>
              )}
            </span>
          </div>
        </div>

        {/* The Game Board */}
        <div className="w-full max-w-4xl z-10 animate-in fade-in duration-500 flex flex-col items-center">
          <MemoryGame
            onScore={onScore}
            onBackToLobby={onBackToLobby}
            n={nPairs}
          />
        </div>
      </div>
    )
  }

  // 🏡 RENDER LOBBY / MENU SCREEN
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Info Pill */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 text-xs shadow-lg shadow-black/30">
          <span className="text-slate-400 flex items-center gap-2">
            Claimed Seat:{" "}
            <Link
              to="/room/$roomUuid/set-name"
              params={{ roomUuid }}
              search={{ code: roomStore.code ?? "" }}
              className="hover:underline transition-all flex items-center gap-1 cursor-pointer"
              title="Click to change your display name!"
            >
              <strong className={teamStyles.text}>{name} ✎</strong>
            </Link>
            {team && (
              <button
                onClick={handleSwitchTeam}
                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border transition-all cursor-pointer flex items-center gap-1 ${teamStyles.badge}`}
                title="Click to switch teams!"
                type="button"
              >
                {teamStyles.label}{" "}
                <span className="text-[8px] opacity-60">⇄</span>
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Main Lobby Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 mb-2">
            <Sparkles className="w-8 h-8 animate-pulse text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Gridlock Game Lobby
          </h1>
          <p className="text-slate-400 text-xs px-4">
            Test your memory, claim your high score, and compete with friends!
          </p>
        </div>

        {/* Previous Score Display */}
        {prevScore && (
          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Previous Run
                </span>
                <span className="font-semibold text-slate-200 text-xs">
                  Score: {prevScore} pts
                </span>
              </div>
            </div>
            {prevTime && (
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <Timer className="w-3.5 h-3.5 text-violet-400" /> {prevTime}
              </span>
            )}
          </div>
        )}

        {/* Lobby Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Start New Game (Difficulty Selection Trigger) */}
          <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-12 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 group text-sm cursor-pointer">
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                Start New Game
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md rounded-2xl shadow-2xl p-6">
              <div className="space-y-5 py-2">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 mb-1.5">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <DialogTitle className="text-xl font-bold">
                    Select Difficulty
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs">
                    Choose how many memory tiles you want to match!
                  </DialogDescription>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {/* Easy Mode */}
                  <button
                    onClick={() => handleStartGame(6)}
                    className="w-full p-4 bg-slate-950/60 border border-slate-850 hover:bg-emerald-500/10 hover:border-emerald-500/30 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider">
                        🟢 Easy Mode
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Quick and casual memory matchup
                      </span>
                    </div>
                    <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 font-bold group-hover:text-emerald-400 transition-colors">
                      12 Tiles
                    </span>
                  </button>

                  {/* Normal Mode */}
                  <button
                    onClick={() => handleStartGame(8)}
                    className="w-full p-4 bg-slate-950/60 border border-slate-850 hover:bg-violet-500/10 hover:border-violet-500/30 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold uppercase text-violet-400 tracking-wider">
                        🔵 Normal Mode
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Standard gridlock memory challenge
                      </span>
                    </div>
                    <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 font-bold group-hover:text-violet-400 transition-colors">
                      16 Tiles
                    </span>
                  </button>

                  {/* Hard Mode */}
                  <button
                    onClick={() => handleStartGame(10)}
                    className="w-full p-4 bg-slate-950/60 border border-slate-850 hover:bg-amber-500/10 hover:border-amber-500/30 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                        🔥 Hard Mode
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Test your maximum recall potential
                      </span>
                    </div>
                    <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 font-bold group-hover:text-amber-400 transition-colors">
                      20 Tiles
                    </span>
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* See High Scores */}
              <Link
                to="/room/$roomUuid/scorers"
                params={{ roomUuid }}
                search={{
                  code: roomStore.code ?? "",
                  token: roomStore.token ?? "",
                }}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full h-10 bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-violet-500/30 text-slate-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  High Scores
                </Button>
              </Link>

              {/* Challenge Button (Share link) */}
              <Button
                onClick={handleShareChallenge}
                variant="outline"
                className="w-full h-10 bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-cyan-500/30 text-slate-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5 text-cyan-500" />
                Challenge Friend
              </Button>
            </div>

            {/* Change Name Link */}
            <Link
              to="/room/$roomUuid/set-name"
              params={{ roomUuid }}
              search={{ code: roomStore.code ?? "" }}
              className="block w-full"
            >
              <Button
                variant="outline"
                className="w-full h-10 bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-fuchsia-500/30 text-slate-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-fuchsia-500" />
                Change Display Name
              </Button>
            </Link>
          </div>
        </div>

        {/* Challenge Copy Notice */}
        {shareMsg && (
          <p className="text-center text-[10px] text-cyan-400 font-semibold animate-pulse mt-2">
            {shareMsg}
          </p>
        )}
      </div>

      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        ROOM ID: {roomUuid}
      </p>
    </div>
  )
}

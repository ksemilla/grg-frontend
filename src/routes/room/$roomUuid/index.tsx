import { useMessage } from "@/components/message-provider"
import { MemoryGame } from "@/features/memory-game/memory-game"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useEffect, useState, useCallback } from "react"
import {
  Play,
  Trophy,
  Timer,
  Sparkles,
  Swords,
  Gauge,
  User,
  Tv,
  QrCode,
  Copy,
  Check,
  Users,
} from "lucide-react"
import QRCode from "react-qr-code"
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
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false)

  // 👥 Lobby Share and Invitation States
  const [copied, setCopied] = useState(false)
  const [isQrOpen, setIsQrOpen] = useState(false)

  const shareUrl = `${window.location.origin}/room/${roomUuid}${roomStore.code ? `?code=${roomStore.code}` : ""}`

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareUrl])

  // ⚔️ 1v1 Arena State Hooks
  const [isMinimized, setIsMinimized] = useState(false)

  const arena = (roomStore.value?.data as any)?.arena as any
  const isPlayer1 = arena?.player1?.uuid === myUuid
  const isPlayer2 = arena?.player2?.uuid === myUuid
  const mySlot = isPlayer1 ? "player1" : isPlayer2 ? "player2" : null
  const opponentSlot = isPlayer1 ? "player2" : isPlayer2 ? "player1" : null
  const opponentName = opponentSlot ? (arena?.[opponentSlot]?.name || "Opponent") : "Opponent"
  
  const isSeated = !!mySlot
  const myPlayerIsAdmin = roomStore.value?.players.find(p => p.uuid === myUuid)?.is_admin ?? false
  const isAdmin = roomStore.isAdmin || myPlayerIsAdmin
  
  const activeBattle = arena?.status === "active" && isSeated ? arena : null
  const completedBattle = arena?.status === "completed" && isSeated ? arena : null

  // Automatically open the game board when a new duel begins
  useEffect(() => {
    if (activeBattle) {
      setIsMinimized(false)
    }
  }, [activeBattle?.status])

  // Read previous score from local storage
  const [prevScore, setPrevScore] = useState<string | null>(null)
  const [prevTime, setPrevTime] = useState<string | null>(null)

  useEffect(() => {
    setPrevScore(localStorage.getItem("prev_score"))
    setPrevTime(localStorage.getItem("prev_time"))
  }, [isPlaying])

  // Automatically vacate seat and return to lobby 6 seconds after match finishes
  useEffect(() => {
    if (completedBattle) {
      const timerId = setTimeout(() => {
        sendMessage({
          type: "decline_arena_invite",
          uuid: myUuid,
        })
      }, 6000)
      return () => clearTimeout(timerId)
    }
  }, [completedBattle, sendMessage, myUuid])

  useEffect(() => {
    if (!roomStore.code) {
      navigate({
        to: "/room/$roomUuid/enter",
        params: { roomUuid },
        search: {
          token: roomStore.token,
        },
      })
    } else if (roomStore.value && !myPlayer && !localStorage.getItem("name")) {
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



  const onBattleStateUpdate = useCallback((data: { score: number; timer: string; show: boolean[]; finished: boolean }) => {
    if (!activeBattle) return
    sendMessage({
      type: "update_arena_state",
      uuid: myUuid,
      score: data.score,
      timer: data.timer,
      show: data.show,
      finished: data.finished,
    })
  }, [sendMessage, activeBattle, myUuid])

  const onBattleBackToLobby = useCallback(() => {
    if (!activeBattle) return
    setTimeout(() => {
      sendMessage({
        type: "decline_arena_invite",
        uuid: myUuid,
      })
    }, 3000)
  }, [sendMessage, activeBattle, myUuid])

  const renderGlobalDialogs = () => {
    return null
  }

  // ⚔️ RENDER ACTIVE 1v1 BATTLE SCREEN
  if (activeBattle && !isMinimized) {
    const battleN = activeBattle.difficulty === "easy" ? 6 : activeBattle.difficulty === "normal" ? 8 : 10
    const isChallenger = activeBattle.challenger_uuid === myUuid
    const opponentName = isChallenger ? activeBattle.challenged_name : activeBattle.challenger_name
    
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Real-time Opponent HUD Tracker */}
        <div className="w-full max-w-4xl z-10 flex flex-col items-center mb-2 px-2">
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-xl mb-4 gap-3 sm:gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                <Swords className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">
                  Active 1v1 Battle Mode
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  VS <strong className="text-rose-400">{opponentName}</strong>
                </span>
              </div>
            </div>

            {/* Forfeit and Minimize Actions */}
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
              <Button
                onClick={() => setIsMinimized(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-350 border border-slate-750 px-3 py-1.5 h-auto text-[10px] font-extrabold uppercase rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                Exit to Lobby 🏠
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Are you sure you want to forfeit this match and accept defeat?")) {
                    sendMessage({
                      type: "update_arena_state",
                      uuid: myUuid,
                      forfeit: true,
                    })
                  }
                }}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 h-auto text-[10px] font-extrabold uppercase rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                Forfeit 🏳️
              </Button>
            </div>
          </div>

          {/* The Game Board */}
          <MemoryGame
            n={battleN}
            seed={activeBattle.seed}
            onBattleStateUpdate={onBattleStateUpdate}
            onBackToLobby={onBattleBackToLobby}
          />
        </div>
      </div>
    )
  }

  // 🏆 RENDER COMPLETED 1v1 BATTLE RESULT SCREEN
  if (completedBattle) {
    const isWinner = completedBattle.winner === myUuid
    
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none animate-pulse ${
          isWinner ? "bg-emerald-500/10" : "bg-rose-500/10"
        }`} />

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 text-center space-y-6">
          <div className={`inline-flex p-4 rounded-2xl border mb-2 ${
            isWinner ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-bounce" : "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse"
          }`}>
            {isWinner ? <Trophy className="w-10 h-10" /> : <Swords className="w-10 h-10 animate-pulse" />}
          </div>
          
          <div className="space-y-2">
            <h1 className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
              isWinner ? "from-emerald-400 to-teal-500" : "from-rose-400 to-red-500"
            }`}>
              {isWinner ? "🏆 VICTORY!" : "💀 DEFEAT!"}
            </h1>
            <p className="text-slate-400 text-xs px-4">
              {isWinner 
                ? `Incredible recall! You defeated ${opponentName} in the head-to-head match!`
                : `${opponentName} matched their tiles faster. Better luck next time!`
              }
            </p>
          </div>

          <Button
            onClick={() => {
              sendMessage({
                type: "decline_arena_invite",
                uuid: myUuid,
              })
            }}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer text-xs"
          >
            Exit Arena
          </Button>
        </div>
        {renderGlobalDialogs()}
      </div>
    )
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
        label: "👦 Team Mateus",
      }
    }
    if (team === "girl") {
      return {
        text: "text-pink-400 font-extrabold",
        badge:
          "bg-pink-500/10 text-pink-400 border-pink-500/25 hover:border-pink-500/50 hover:bg-pink-500/15",
        label: "👧 Team Meira",
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
        <div className="absolute top-4 left-4 right-4 sm:right-auto max-w-[calc(100%-2rem)] z-20">
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
        {renderGlobalDialogs()}
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
      <div className="absolute top-4 left-4 right-4 sm:right-auto max-w-[calc(100%-2rem)] z-20">
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

      {/* Active Battle Banner */}
      {activeBattle && (
        <div className="w-full max-w-md bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-6 flex flex-col gap-3 backdrop-blur-md shadow-lg animate-pulse relative z-25">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚔️</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs text-amber-400 uppercase tracking-wider">Active 1v1 Battle!</span>
              <span className="text-[10px] text-slate-400">
                You have an ongoing match against <strong className="text-slate-200">{opponentName}</strong>.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsMinimized(false)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black uppercase py-2 h-auto rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              Rejoin Battle 🎮
            </Button>
            <Button
              onClick={() => {
                if (confirm("Are you sure you want to forfeit this match and accept defeat?")) {
                  sendMessage({
                    type: "update_arena_state",
                    uuid: myUuid,
                    forfeit: true,
                  })
                }
              }}
              className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 text-[10px] font-black uppercase py-2 h-auto rounded-lg cursor-pointer transition-all active:scale-95"
            >
              Forfeit Match 🏳️
            </Button>
          </div>
        </div>
      )}

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

        {/* 🏆 Cumulative Team Tournament Standings Scoreboard */}
        {(() => {
          const teamScores = (roomStore.value?.data as any)?.team_scores || { boy: 0, girl: 0 }
          const boyScore = teamScores.boy || 0
          const girlScore = teamScores.girl || 0
          const totalPoints = boyScore + girlScore
          const boyPercent = totalPoints > 0 ? (boyScore / totalPoints) * 100 : 50
          const girlPercent = totalPoints > 0 ? (girlScore / totalPoints) * 100 : 50

          return (
            <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4.5 shadow-inner space-y-3 relative overflow-hidden text-left font-sans">
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Team Tournament Standings
                  </h3>
                </div>
                <span className="text-[8px] font-black bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  1 Pt / Win
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Team Boy */}
                <div className="flex flex-col items-center bg-sky-950/20 border border-sky-900/30 p-2.5 rounded-xl text-center space-y-1">
                  <span className="text-xl">👦</span>
                  <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider">Team Mateus</span>
                  <span className="text-2xl font-black text-slate-100 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                    {boyScore} <span className="text-[10px] text-slate-500 font-extrabold font-sans">PTS</span>
                  </span>
                </div>

                {/* Team Girl */}
                <div className="flex flex-col items-center bg-pink-950/20 border border-pink-900/30 p-2.5 rounded-xl text-center space-y-1">
                  <span className="text-xl">👧</span>
                  <span className="text-[9px] font-black uppercase text-pink-400 tracking-wider">Team Meira</span>
                  <span className="text-2xl font-black text-slate-100 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                    {girlScore} <span className="text-[10px] text-slate-500 font-extrabold font-sans">PTS</span>
                  </span>
                </div>
              </div>

              {/* Progress VS bar */}
              <div className="space-y-1 pt-1">
                <div className="h-2 w-full bg-slate-900 border border-slate-850 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500" 
                    style={{ width: `${boyPercent}%` }}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500" 
                    style={{ width: `${girlPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-wider">
                  <span>{boyPercent.toFixed(0)}% Mateus</span>
                  <span>{girlPercent.toFixed(0)}% Meira</span>
                </div>
              </div>
            </div>
          )
        })()}

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

        {/* ⚔️ Permanent 1v1 Arena Board Dashboard */}
        {(() => {
          if (!isAdmin && !isSeated) {
            return null
          }
          
          const p1 = arena?.player1
          const p2 = arena?.player2
          
          const p1Player = roomStore.value?.players.find((p) => p.uuid === p1?.uuid)
          const p1Team = p1Player?.team || ""
          
          const p2Player = roomStore.value?.players.find((p) => p.uuid === p2?.uuid)
          const p2Team = p2Player?.team || ""
          
          const availablePlayers = (roomStore.value?.players || []).filter(
            (p) => p.uuid !== p1?.uuid && p.uuid !== p2?.uuid && p.uuid && p.name
          )
          
          return (
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 shadow-2xl relative overflow-hidden space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Swords className={`w-4 h-4 ${arena?.status === "active" ? "text-rose-400 animate-pulse animate-bounce" : "text-slate-400"}`} />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-200">
                    1v1 Arena Match
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (arena?.status === "idle" || arena?.status === "preparing") && (
                    <button
                      onClick={() => sendMessage({ type: "swap_arena_slots" })}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[8px] font-black uppercase text-slate-300 hover:text-white hover:border-sky-500/40 rounded-md transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-md"
                      title="Swap Slot 1 & Slot 2 Players"
                      type="button"
                    >
                      ⇄ Swap Seats
                    </button>
                  )}
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                    arena?.status === "active" 
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" 
                      : arena?.status === "completed" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : arena?.status === "preparing" 
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                      : "bg-slate-900 text-slate-500 border border-slate-850"
                  }`}>
                    {arena?.status || "Idle"}
                  </span>
                </div>
              </div>

              {isAdmin && (arena?.status === "idle" || arena?.status === "preparing") && (
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-xl border border-slate-850 text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Difficulty</span>
                  <div className="flex gap-1.5">
                    {(["easy", "normal", "hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => {
                          sendMessage({
                            type: "set_arena_difficulty",
                            difficulty: diff
                          })
                        }}
                        className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase transition-all cursor-pointer ${
                          arena?.difficulty === diff
                            ? diff === "easy"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : diff === "normal"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-slate-950 border border-slate-900 text-slate-550 hover:text-slate-400"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {/* SLOT 1 (LEFT) */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 relative overflow-hidden transition-all ${
                  p1?.invite_status === "accepted"
                    ? p1.ready 
                      ? "bg-emerald-950/15 border-emerald-500/30"
                      : "bg-sky-950/15 border-sky-500/30"
                    : p1?.invite_status === "invited"
                    ? "bg-amber-950/15 border-amber-500/30 border-dashed animate-pulse"
                    : "bg-slate-900/30 border-slate-850 border-dashed"
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">Slot 1 (Team Mateus 👦)</span>
                      <h4 className="text-xs font-extrabold text-slate-200 truncate mt-0.5 max-w-[150px] flex items-center gap-1.5">
                        {p1?.name || "Unoccupied"}
                        {p1Team && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            p1Team === "boy" 
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {p1Team === "boy" ? "👦 Mateus" : "👧 Meira"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[9px] font-semibold mt-0.5">
                        {p1?.invite_status === "accepted" ? (
                          p1.ready ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">● Ready</span>
                          ) : (
                            <span className="text-sky-400 flex items-center gap-1 font-bold">
                              ● Seated
                            </span>
                          )
                        ) : p1?.invite_status === "invited" ? (
                          <span className="text-amber-400 animate-pulse">● Invited...</span>
                        ) : (
                          <span className="text-slate-600">Empty Seat</span>
                        )}
                      </p>
                    </div>

                    {p1?.uuid && isAdmin && (
                      <button
                        onClick={() => {
                          sendMessage({
                            type: "kick_from_arena",
                            slot: "player1"
                          })
                        }}
                        className="p-1 bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-850 hover:border-rose-500/30 rounded-lg transition-all cursor-pointer text-[10px]"
                        title="Kick Player"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {!p1?.uuid && isAdmin && (
                    <div className="mt-1">
                      {availablePlayers.length > 0 ? (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              sendMessage({
                                type: "invite_to_arena",
                                slot: "player1",
                                target_uuid: e.target.value,
                                difficulty: arena?.difficulty || "normal"
                              })
                              e.target.value = ""
                            }
                          }}
                          className="w-full h-8 bg-slate-950 border border-slate-850 text-[10px] font-extrabold uppercase rounded-lg px-2 text-slate-400 hover:border-sky-500/30 transition-all outline-hidden cursor-pointer"
                        >
                          <option value="">+ Seat Player 1 (Mateus Slot)...</option>
                          {availablePlayers.map((player) => {
                            const isBoy = player.team === "boy"
                            return (
                              <option key={player.uuid} value={player.uuid}>
                                {player.name || "Anonymous"} ({isBoy ? "👦 Mateus" : "👧 Meira"})
                              </option>
                            )
                          })}
                        </select>
                      ) : (
                        <p className="text-[8px] text-slate-600 italic">No available players</p>
                      )}
                    </div>
                  )}

                  {p1?.uuid === myUuid && p1?.invite_status === "accepted" && (
                    <Button
                      onClick={() => {
                        sendMessage({
                          type: "set_arena_ready",
                          uuid: myUuid,
                          ready: !p1.ready
                        })
                      }}
                      className={`w-full h-7 font-black uppercase text-[9px] rounded-lg tracking-wider cursor-pointer shadow-md transition-all active:scale-95 ${
                        p1.ready
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-sky-600 hover:bg-sky-500 text-white animate-pulse"
                      }`}
                    >
                      {p1.ready ? "READY! ✅" : "Ready to Battle ⚡"}
                    </Button>
                  )}
                </div>

                {/* SLOT 2 (RIGHT) */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 relative overflow-hidden transition-all ${
                  p2?.invite_status === "accepted"
                    ? p2.ready 
                      ? "bg-emerald-950/15 border-emerald-500/30"
                      : "bg-pink-950/15 border-pink-500/30"
                    : p2?.invite_status === "invited"
                    ? "bg-amber-950/15 border-amber-500/30 border-dashed animate-pulse"
                    : "bg-slate-900/30 border-slate-850 border-dashed"
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">Slot 2 (Team Meira 👧)</span>
                      <h4 className="text-xs font-extrabold text-slate-200 truncate mt-0.5 max-w-[150px] flex items-center gap-1.5">
                        {p2?.name || "Unoccupied"}
                        {p2Team && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            p2Team === "boy" 
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {p2Team === "boy" ? "👦 Mateus" : "👧 Meira"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[9px] font-semibold mt-0.5">
                        {p2?.invite_status === "accepted" ? (
                          p2.ready ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">● Ready</span>
                          ) : (
                            <span className="text-pink-400 flex items-center gap-1 font-bold">
                              ● Seated
                            </span>
                          )
                        ) : p2?.invite_status === "invited" ? (
                          <span className="text-amber-400 animate-pulse">● Invited...</span>
                        ) : (
                          <span className="text-slate-600">Empty Seat</span>
                        )}
                      </p>
                    </div>

                    {p2?.uuid && isAdmin && (
                      <button
                        onClick={() => {
                          sendMessage({
                            type: "kick_from_arena",
                            slot: "player2"
                          })
                        }}
                        className="p-1 bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-850 hover:border-rose-500/30 rounded-lg transition-all cursor-pointer text-[10px]"
                        title="Kick Player"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {!p2?.uuid && isAdmin && (
                    <div className="mt-1">
                      {availablePlayers.length > 0 ? (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              sendMessage({
                                type: "invite_to_arena",
                                slot: "player2",
                                target_uuid: e.target.value,
                                difficulty: arena?.difficulty || "normal"
                              })
                              e.target.value = ""
                            }
                          }}
                          className="w-full h-8 bg-slate-950 border border-slate-850 text-[10px] font-extrabold uppercase rounded-lg px-2 text-slate-400 hover:border-pink-500/30 transition-all outline-hidden cursor-pointer"
                        >
                          <option value="">+ Seat Player 2 (Meira Slot)...</option>
                          {availablePlayers.map((player) => {
                            const isGirl = player.team === "girl"
                            return (
                              <option key={player.uuid} value={player.uuid}>
                                {player.name || "Anonymous"} ({isGirl ? "👧 Meira" : "👦 Mateus"})
                              </option>
                            )
                          })}
                        </select>
                      ) : (
                        <p className="text-[8px] text-slate-600 italic">No available players</p>
                      )}
                    </div>
                  )}

                  {p2?.uuid === myUuid && p2?.invite_status === "accepted" && (
                    <Button
                      onClick={() => {
                        sendMessage({
                          type: "set_arena_ready",
                          uuid: myUuid,
                          ready: !p2.ready
                        })
                      }}
                      className={`w-full h-7 font-black uppercase text-[9px] rounded-lg tracking-wider cursor-pointer shadow-md transition-all active:scale-95 ${
                        p2.ready
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-pink-600 hover:bg-pink-500 text-white animate-pulse"
                      }`}
                    >
                      {p2.ready ? "READY! ✅" : "Ready to Battle ⚡"}
                    </Button>
                  )}
                </div>
              </div>

              {isAdmin && arena?.status === "completed" && (
                <Button
                  onClick={() => {
                    sendMessage({
                      type: "reset_arena"
                    })
                  }}
                  className="w-full h-8.5 bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold uppercase text-[9px] rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer select-none"
                >
                  ↻ Reset Arena Board
                </Button>
              )}
            </div>
          )
        })()}

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
          {/* 👥 Invite Duelists (2 Ways to Share) */}
          <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-350">
                  Invite Duelists
                </h3>
              </div>
              <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
                2 Ways to share
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Copy URL Link Button */}
              <Button
                onClick={handleCopyLink}
                className={`h-9.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
                  copied
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-violet-500/30 text-slate-300"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-violet-400" /> Copy Link
                  </>
                )}
              </Button>

              {/* QR Code Dialog Popup */}
              <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
                <DialogTrigger asChild>
                  <Button className="h-9.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-cyan-500/30 text-slate-300 text-[10px] font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95">
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" /> Show QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border border-slate-850 text-slate-100 max-w-[calc(100%-2rem)] sm:max-w-sm rounded-2xl shadow-2xl p-6 select-none flex flex-col items-center justify-center text-center gap-4">
                  <div className="flex flex-col items-center justify-center text-center space-y-4 py-2 w-full">
                    <div className="flex flex-col items-center justify-center text-center space-y-1 w-full">
                      <div className="inline-flex p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 mb-1">
                        <QrCode className="w-6 h-6 animate-pulse" />
                      </div>
                      <DialogTitle className="text-lg font-bold text-center w-full">
                        Scan to Join Duel!
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 text-xs mt-0.5 text-center w-full">
                        Point a smartphone camera at this QR code to join the game lobby instantly.
                      </DialogDescription>
                    </div>

                    {/* QR Code Canvas frame */}
                    <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl shadow-inner border border-slate-800 flex items-center justify-center shrink-0">
                      <QRCode
                        value={shareUrl}
                        size={168}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 168 168`}
                      />
                    </div>

                    <div className="bg-slate-950/80 border border-slate-850 p-2.5 rounded-xl font-mono text-[9px] text-slate-400 select-all flex items-center justify-between gap-2 overflow-hidden w-full shrink-0">
                      <span className="truncate min-w-0 flex-1 text-left">{shareUrl}</span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 hover:text-white transition-colors cursor-pointer text-slate-500 shrink-0"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-3">
            {/* See High Scores */}
            <Link
              to="/room/$roomUuid/scorers"
              params={{ roomUuid }}
              search={{
                code: roomStore.code ?? "",
                token: roomStore.token ?? "",
              }}
              className="block w-full"
            >
              <Button
                variant="outline"
                className="w-full h-10 bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-violet-500/30 text-slate-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                High Scores
              </Button>
            </Link>

            {/* Spectator Arena Button */}
            {isAdmin && (
              <Link
                to="/room/$roomUuid/battles/$battleId"
                params={{ roomUuid, battleId: "arena" }}
                search={{ code: roomStore.code ?? "" }}
                className="block w-full"
              >
                <Button
                  variant="outline"
                  className="w-full h-10 bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-cyan-500/30 text-slate-350 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Spectate Arena Battles
                </Button>
              </Link>
            )}

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

        {renderGlobalDialogs()}
      </div>

      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        ROOM ID: {roomUuid}
      </p>
    </div>
  )
}

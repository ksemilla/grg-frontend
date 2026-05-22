import { useMessage } from "@/components/message-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ShieldCheck, RefreshCw, LogOut, Ban, Users, Search, KeyRound, Swords, Play } from "lucide-react"

export const Route = createFileRoute("/room/$roomUuid/admin/")({
  component: RouteComponent,
})

type AdminSearchParams = {
  code?: string
  token?: string
}

interface PlayerEditDialogProps {
  pn: any
  isOccupied: boolean
  isBlocked: boolean
  displayName: string
  badgeStyle: string
  badgeText: string
  clearPlayer: (uuid: string, name: string) => void
  blockPlayer: (uuid: string) => void
  unblockPlayer: (uuid: string) => void
  sendMessage: (msg: any) => void
}

function PlayerEditDialog({
  pn,
  isOccupied,
  isBlocked,
  displayName,
  badgeStyle,
  badgeText,
  clearPlayer,
  blockPlayer,
  unblockPlayer,
  sendMessage,
}: PlayerEditDialogProps) {
  const [name, setName] = useState(pn.name || "")
  const [score, setScore] = useState(pn.score || 0)
  const [team, setTeam] = useState<"boy" | "girl" | "">(pn.team || "")
  const [isPlayerAdmin, setIsPlayerAdmin] = useState(pn.is_admin || false)
  const [isPlayerBlocked, setIsPlayerBlocked] = useState(pn.is_blocked || false)
  const [isOpen, setIsOpen] = useState(false)

  // Synchronize component states with latest real-time WebSocket data when dialog opens or player data changes
  useEffect(() => {
    if (isOpen) {
      setName(pn.name || "")
      setScore(pn.score || 0)
      setTeam(pn.team || "")
      setIsPlayerAdmin(pn.is_admin || false)
      setIsPlayerBlocked(pn.is_blocked || false)
    }
  }, [isOpen, pn])

  const handleSave = () => {
    sendMessage({
      type: "admin_edit_player",
      target_uuid: pn.uuid,
      name,
      score: Number(score),
      team,
      is_admin: isPlayerAdmin,
      is_blocked: isPlayerBlocked,
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={`p-3 bg-slate-950/30 border rounded-xl transition-all cursor-pointer flex justify-between items-center group hover:scale-[1.01] active:scale-[0.99] ${isBlocked ? "border-rose-950 bg-rose-950/5 hover:border-rose-800" : "border-slate-800/85 hover:border-slate-700/80"}`}>
          <div className="flex flex-col text-left">
            <span className={`font-semibold text-sm tracking-wide ${isBlocked ? "text-rose-450" : "text-slate-200"}`}>{displayName}</span>
            {isOccupied && !isBlocked && (
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                Score: {pn.score || 0} • Team: {pn.team === "boy" ? "Mateus" : pn.team === "girl" ? "Meira" : "None"}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}`}>{badgeText}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-[calc(100%-2rem)] sm:max-w-sm rounded-xl overflow-y-auto max-h-[90vh]">
        <div className="space-y-4 py-3 text-left">
          <div className="text-center">
            <div className={`inline-flex p-3 rounded-full border mb-2 ${isBlocked ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-center">
              Edit Player Profile
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-0.5">
              Modify name, score, team, and operational flags.
            </DialogDescription>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450">Player Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-slate-850 text-slate-100 text-xs font-semibold h-8.5"
                placeholder="Enter player name..."
              />
            </div>

            {/* Score Input */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450">Accumulated Score</label>
              <Input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="bg-slate-950 border-slate-850 text-slate-100 text-xs font-mono font-semibold h-8.5"
                placeholder="0"
                min={0}
              />
            </div>

            {/* Team Dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450">Tournament Team</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as any)}
                className="w-full h-8.5 bg-slate-950 border border-slate-850 text-xs font-semibold rounded-lg px-2 text-slate-350 outline-hidden cursor-pointer"
              >
                <option value="">None / Solo</option>
                <option value="boy">Team Mateus (👦 Boy)</option>
                <option value="girl">Team Meira (👧 Girl)</option>
              </select>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Is Admin */}
              <label className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 p-2 rounded-lg cursor-pointer hover:border-slate-800 transition-all select-none">
                <input
                  type="checkbox"
                  checked={isPlayerAdmin}
                  onChange={(e) => setIsPlayerAdmin(e.target.checked)}
                  className="rounded-xs border-slate-850 text-rose-600 bg-slate-950 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[10px] font-extrabold uppercase text-slate-350">Admin</span>
              </label>

              {/* Is Blocked */}
              <label className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 p-2 rounded-lg cursor-pointer hover:border-slate-800 transition-all select-none">
                <input
                  type="checkbox"
                  checked={isPlayerBlocked}
                  onChange={(e) => setIsPlayerBlocked(e.target.checked)}
                  className="rounded-xs border-slate-850 text-rose-600 bg-slate-950 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[10px] font-extrabold uppercase text-slate-350">Blocked</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-850">
            <Button
              onClick={handleSave}
              className="flex-1 h-9.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/30 active:scale-95 transition-all cursor-pointer"
            >
              💾 Save Changes
            </Button>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Danger Quick Actions</span>
            {isBlocked ? (
              <Button
                onClick={() => {
                  unblockPlayer(pn.uuid)
                  setIsOpen(false)
                }}
                className="w-full h-8.5 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Unblock &amp; Reset
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    clearPlayer(pn.uuid, pn.name)
                    setIsOpen(false)
                  }}
                  variant="destructive"
                  className="h-8.5 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 text-rose-400 font-extrabold text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Evict Slot
                </Button>
                <Button
                  disabled={!isOccupied}
                  onClick={() => {
                    blockPlayer(pn.uuid)
                    setIsOpen(false)
                  }}
                  variant="outline"
                  className="h-8.5 bg-slate-950 border border-slate-850 hover:bg-rose-950/20 hover:text-rose-450 hover:border-rose-900/50 text-slate-500 font-extrabold text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" /> Block Device
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const search = Route.useSearch() as AdminSearchParams
  const { sendMessage } = useMessage()
  const roomStore = useRoomStore()
  const [searchQuery, setSearchQuery] = useState("")
  const myUuid = localStorage.getItem("uuid")

  const [p1Search, setP1Search] = useState("")
  const [p1SearchFocused, setP1SearchFocused] = useState(false)
  const [p2Search, setP2Search] = useState("")
  const [p2SearchFocused, setP2SearchFocused] = useState(false)

  const teamScores = (roomStore.value?.data as any)?.team_scores || { boy: 0, girl: 0 }
  const [boyVal, setBoyVal] = useState(teamScores.boy || 0)
  const [girlVal, setGirlVal] = useState(teamScores.girl || 0)

  // Sync state when DB updates
  useEffect(() => {
    setBoyVal(teamScores.boy || 0)
    setGirlVal(teamScores.girl || 0)
  }, [teamScores.boy, teamScores.girl])
  
  const myPlayerIsAdmin = roomStore.value?.players?.find(p => p.uuid === myUuid)?.is_admin ?? false
  const isAuthorizedAdmin = roomStore.isAdmin || myPlayerIsAdmin

  const clearPlayer = (uuid: string, name: string) => {
    sendMessage({ type: "clear_player", uuid: uuid || "", name: name || "" })
  }

  const blockPlayer = (target_uuid: string) => {
    if (target_uuid) sendMessage({ type: "block_player", target_uuid })
  }

  const unblockPlayer = (target_uuid: string) => {
    if (target_uuid) sendMessage({ type: "unblock_player", target_uuid })
  }

  const force = () => sendMessage({ type: "force_update" })

  // ── ACCESS DENIED ──────────────────────────────────────────────────────────
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Deep red glowing pulse effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[4000ms]" />

        <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mb-2">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-500 via-red-400 to-rose-600 bg-clip-text text-transparent">
              Access Denied
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed px-2">
              You do not have administrative privileges to access the Host Control Center. Please ask the lobby host or another admin to elevate your role in the player list.
            </p>
          </div>

          <Link
            to="/room/$roomUuid"
            params={{ roomUuid }}
            search={{ code: roomStore.code ?? search.code ?? "" }}
            className="inline-flex w-full items-center justify-center h-10 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl shadow-lg transition-all active:scale-95 text-xs font-bold cursor-pointer"
          >
            ← Back to Lobby
          </Link>

          <div className="pt-2 border-t border-slate-800/60 text-[9px] text-slate-500 font-mono">
            IDENTIFIER: {myUuid || "UNKNOWN"}
          </div>
        </div>
      </div>
    )
  }

  // ── AUTHENTICATED ADMIN PANEL ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-6 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 sm:p-8 rounded-2xl shadow-2xl relative z-10 space-y-6 sm:space-y-8 animate-in fade-in zoom-in duration-300">
        
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Host Control Center</h1>
                <p className="text-slate-500 text-[10px] sm:text-[11px] font-medium tracking-wide uppercase">Lobby Manager</p>
              </div>
            </div>
            <Button
              onClick={force}
              variant="outline"
              size="sm"
              className="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1.5 h-9 cursor-pointer w-full sm:w-auto text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Force Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-1">
            <Link
              to="/room/$roomUuid"
              params={{ roomUuid }}
              search={{ code: roomStore.code, token: roomStore.token }}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 h-9 cursor-pointer">
                🎮 Go to Game Board
              </Button>
            </Link>
            <Link
              to="/room/$roomUuid/set-name"
              params={{ roomUuid }}
              search={{ code: roomStore.code, token: roomStore.token }}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 h-9 cursor-pointer">
                👤 Reset / Choose Name
              </Button>
            </Link>
          </div>
        </div>

        {/* Cumulative Tournament Standings Editor */}
        <div className="bg-slate-950/40 border border-slate-850 p-4.5 rounded-xl space-y-3 text-left">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850/60 pb-2">
            🏆 Tournament Standings Editor
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-sky-400">Team Mateus (Boy)</label>
              <Input
                type="number"
                value={boyVal}
                onChange={(e) => setBoyVal(Number(e.target.value))}
                className="bg-slate-950 border-slate-850 text-slate-100 text-xs font-mono font-semibold h-8.5"
                min={0}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-pink-400">Team Meira (Girl)</label>
              <Input
                type="number"
                value={girlVal}
                onChange={(e) => setGirlVal(Number(e.target.value))}
                className="bg-slate-950 border-slate-850 text-slate-100 text-xs font-mono font-semibold h-8.5"
                min={0}
              />
            </div>
          </div>
          <Button
            onClick={() => {
              sendMessage({
                type: "set_team_scores",
                boy: Number(boyVal),
                girl: Number(girlVal),
              })
            }}
            className="w-full h-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Update Standings ⚡
          </Button>
        </div>

        {/* ⚔️ Permanent 1v1 Arena Board Dashboard */}
        {(() => {
          const arena = (roomStore.value?.data as any)?.arena
          const p1 = arena?.player1
          const p2 = arena?.player2

          const p1Player = roomStore.value?.players.find((p) => p.uuid === p1?.uuid)
          const p1Team = p1Player?.team || ""

          const p2Player = roomStore.value?.players.find((p) => p.uuid === p2?.uuid)
          const p2Team = p2Player?.team || ""

          const availablePlayers = (roomStore.value?.players || []).filter(
            (p) => p.uuid !== p1?.uuid && p.uuid !== p2?.uuid && p.uuid && p.name
          )

          const filteredAvailable1 = availablePlayers.filter((p) =>
            (p.name || "").toLowerCase().includes(p1Search.toLowerCase())
          )

          const filteredAvailable2 = availablePlayers.filter((p) =>
            (p.name || "").toLowerCase().includes(p2Search.toLowerCase())
          )

          return (
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 shadow-2xl relative overflow-visible space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Swords
                    className={`w-4 h-4 ${arena?.status === "active" ? "text-rose-405 animate-pulse" : "text-slate-400"}`}
                  />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-200">
                    1v1 Arena Match Seating
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {(arena?.status === "idle" || arena?.status === "preparing") && (
                    <button
                      onClick={() => sendMessage({ type: "swap_arena_slots" })}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[8px] font-black uppercase text-slate-350 hover:text-white hover:border-sky-500/40 rounded-md transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-md"
                      title="Swap Slot 1 & Slot 2 Players"
                      type="button"
                    >
                      ⇄ Swap Seats
                    </button>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                      arena?.status === "active"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse"
                        : arena?.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : arena?.status === "preparing"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : "bg-slate-900 text-slate-500 border border-slate-850"
                    }`}
                  >
                    {arena?.status || "Idle"}
                  </span>
                </div>
              </div>

              {(arena?.status === "idle" || arena?.status === "preparing") && (
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-xl border border-slate-850 text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">
                    Difficulty Mode
                  </span>
                  <div className="flex gap-1.5">
                    {(["easy", "normal", "hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => {
                          sendMessage({
                            type: "set_arena_difficulty",
                            difficulty: diff,
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
                {/* SLOT 1 (LEFT) - Team Mateus */}
                <div
                  className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 relative overflow-visible transition-all ${
                    p1?.invite_status === "accepted"
                      ? p1.ready
                        ? "bg-emerald-950/15 border-emerald-500/30"
                        : "bg-sky-950/15 border-sky-500/30"
                      : p1?.invite_status === "invited"
                        ? "bg-amber-950/15 border-amber-500/30 border-dashed animate-pulse"
                        : "bg-slate-900/30 border-slate-850 border-dashed"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">
                        Slot 1 (Team Mateus 👦)
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-200 truncate mt-0.5 max-w-[150px] flex items-center gap-1.5">
                        {p1?.name || "Unoccupied"}
                        {p1Team && (
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              p1Team === "boy"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {p1Team === "boy" ? "👦 Mateus" : "👧 Meira"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[9px] font-semibold mt-0.5">
                        {p1?.invite_status === "accepted" ? (
                          p1.ready ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              ● Ready
                            </span>
                          ) : (
                            <span className="text-sky-400 flex items-center gap-1 font-bold">
                              ● Seated
                            </span>
                          )
                        ) : p1?.invite_status === "invited" ? (
                          <span className="text-amber-400 animate-pulse">
                            ● Invited...
                          </span>
                        ) : (
                          <span className="text-slate-600">Empty Seat</span>
                        )}
                      </p>
                    </div>

                    {p1?.uuid && (
                      <button
                        onClick={() => {
                          sendMessage({
                            type: "kick_from_arena",
                            slot: "player1",
                          })
                        }}
                        className="p-1 bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-850 hover:border-rose-500/30 rounded-lg transition-all cursor-pointer text-[10px]"
                        title="Kick Player"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {!p1?.uuid && (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <Input
                          placeholder="Search player to seat..."
                          value={p1Search}
                          onChange={(e) => {
                            setP1Search(e.target.value)
                            setP1SearchFocused(true)
                          }}
                          onFocus={() => setP1SearchFocused(true)}
                          onBlur={() => setTimeout(() => setP1SearchFocused(false), 200)}
                          className="bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-600 text-xs font-semibold pl-8 h-8.5 rounded-lg focus-visible:ring-sky-500/30"
                        />
                      </div>

                      {p1SearchFocused && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl max-h-36 overflow-y-auto z-50 divide-y divide-slate-900/60 scrollbar-thin">
                          {filteredAvailable1.length > 0 ? (
                            filteredAvailable1.map((player) => (
                              <button
                                key={player.uuid}
                                onMouseDown={() => {
                                  sendMessage({
                                    type: "invite_to_arena",
                                    slot: "player1",
                                    target_uuid: player.uuid,
                                    difficulty: arena?.difficulty || "normal",
                                  })
                                  setP1Search("")
                                  setP1SearchFocused(false)
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-violet-600/10 hover:text-violet-400 transition-colors text-[9px] font-black uppercase text-slate-350 flex justify-between items-center cursor-pointer"
                              >
                                <span>{player.name || "Anonymous"}</span>
                                <span className="text-[7.5px] opacity-60">
                                  {player.team === "boy" ? "👦 Mateus" : player.team === "girl" ? "👧 Meira" : "Solo"}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-[8px] text-slate-600 italic">No available players found</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SLOT 2 (RIGHT) - Team Meira */}
                <div
                  className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 relative overflow-visible transition-all ${
                    p2?.invite_status === "accepted"
                      ? p2.ready
                        ? "bg-emerald-950/15 border-emerald-500/30"
                        : "bg-pink-950/15 border-pink-500/30"
                      : p2?.invite_status === "invited"
                        ? "bg-amber-950/15 border-amber-500/30 border-dashed animate-pulse"
                        : "bg-slate-900/30 border-slate-850 border-dashed"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">
                        Slot 2 (Team Meira 👧)
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-200 truncate mt-0.5 max-w-[150px] flex items-center gap-1.5">
                        {p2?.name || "Unoccupied"}
                        {p2Team && (
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              p2Team === "boy"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {p2Team === "boy" ? "👦 Mateus" : "👧 Meira"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[9px] font-semibold mt-0.5">
                        {p2?.invite_status === "accepted" ? (
                          p2.ready ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              ● Ready
                            </span>
                          ) : (
                            <span className="text-pink-400 flex items-center gap-1 font-bold">
                              ● Seated
                            </span>
                          )
                        ) : p2?.invite_status === "invited" ? (
                          <span className="text-amber-400 animate-pulse">
                            ● Invited...
                          </span>
                        ) : (
                          <span className="text-slate-600">Empty Seat</span>
                        )}
                      </p>
                    </div>

                    {p2?.uuid && (
                      <button
                        onClick={() => {
                          sendMessage({
                            type: "kick_from_arena",
                            slot: "player2",
                          })
                        }}
                        className="p-1 bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-850 hover:border-rose-500/30 rounded-lg transition-all cursor-pointer text-[10px]"
                        title="Kick Player"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {!p2?.uuid && (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <Input
                          placeholder="Search player to seat..."
                          value={p2Search}
                          onChange={(e) => {
                            setP2Search(e.target.value)
                            setP2SearchFocused(true)
                          }}
                          onFocus={() => setP2SearchFocused(true)}
                          onBlur={() => setTimeout(() => setP2SearchFocused(false), 200)}
                          className="bg-slate-950 border-slate-850 text-slate-100 placeholder-slate-600 text-xs font-semibold pl-8 h-8.5 rounded-lg focus-visible:ring-pink-500/30"
                        />
                      </div>

                      {p2SearchFocused && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl max-h-36 overflow-y-auto z-50 divide-y divide-slate-900/60 scrollbar-thin">
                          {filteredAvailable2.length > 0 ? (
                            filteredAvailable2.map((player) => (
                              <button
                                key={player.uuid}
                                onMouseDown={() => {
                                  sendMessage({
                                    type: "invite_to_arena",
                                    slot: "player2",
                                    target_uuid: player.uuid,
                                    difficulty: arena?.difficulty || "normal",
                                  })
                                  setP2Search("")
                                  setP2SearchFocused(false)
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-violet-650/10 hover:text-violet-400 transition-colors text-[9px] font-black uppercase text-slate-350 flex justify-between items-center cursor-pointer"
                              >
                                <span>{player.name || "Anonymous"}</span>
                                <span className="text-[7.5px] opacity-60">
                                  {player.team === "boy" ? "👦 Mateus" : player.team === "girl" ? "👧 Meira" : "Solo"}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-[8px] text-slate-600 italic">No available players found</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Start 1v1 Arena Battle Button for Host Admins */}
              {p1?.uuid && p2?.uuid && arena?.status !== "active" && (
                <Button
                  onClick={() => sendMessage({ type: "start_arena_battle" })}
                  className="w-full h-9 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Commence 1v1 Arena Battle ⚔️
                </Button>
              )}

              {/* Reset Arena Match State (Emergency/Idle state reset) */}
              {arena?.status === "completed" && (
                <Button
                  onClick={() => sendMessage({ type: "reset_arena" })}
                  className="w-full h-8.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-violet-500/30 text-slate-300 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 text-violet-400" />
                  Reset Arena to Idle
                </Button>
              )}
            </div>
          )
        })()}

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800/40">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-400" /> Room Seating &amp; Status
              </span>
              <span className="text-[10px] font-mono text-slate-500">MAX 200 PLAYERS</span>
            </h2>
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
                  const nameToSearch = pn.is_blocked ? `Blocked Session (${pn.uuid})` : pn.name
                  return nameToSearch.toLowerCase().includes(searchQuery.toLowerCase())
                })

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
                      <p className="text-xs text-slate-500 font-medium">No matching players found</p>
                    </div>
                  )
                }

                return filtered.map((pn) => {
                  const isOccupied = !!pn.uuid
                  const isBlocked = !!pn.is_blocked
                  const isAdmin = !!pn.is_admin
                  const displayName = isBlocked
                    ? `Blocked Session (${pn.uuid.substring(0, 8)}...)`
                    : pn.name || "(Vacant Player Slot)"
                  let badgeText = "Vacant"
                  let badgeStyle = "bg-slate-800/60 text-slate-500 border border-slate-700/40"
                  if (isBlocked) { badgeText = "Blocked"; badgeStyle = "bg-rose-500/15 text-rose-400 border border-rose-500/30" }
                  else if (isAdmin) { badgeText = "Admin"; badgeStyle = "bg-violet-500/15 text-violet-400 border border-violet-500/30" }
                  else if (isOccupied) { badgeText = "Active"; badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" }

                  return (
                    <PlayerEditDialog
                      key={pn.uuid || pn.name}
                      pn={pn}
                      isOccupied={isOccupied}
                      isBlocked={isBlocked}
                      displayName={displayName}
                      badgeStyle={badgeStyle}
                      badgeText={badgeText}
                      clearPlayer={clearPlayer}
                      blockPlayer={blockPlayer}
                      unblockPlayer={unblockPlayer}
                      sendMessage={sendMessage}
                    />
                  )
                })
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

      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono">ROOM ID: {roomUuid}</p>
    </div>
  )
}

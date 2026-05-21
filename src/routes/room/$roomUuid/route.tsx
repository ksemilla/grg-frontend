import { MessageProvider } from "@/components/message-provider"
import { useRoomSocket } from "@/hooks/useRoomSocket"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router"
import { ShieldIcon, RefreshCw, Swords } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

type RoomSearchParams = {
  code?: string
  token?: string
}

export const Route = createFileRoute("/room/$roomUuid")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>): RoomSearchParams => {
    return {
      code: search.code ?? "",
      token: search.token ?? "",
    }
  },
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()
  const myUuid = localStorage.getItem("uuid")
  const { code, token } = Route.useSearch()
  const { sendMessage, reconnect } = useRoomSocket(
    roomUuid,
    code,
    token
  )
  const navigate = useNavigate()

  const arena = (roomStore.value?.data as any)?.arena as any
  const isPlayer1 = arena?.player1?.uuid === myUuid
  const isPlayer2 = arena?.player2?.uuid === myUuid
  const mySlot = isPlayer1 ? "player1" : isPlayer2 ? "player2" : null
  const pendingIncomingInvite = mySlot && arena?.[mySlot]?.invite_status === "invited"
  
  const activeArena = arena?.status === "active" && (arena.player1.uuid === myUuid || arena.player2.uuid === myUuid)

  useEffect(() => {
    if (activeArena) {
      const currentPath = window.location.pathname
      const lobbyPath = `/room/${roomUuid}`
      if (currentPath !== lobbyPath && currentPath !== `${lobbyPath}/`) {
        navigate({
          to: "/room/$roomUuid",
          params: { roomUuid },
          search: { code: roomStore.code ?? "", token: roomStore.token ?? "" },
        })
      }
    }
  }, [activeArena, navigate, roomUuid, roomStore.code, roomStore.token])

  useEffect(() => {
    if (token) {
      roomStore.setToken(token)
    }

    if (code) {
      roomStore.setCode(code)
    }
  }, [code, token])

  // Sync blocked state with DB room data updates
  useEffect(() => {
    if (roomStore.value?.players && myUuid) {
      const me = roomStore.value.players.find(p => p.uuid === myUuid)
      if (me?.is_blocked) {
        roomStore.setIsBlocked(true)
      } else if (me && !me.is_blocked) {
        roomStore.setIsBlocked(false)
      }
    }
  }, [roomStore.value?.players, myUuid])

  // Check admin status from JWT-based socket auth OR from DB player record
  const myPlayerIsAdmin = roomStore.value?.players.find(p => p.uuid === myUuid)?.is_admin ?? false
  const showAdminButton = roomStore.isAdmin || myPlayerIsAdmin

  // If the user's uuid is blocked, show the premium blocked screen instead!
  if (roomStore.isBlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Deep red glowing pulse effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[4000ms]" />

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="inline-flex p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mb-2 animate-bounce">
            <ShieldIcon className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-red-400 to-rose-600 bg-clip-text text-transparent">
              Access Restricted
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed px-4">
              Your device/identifier has been restricted by the room administrator. You are prevented from joining or participating in this session.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            DEVICE UUID: {myUuid}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Global Connection Status Indicator & Reconnect Trigger */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 text-xs font-bold shadow-lg select-none ${
          roomStore.socketStatus === "connected"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : roomStore.socketStatus === "connecting"
            ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {roomStore.socketStatus === "connected" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Live</span>
            </>
          )}
          {roomStore.socketStatus === "connecting" && (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Connecting...</span>
            </>
          )}
          {roomStore.socketStatus === "disconnected" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Offline</span>
            </>
          )}
        </div>

        {roomStore.socketStatus !== "connected" && (
          <button
            onClick={() => reconnect()}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            title="Reconnect to Session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="fixed top-4 right-4 z-30">
        {showAdminButton && (
          <Link
            to="/room/$roomUuid/admin"
            params={{ roomUuid }}
            search={{ code: roomStore.code, token: roomStore.token }}
            className="inline-flex p-2.5 bg-slate-900/80 hover:bg-slate-800 text-rose-400 hover:text-rose-350 border border-slate-800 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative cursor-pointer"
          >
            <ShieldIcon className="w-5 h-5 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] transition-all" />
            
            {/* Tooltip */}
            <span className="absolute right-0 top-12 scale-0 transition-all rounded bg-slate-950 p-1.5 text-[10px] text-slate-400 border border-slate-800 whitespace-nowrap group-hover:scale-100 font-medium">
              Host Control Center
            </span>
          </Link>
        )}
      </div>
      <MessageProvider sendMessage={sendMessage}>
        <Outlet />

        {/* ⚔️ GLOBAL 1V1 ARENA INVITE DIALOG */}
        <Dialog open={!!pendingIncomingInvite} onOpenChange={() => {}}>
          <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-sm rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="inline-flex p-3.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 mb-1 animate-bounce">
              <Swords className="w-6 h-6 text-rose-400" />
            </div>
            <DialogTitle className="text-lg font-bold">
              1v1 Arena Callout!
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs px-4">
              The room administrator has invited you to enter the spotlight and battle in the **1v1 Arena**!
            </DialogDescription>
            <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
              Difficulty: {arena?.difficulty || "normal"}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  sendMessage({
                    type: "accept_arena_invite",
                    uuid: myUuid,
                  })
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl transition-all cursor-pointer text-xs"
              >
                Accept ⚔️
              </Button>
              <Button
                onClick={() => {
                  sendMessage({
                    type: "decline_arena_invite",
                    uuid: myUuid,
                  })
                }}
                variant="outline"
                className="flex-1 bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white h-10 rounded-xl transition-all cursor-pointer text-xs"
              >
                Decline 🏳️
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </MessageProvider>
    </>
  )
}

// function NameChecker() {
//   const navigate = useNavigate()
//   const { roomUuid } = Route.useParams()
//   const roomStore = useRoomStore()
//   const name = localStorage.getItem("name")
//   useEffect(() => {
//     if (!name && roomStore.code) {
//       navigate({
//         to: "/room/$roomUuid/set-name",
//         params: { roomUuid },
//         search: {
//           code: roomStore.code,
//           token: roomStore.token,
//         },
//       })
//     }
//   }, [name, roomStore.code])

//   return <Outlet />
// }

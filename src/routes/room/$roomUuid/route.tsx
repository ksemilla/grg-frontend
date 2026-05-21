import { MessageProvider } from "@/components/message-provider"
import { useRoomSocket } from "@/hooks/useRoomSocket"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { ShieldIcon, RefreshCw } from "lucide-react"
import { useEffect } from "react"

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
    roomStore.code,
    roomStore.token
  )

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

import { MessageProvider } from "@/components/message-provider"
import { useRoomSocket } from "@/hooks/useRoomSocket"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { ShieldIcon } from "lucide-react"
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
  const { code, token } = Route.useSearch()
  const { sendMessage } = useRoomSocket(
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
  return (
    <>
      <div className="fixed top-4 right-4 z-30">
        {roomStore.isAdmin && (
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

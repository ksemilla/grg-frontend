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
      <div className="fixed top-4 right-4">
        {roomStore.isAdmin && (
          <Link
            to="/room/$roomUuid/admin"
            params={{ roomUuid: "uuid" }}
            search={{ code: roomStore.code, token: roomStore.token }}
          >
            <ShieldIcon size={35} />
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

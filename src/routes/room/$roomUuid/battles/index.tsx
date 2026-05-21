import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Swords } from "lucide-react"

export const Route = createFileRoute("/room/$roomUuid/battles/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()
  const navigate = useNavigate()

  // Automatically redirect straight to the side-by-side arena battle page
  useEffect(() => {
    navigate({
      to: "/room/$roomUuid/battles/$battleId",
      params: { roomUuid, battleId: "arena" },
      search: { code: roomStore.code ?? "" },
    })
  }, [navigate, roomUuid, roomStore.code])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Loading Redirect Overlay */}
      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6 text-center">
        <div className="inline-flex p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 mb-2">
          <Swords className="w-8 h-8 animate-pulse text-cyan-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-violet-200 to-rose-400 bg-clip-text text-transparent">
          Entering Arena...
        </h1>
        <p className="text-slate-500 text-xs px-4">
          Redirecting you directly to the live 1v1 Match Arena spectate view.
        </p>
      </div>
    </div>
  )
}

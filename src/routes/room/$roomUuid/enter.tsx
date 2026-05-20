import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { KeyRound, ArrowRight } from "lucide-react"

export const Route = createFileRoute("/room/$roomUuid/enter")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomUuid } = Route.useParams()
  const roomStore = useRoomStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<{
    code: string
  }>()

  const onSubmit = (data: { code: string }) => {
    roomStore.setCode(data.code)
  }

  useEffect(() => {
    if (roomStore.code) {
      navigate({
        to: "/room/$roomUuid",
        params: { roomUuid },
        search: { code: roomStore.code, token: roomStore.token },
      })
    }
  }, [roomStore.code, roomUuid])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Premium Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-8 animate-in fade-in zoom-in duration-300">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 mb-2">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Security Clearance
          </h1>
          <p className="text-slate-400 text-xs px-4">
            This room is private. Please enter the 6-digit access code to join the lobby.
          </p>
        </div>

        {/* Access Code Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="access-code" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Access Code
            </label>
            <Input
              id="access-code"
              type="password"
              placeholder="e.g. 193856"
              {...register("code", { required: "Access code is required" })}
              className="bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 text-center tracking-widest font-mono text-lg focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 h-12"
            />
            {errors.code && <p className="text-xs text-rose-500 mt-1 text-center">{errors.code.message}</p>}
          </div>

          <Button type="submit" className="w-full h-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 group">
            Verify & Connect
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </div>

      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        ROOM ID: {roomUuid}
      </p>
    </div>
  )
}

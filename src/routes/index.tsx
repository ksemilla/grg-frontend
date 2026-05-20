import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Gamepad2, ArrowRight, Settings } from "lucide-react"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const [roomId, setRoomId] = useState("")
  const [error, setError] = useState("")
  const [showDevTools, setShowDevTools] = useState(false)
  const navigate = useNavigate()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId.trim()) {
      setError("Please enter a valid Room ID")
      return
    }
    setError("")
    navigate({
      to: "/room/$roomUuid",
      params: { roomUuid: roomId.trim() },
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Premium Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-8">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 mb-2">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            GRIDLOCK
          </h1>
          <p className="text-slate-400 text-sm">
            Enter a Room ID below to join the lobby and start playing
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="room-id" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Room ID (UUID)
            </label>
            <Input
              id="room-id"
              placeholder="e.g. 3b2b4d9a-14d2-4328-89c0-9a2c3d4e5f6a"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value)
                if (error) setError("")
              }}
              className="bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-12"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 group">
            Join Room Lobby
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>

        {/* Developer / Admin Quick Options Panel */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mx-auto"
            type="button"
          >
            <Settings className="w-3.5 h-3.5" />
            {showDevTools ? "Hide Quick Developer Tools" : "Show Quick Developer Tools"}
          </button>

          {showDevTools && (
            <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800/60 space-y-3 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 text-center mb-1">🔧 Quick testing utilities</p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setRoomId("3b2b4d9a-14d2-4328-89c0-9a2c3d4e5f6a")}
                  className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] h-8 justify-start w-full"
                >
                  📝 Use Sample Room UUID
                </Button>
                
                <a 
                  href="http://localhost:8000/admin" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] h-8 justify-start"
                  >
                    👑 Open Django Admin Dashboard
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer copyright */}
      <p className="absolute bottom-6 text-xs text-slate-600">
        Gridlock Memory Game © 2026. All rights reserved.
      </p>
    </div>
  )
}

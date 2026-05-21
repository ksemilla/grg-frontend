import { useEffect, useMemo, useRef, useState } from "react"
import { FlipCard } from "../../components/FlipCard"
import { RenderIcon } from "../../components/RenderIcon"
import { cn } from "../../utils"
import { availableIcons, type AvailableIcon } from "./const"
import { Score } from "@/components/Score"
import { motion, AnimatePresence } from "framer-motion"
import { Timer, Trophy, RotateCcw, Home, Sparkles, HelpCircle } from "lucide-react"

const thresholds = {
  12: [
    { max: 20, options: ["Memory Legend 🧠💎", "Flash Mind ⚡"] }, // insanely fast
    { max: 25, options: ["Memory Master 🧠", "Perfect Run!"] },
    { max: 30, options: ["Sharp Mind ✨", "Quick Thinker!"] }, // best
    { max: 35, options: ["Getting Warmer 🔥", "Nice Memory!"] },
    { max: 45, options: ["Keep Practicing 🧩", "Good Effort!"] },
    { max: 55, options: ["Not Bad 👍", "Memory Learner"] },
    { max: Infinity, options: ["Don’t Give Up 😅", "Practice Makes Perfect!"] },
  ],
  16: [
    { max: 25, options: ["Memory Legend 🧠💎", "Flash Mind ⚡"] },
    { max: 30, options: ["Memory Master 🧠", "Perfect Run!"] },
    { max: 35, options: ["Sharp Mind ✨", "Quick Thinker!"] }, // best
    { max: 40, options: ["Getting Warmer 🔥", "Nice Memory!"] },
    { max: 50, options: ["Keep Practicing 🧩", "Good Effort!"] },
    { max: 60, options: ["Not Bad 👍", "Memory Learner"] },
    { max: Infinity, options: ["Don’t Give Up 😅", "Practice Makes Perfect!"] },
  ],
  20: [
    { max: 40, options: ["Memory Legend 🧠💎", "Flash Mind ⚡"] },
    { max: 50, options: ["Memory Master 🧠", "Perfect Run!"] },
    { max: 60, options: ["Sharp Mind ✨", "Quick Thinker!"] }, // best
    { max: 70, options: ["Getting Warmer 🔥", "Nice Memory!"] },
    { max: 80, options: ["Keep Practicing 🧩", "Good Effort!"] },
    { max: 90, options: ["Not Bad 👍", "Memory Learner"] },
    { max: Infinity, options: ["Don’t Give Up 😅", "Practice Makes Perfect!"] },
  ],
} as const

function getMessage(seconds: number, tiles: 12 | 16 | 20) {
  const boardThresholds = thresholds[tiles]
  const bucket =
    boardThresholds.find((b) => seconds <= b.max) ||
    boardThresholds[boardThresholds.length - 1]

  const randomIndex = Math.floor(Math.random() * bucket.options.length)
  return bucket.options[randomIndex]
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hundredths = Math.floor((seconds % 1) * 100)

  return (
    `${String(mins).padStart(2, "0")}:` +
    `${String(secs).padStart(2, "0")}:` +
    `${String(hundredths).padStart(2, "0")}`
  )
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(array: T[], seed: number = 1): T[] {
  const rand = seed === 0 ? Math.random : mulberry32(seed)
  const arrCopy = [...array]

  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]]
  }
  return arrCopy
}

type MemoryGameProps = {
  n?: 6 | 8 | 10
  seed?: number
  onScore?: (data: { score: number; time: string }) => void
  onBackToLobby?: () => void
}

export function MemoryGame({ n = 6, seed = 0, onScore, onBackToLobby }: MemoryGameProps) {
  const baseScore = n * 10
  const maxBonus = 1000
  const targetTime = 1 * 30 * 100
  const power = 2
  const getAvailableIcons = shuffle(availableIcons, seed).slice(0, n)
  
  const [arr, setArr] = useState<AvailableIcon[]>(
    shuffle(getAvailableIcons.concat(getAvailableIcons), seed)
  )
  const [record, setRecord] = useState<number[]>([])
  const [show, setShow] = useState<boolean[]>(Array(n * 2).fill(false))

  const [paused, setPaused] = useState(true)
  const [hasEnded, setHasEnded] = useState(true)
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [score, setScore] = useState<number | null>(0)
  
  const [countdown, setCountdown] = useState<number | "GO!" | null>(null)

  const reveal = (idx: number) => {
    setShow((prev) =>
      prev.map((el, i) => (i === idx ? true : el))
    )
  }

  const hide = (idx: number) => {
    setShow((prev) =>
      prev.map((el, i) => (i === idx ? false : el))
    )
  }

  const select = (idx: number) => {
    setSelected((prev) => [...prev, idx])
    setRecord((prev) => [...prev, idx])
  }

  // 🏁 SPRING-ANIMATED ARCADE START SEQUENCE
  const startWithCountdown = async () => {
    setPaused(true)
    setIsGameComplete(false)
    setHasEnded(false)
    setCounter(0)
    setScore(0)
    setSelected([])
    setRecord([])
    
    // Reshuffle icons using randomized seed for replayability
    const newIcons = shuffle(availableIcons, Math.floor(Math.random() * 10000)).slice(0, n)
    setArr(shuffle(newIcons.concat(newIcons), Math.floor(Math.random() * 10000)))
    setShow(Array(n * 2).fill(false))

    // Run countdown sequence: 3... 2... 1... GO!
    setCountdown(3)
    await wait(800)
    setCountdown(2)
    await wait(800)
    setCountdown(1)
    await wait(800)
    setCountdown("GO!")
    await wait(600)
    setCountdown(null)
    
    // Start game timer!
    setPaused(false)
  }

  // Trigger countdown automatically on first mount
  useEffect(() => {
    startWithCountdown()
  }, [])

  useEffect(() => {
    const runSequence = async () => {
      if (selected.length === 2) {
        await wait(300)
        triggerFlash()
        if (arr[selected[0]] !== arr[selected[1]]) {
          await wait(350)
          hide(selected[0])
          hide(selected[1])
          await wait(150)
        } else {
          setScore((prev) =>
            Math.round(
              (prev || 0) +
                (baseScore +
                  maxBonus *
                    Math.pow(
                      targetTime / Math.floor(counter / 10 + targetTime),
                      power
                    )) *
                  (n / 6) *
                  show.filter((v) => !v).length
            )
          )
          await wait(100)
        }

        setSelected([])
      }
      if (show.length > 0 && show.every((el) => el)) {
        setPaused(true)
        setHasEnded(true)
        // Brief pause for matched-cards animation to settle
        await wait(800)
        setIsGameComplete(true)
        // Submit score, show celebration for 3s, then go to lobby
        onScore?.({
          score: score ?? 0,
          time: timer,
        })
        await wait(3200)
        onBackToLobby?.()
      }
    }

    runSequence()
  }, [selected])

  const restart = () => {
    startWithCountdown()
  }

  const [counter, setCounter] = useState(0) // ms
  const startRef = useRef(0)
  const timer = (counter / 1000).toFixed(2)
  
  useEffect(() => {
    if (paused) return

    startRef.current = performance.now() - counter
    let rafId: number = 0

    const tick = () => {
      setCounter(performance.now() - startRef.current)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [paused])

  const [flash, setFlash] = useState(false)

  const triggerFlash = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }

  const container = {
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  const countdownVariants = {
    initial: { scale: 0.3, opacity: 0 },
    animate: { 
      scale: [0.3, 1.25, 1], 
      opacity: [0, 1, 1],
      transition: { duration: 0.65, ease: "easeOut" }
    },
    exit: { scale: 1.4, opacity: 0, transition: { duration: 0.25 } }
  }

  const CONFETTI_COUNT = 32
  const colors = ["#a855f7", "#ec4899", "#06b6d4", "#facc15", "#34d399", "#f97316"]

  // Pre-compute stable particle data so framer-motion doesn't see different values per render
  const particles = useMemo(() =>
    Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const angle = (i / CONFETTI_COUNT) * 360
      const radius = 130 + (i * 7) % 160
      const dx = Math.cos((angle * Math.PI) / 180) * radius
      const dy = Math.sin((angle * Math.PI) / 180) * radius - 80
      const color = colors[i % colors.length]
      const size = 6 + (i * 3) % 9
      return { dx, dy, color, size, delay: i * 0.03 }
    }),
  [isGameComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-svh flex justify-center items-center max-w-2xl m-auto px-4 py-8 relative">
      <div className="w-full relative">

        {/* 🎉 CELEBRATION OVERLAY */}
        <AnimatePresence>
          {isGameComplete && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-slate-950/80 backdrop-blur-md rounded-2xl overflow-hidden pointer-events-none"
            >
              {/* Confetti particles */}
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                  animate={{
                    x: p.dx,
                    y: p.dy + 150,
                    opacity: [1, 1, 0],
                    scale: [1, 1.3, 0.3],
                    rotate: [0, 180 + i * 15],
                  }}
                  transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: p.size,
                    height: p.size,
                    borderRadius: i % 3 === 0 ? "50%" : "2px",
                    backgroundColor: p.color,
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Pulse rings */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0.7 }}
                animate={{ scale: [0.4, 1.5, 2.2], opacity: [0.7, 0.3, 0] }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-violet-500/60 pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.4, opacity: 0.5 }}
                animate={{ scale: [0.4, 2.0, 2.8], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-fuchsia-500/40 pointer-events-none"
              />

              {/* Score card */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={container}
                className="relative z-10 flex flex-col items-center gap-4 text-center px-6"
              >
                <motion.h1
                  variants={item}
                  className="text-2xl md:text-3xl font-extrabold tracking-wider"
                >
                  {getMessage(parseFloat(timer), n === 6 ? 12 : n === 8 ? 16 : 20)
                    .split("")
                    .map((char, ci) => (
                      <motion.span
                        key={ci}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ci * 0.015 }}
                      >
                        {char}
                      </motion.span>
                    ))}
                </motion.h1>

                <motion.div
                  variants={item}
                  className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-fuchsia-400 to-cyan-400 flex items-center gap-2 select-none"
                >
                  <Score value={score ?? 0} />
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-fuchsia-400 to-cyan-400">PTS</span>
                </motion.div>

                <motion.div
                  variants={item}
                  className="font-mono text-lg text-cyan-300 border border-slate-800 bg-slate-950/60 rounded-xl px-5 py-2 flex items-center gap-2"
                >
                  <Timer className="w-4 h-4 text-cyan-400" />
                  {formatTime(parseFloat(timer))}
                </motion.div>

                <motion.p
                  variants={item}
                  className="text-[10px] text-slate-500 font-mono tracking-widest animate-pulse mt-2"
                >
                  Returning to lobby...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🏁 COUNTDOWN OVERLAY */}
        <AnimatePresence mode="wait">
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={countdownVariants}
              className="absolute inset-0 z-40 flex flex-col justify-center items-center bg-slate-950/60 backdrop-blur-[6px] rounded-2xl pointer-events-none"
            >
              <motion.div 
                className={cn(
                  "text-8xl md:text-9xl font-black tracking-widest drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]",
                  countdown === "GO!" ? "text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.6)]" : "text-violet-400"
                )}
              >
                {countdown}
              </motion.div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mt-4 opacity-80">
                {countdown === "GO!" ? "Match Them All!" : "Get Ready..."}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD DIGITAL DASHBOARD */}
        <div className="w-full flex items-center justify-between px-4 py-3 mb-6 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg select-none">
          {/* Left wrapper */}
          <div className="w-12 flex justify-start">
            <button
              onClick={() => onBackToLobby?.()}
              className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 hover:text-slate-200 transition-all text-slate-400 cursor-pointer"
              title="Quit to Lobby"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
          
          {/* Center wrapper */}
          <div className="flex items-center gap-3">
            {/* Timer Box (Rigid Width) */}
            <div className="w-[115px] sm:w-[130px] h-10 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20">
              <Timer className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <span className="font-mono text-sm font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.15)] select-all leading-none">
                {formatTime(parseFloat(timer))}
              </span>
            </div>

            {/* Score Box (Rigid Width) */}
            <div className="w-[115px] sm:w-[130px] h-10 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20">
              <Trophy className="w-4 h-4 text-violet-400 shrink-0" />
              <span className="font-mono text-sm font-extrabold text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.15)] leading-none min-w-[32px] text-center inline-block">
                <Score value={score ?? 0} />
              </span>
              <span className="text-[9px] uppercase font-black text-slate-500 shrink-0">pts</span>
            </div>
          </div>

          {/* Right wrapper */}
          <div className="w-12 flex justify-end">
            <button
              onClick={() => restart()}
              className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-violet-500/30 hover:text-violet-400 transition-all text-slate-400 cursor-pointer"
              title="Restart Match"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GRID BOARD RENDERER */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className={cn(
            "grid gap-3 w-full",
            n === 6 ? "grid-cols-3 sm:grid-cols-4" : n === 8 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-5"
          )}
        >
          {arr.map((el, i) => (
            <motion.div
              variants={item}
              key={i}
              className={cn(
                "h-24 sm:h-28",
                show[i] || selected.length === 2 || paused || countdown !== null
                  ? "pointer-events-none opacity-90"
                  : "hover:scale-[1.02] transition-transform duration-300"
              )}
              onClick={() => {
                reveal(i)
                select(i)
              }}
            >
              <FlipCard
                show={show[i] || selected.includes(i)}
                front={
                  <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900/90 border border-slate-800/80 hover:border-violet-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:14px_14px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-violet-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="font-extrabold text-lg text-slate-500 group-hover:text-violet-400 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_10px_rgba(139,92,246,0)] group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.3)] select-none">
                      ?
                    </span>
                  </div>
                }
                back={
                  <div
                    className={cn(
                      "h-full w-full flex items-center justify-center bg-slate-950 border rounded-xl transition-all duration-200 relative overflow-hidden",
                      show[i] || selected.includes(i)
                        ? "border-violet-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-violet-950/20"
                        : "border-slate-800 bg-slate-900",
                      flash && (i === record.at(-1) || i === record.at(-2))
                        ? arr[selected[0]] !== arr[selected[1]]
                          ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] bg-rose-950/15"
                          : "border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)] bg-emerald-950/15 text-emerald-300"
                        : ""
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-radial-gradient from-transparent to-black/30",
                      flash && (i === record.at(-1) || i === record.at(-2))
                        ? arr[selected[0]] !== arr[selected[1]]
                          ? "bg-rose-500/5"
                          : "bg-emerald-500/5"
                        : ""
                    )} />
                    
                    <div className="z-10 transition-transform scale-105 duration-300">
                      <RenderIcon 
                        name={el} 
                        color={
                          flash && (i === record.at(-1) || i === record.at(-2))
                            ? arr[selected[0]] !== arr[selected[1]]
                              ? "#f43f5e"
                              : "#10b981"
                            : "#c084fc"
                        } 
                      />
                    </div>
                  </div>
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

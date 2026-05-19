import { useEffect, useRef, useState } from "react"
import { FlipCard } from "../../components/FlipCard"
import { RenderIcon } from "../../components/RenderIcon"
import { cn } from "../../utils"
import { availableIcons, type AvailableIcon } from "./const"
import { Score } from "@/components/Score"
import { motion } from "framer-motion"

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

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

type MemoryGameProps = {
  n?: 6 | 8 | 10
  seed?: number
  onFinish?: (data: { score: number; time: string }) => void
}

export function MemoryGame({ n = 6, seed = 0, onFinish }: MemoryGameProps) {
  const baseScore = n * 10
  const maxBonus = 1000
  const targetTime = 1 * 30 * 100
  const power = 2
  const getAvailableIcons = shuffle(availableIcons, seed).slice(0, n)
  const [arr, setArr] = useState<AvailableIcon[]>(
    shuffle(getAvailableIcons.concat(getAvailableIcons), seed)
  )
  const [record, setRecord] = useState<number[]>([])

  const [show, setShow] = useState(Array(n * 2).fill(false))

  const [paused, setPaused] = useState(true)
  const [hasEnded, setHasEnded] = useState(true)
  const [isGameComplete, setIsGameComplete] = useState(true)

  const [selected, setSelected] = useState<number[]>([])

  const reveal = (idx: number) => {
    setShow((prev) =>
      prev.map((el, i) => {
        if (i === idx) {
          return true
        } else {
          return el
        }
      })
    )
  }

  const hide = (idx: number) => {
    setShow((prev) =>
      prev.map((el, i) => {
        if (i === idx) {
          return false
        } else {
          return el
        }
      })
    )
  }

  const select = (idx: number) => {
    setSelected((prev) => [...prev, idx])
    setRecord((prev) => [...prev, idx])
  }
  const [score, setScore] = useState<number | null>(1000)
  useEffect(() => {
    const runSequence = async () => {
      if (selected.length === 2) {
        await wait(300)
        triggerFlash()
        if (arr[selected[0]] !== arr[selected[1]]) {
          await wait(300)
          hide(selected[0])
          hide(selected[1])

          await wait(200)
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
      if (show.every((el) => el)) {
        setPaused(true)
        setHasEnded(true)
        if (n === 6) {
          await wait(5500)
        } else if (n === 8) {
          await wait(6000)
        } else {
          await wait(6500)
        }
        setIsGameComplete(true)
        setArr(shuffle(arr, seed))
        setShow(Array(n * 2).fill(false))
        selected.length === 0 &&
          onFinish?.({
            score: score ?? 0,
            time: timer,
          })
      }
    }

    runSequence()
  }, [selected])

  const resume = () => {
    setPaused(false)
  }

  const restart = () => {
    setPaused(true)
    setArr(shuffle(arr, seed))
    setShow(Array(n * 2).fill(false))
    setCounter(0)
    setScore(0)
    setHasEnded(true)
    setIsGameComplete(true)
    setSelected([])
  }

  const start = () => {
    setHasEnded(false)
    setIsGameComplete(false)
    setPaused(false)
    setCounter(0)
    setScore(0)
    setSelected([])
  }

  const [counter, setCounter] = useState(1110) // ms
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
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return isGameComplete ? (
    <div className="min-h-svh flex justify-center items-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center space-y-6"
      >
        {score !== null && (
          <>
            <motion.h1
              variants={item}
              className="text-4xl md:text-5xl font-extrabold
                tracking-wider
                border-b-4 border-yellow-400
                pb-2
                shadow-lg"
            >
              {getMessage(parseFloat(timer), n === 6 ? 12 : n === 8 ? 16 : 20)
                .split("")
                .map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    {char}
                  </motion.span>
                ))}
            </motion.h1>
            <motion.div
              variants={item}
              className="text-6xl md:text-7xl font-bold
              bg-clip-text text-transparent
              bg-linear-to-r from-yellow-300 via-red-400 to-pink-500
              drop-shadow-xl
              p-4
              rounded-xl
              flex items-center gap-4
              "
            >
              <Score value={score} />
              <span className="text-6xl"> PTS</span>
            </motion.div>
            <motion.div
              variants={item}
              className="text-2xl md:text-3xl font-mono
              text-cyan-300
              border-2 border-cyan-500/50
              rounded-lg
              px-4 py-2
              shadow-md"
            >
              {formatTime(parseFloat(timer))}
            </motion.div>
          </>
        )}

        <motion.button
          onClick={() => start()}
          variants={item}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            mt-6
          bg-blue-700
          text-white font-bold
          px-6 py-2
          rounded-lg
          shadow-sm
          transition-colors
          hover:bg-blue-600
          "
        >
          Play Again
        </motion.button>
      </motion.div>
    </div>
  ) : (
    <div className="min-h-svh flex justify-center items-center max-w-xl m-auto">
      <div className="w-full">
        <div className="p-4 flex space-x-4">
          <button onClick={() => resume()}>Resume</button>
          <button onClick={() => restart()}>restart</button>
          <p>{timer}</p>
          <p>
            <Score value={score ?? 0} />
          </p>
        </div>
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="p-4 grid grid-cols-4 gap-2"
        >
          {arr.map((el, i) => (
            <motion.div
              variants={item}
              key={i}
              className={cn(
                "min-h-28",
                show[i] || selected.length === 2 || (paused && counter > 0)
                  ? "pointer-events-none"
                  : ""
              )}
              onClick={() => {
                reveal(i)
                select(i)
              }}
            >
              <FlipCard
                show={show[i]}
                front={
                  <div className="h-full flex items-center justify-center bg-white rounded-lg">
                    <RenderIcon name="diamond" color="black" />
                  </div>
                }
                back={
                  <div
                    className={cn(
                      "h-full flex ring-2 items-center justify-center bg-black rounded-lg transition duration-100",
                      flash && (i === record.at(-1) || i === record.at(-2))
                        ? arr[selected[0]] !== arr[selected[1]]
                          ? "ring-red-500"
                          : "ring-green-400"
                        : "ring-transparent",
                      hasEnded ? `animate-ring-cycle` : ""
                    )}
                    style={{
                      animationDelay: `${i * 100 + 2000}ms`,
                    }}
                  >
                    <RenderIcon name={el} />
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

// 34:71 - 74335

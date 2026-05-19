import { useEffect, useState } from "react"
import "./App.css"
import { FlipCard } from "./components/FlipCard"
import { RenderIcon } from "./components/RenderIcon"
import { cn } from "./utils"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const baseScore = 0
const maxBonus = 500
const targetTime = 1 * 60 * 100

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
  seed?: number
}

export function MemoryGame({ seed = 0 }: MemoryGameProps) {
  const [arr, setArr] = useState<
    ("cake-slice" | "car" | "cloudy" | "drum" | "telescope" | "star")[]
  >(
    shuffle(
      [
        "cake-slice",
        "car",
        "cloudy",
        "drum",
        "telescope",
        "star",
        "cake-slice",
        "car",
        "cloudy",
        "drum",
        "telescope",
        "star",
      ],
      seed
    )
  )
  const [record, setRecord] = useState<number[]>([])

  const [show, setShow] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ])

  const [paused, setPaused] = useState(true)
  const [hasEnded, setHasEnded] = useState(false)

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
  const [score, setScore] = useState(0)
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
            Math.round(prev + baseScore + maxBonus * (targetTime / counter))
          )
          await wait(100)
        }

        setSelected([])
      }
    }
    if (show.every((el) => el)) {
      setPaused(true)
      setHasEnded(true)
    }
    runSequence()
  }, [selected])

  const start = () => {
    setPaused(false)
  }

  const restart = () => {
    setPaused(true)
    setArr(shuffle(arr, seed))
    setShow([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ])
    setCounter(0)
    setScore(0)
    setHasEnded(false)
  }

  const [counter, setCounter] = useState(0)
  const timer = (counter / 100).toFixed(2)
  useEffect(() => {
    const interval = setInterval(() => {
      !paused && setCounter((prev) => prev + 1)
    }, 10)
    return () => clearInterval(interval)
  }, [paused])

  const [flash, setFlash] = useState(false)

  const triggerFlash = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }

  return (
    <>
      <div className="p-4 flex space-x-4">
        <button onClick={() => start()}>start</button>
        <button onClick={() => restart()}>restart</button>
        <p>{timer}</p>
        <p>{score}</p>
      </div>
      <div className="p-4 grid grid-cols-4 gap-2">
        {arr.map((el, i) => (
          <div
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
              counter === 0 && setPaused(false)
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
          </div>
        ))}
      </div>
    </>
  )
}

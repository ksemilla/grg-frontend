import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useAnimation,
} from "framer-motion"
import { useEffect } from "react"

type ScoreProps = {
  value: number
  className?: string
}

export function Score({ value, className }: ScoreProps) {
  const score = useMotionValue(value)

  const rounded = useTransform(score, (latest) => Math.round(latest))
  const controls = useAnimation()

  useEffect(() => {
    animate(score, value, {
      duration: 0.6,
      ease: "easeOut",
      onComplete: () =>
        controls.start({ scale: [1, 1.2, 1], transition: { duration: 0.25 } }),
    })
  }, [value])

  return (
    <motion.span animate={controls} className={className}>
      {rounded}
    </motion.span>
  )
}

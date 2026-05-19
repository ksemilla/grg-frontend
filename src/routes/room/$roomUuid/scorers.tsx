import { useRoomStore } from "@/stores/roomStore"
import { createFileRoute } from "@tanstack/react-router"
import { type Transition } from "motion/react"
import * as motion from "motion/react-client"

const spring: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 100,
}

export const Route = createFileRoute("/room/$roomUuid/scorers")({
  component: RouteComponent,
})

function RouteComponent() {
  const roomStore = useRoomStore()

  const filtered = roomStore.value?.players.filter((pn) => pn.score)

  return (
    <div>
      {filtered
        ?.sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((pn, i) => (
          <motion.div
            key={pn.uuid}
            layout
            transition={spring}
            style={{ fontSize: `${20 + Math.pow(5 - i, 0.8)}px` }}
          >
            {pn.name}: {pn.score}
          </motion.div>
        ))}
    </div>
  )
}

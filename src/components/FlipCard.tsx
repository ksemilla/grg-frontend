import { cn } from "../utils"

type FlipCardProps = {
  show: boolean
  front: React.ReactNode
  back: React.ReactNode
}

export function FlipCard({ show, front, back }: FlipCardProps) {
  return (
    <div className="w-full h-full rounded-xl cursor-pointer perspective-1000">
      <div
        className={cn(
          "w-full h-full relative duration-500 preserve-3d",
          show && "rotate-y-180"
        )}
      >
        <div className="w-full h-full absolute backface-hidden">
          {front ?? <p className="text-black bg-white">front</p>}
        </div>
        <div
          className={cn("w-full h-full absolute rotate-y-180 backface-hidden")}
        >
          {back ?? <p>back</p>}
        </div>
      </div>
    </div>
  )
}

import {
  CakeSlice,
  Car,
  Cloudy,
  Club,
  Crown,
  Diamond,
  Drum,
  Drumstick,
  Dumbbell,
  Fish,
  Flame,
  FlaskRound,
  Flower2,
  Footprints,
  Gamepad2,
  Gem,
  Ghost,
  Glasses,
  Helicopter,
  IceCreamCone,
  KeyRound,
  LampDesk,
  Leaf,
  Mic,
  Music,
  Panda,
  PawPrint,
  Phone,
  Piano,
  Plane,
  Rabbit,
  Rocket,
  Sailboat,
  Snail,
  Star,
  Telescope,
  TreePalm,
  Utensils,
  Zap,
} from "lucide-react"

export const iconMapping = {
  "cake-slice": CakeSlice,
  car: Car,
  cloudy: Cloudy,
  drum: Drum,
  telescope: Telescope,
  star: Star,
}

type RenderIconProps = {
  name:
    | "cake-slice"
    | "car"
    | "cloudy"
    | "drum"
    | "telescope"
    | "star"
    | "diamond"
    | "club"
    | "crown"
    | "dumbbell"
    | "drumbstick"
    | "fish"
    | "flame"
    | "flask-round"
    | "flower-2"
    | "footprints"
    | "gamepad-2"
    | "gem"
    | "ghost"
    | "glasses"
    | "ice-cream-cone"
    | "helicopter"
    | "key-round"
    | "lamp-desk"
    | "leaf"
    | "mic"
    | "music"
    | "panda"
    | "phone"
    | "piano"
    | "paw-print"
    | "plane"
    | "rabbit"
    | "rocket"
    | "sailboat"
    | "snail"
    | "tree-palm"
    | "utensils"
    | "zap"
  size?: number
  color?: string
}

export function RenderIcon({ name, size = 36, color }: RenderIconProps) {
  return name === "cake-slice" ? (
    <CakeSlice size={size} color={color} />
  ) : name === "cloudy" ? (
    <Cloudy size={size} color={color} />
  ) : name === "car" ? (
    <Car size={size} color={color} />
  ) : name === "drum" ? (
    <Drum size={size} color={color} />
  ) : name === "telescope" ? (
    <Telescope size={size} color={color} />
  ) : name === "star" ? (
    <Star size={size} color={color} />
  ) : name === "club" ? (
    <Club size={size} color={color} />
  ) : name === "crown" ? (
    <Crown size={size} color={color} />
  ) : name === "dumbbell" ? (
    <Dumbbell size={size} color={color} />
  ) : name === "drumbstick" ? (
    <Drumstick size={size} color={color} />
  ) : name === "fish" ? (
    <Fish size={size} color={color} />
  ) : name === "flame" ? (
    <Flame size={size} color={color} />
  ) : name === "flask-round" ? (
    <FlaskRound size={size} color={color} />
  ) : name === "flower-2" ? (
    <Flower2 size={size} color={color} />
  ) : name === "footprints" ? (
    <Footprints size={size} color={color} />
  ) : name === "gamepad-2" ? (
    <Gamepad2 size={size} color={color} />
  ) : name === "gem" ? (
    <Gem size={size} color={color} />
  ) : name === "ghost" ? (
    <Ghost size={size} color={color} />
  ) : name === "glasses" ? (
    <Glasses size={size} color={color} />
  ) : name === "ice-cream-cone" ? (
    <IceCreamCone size={size} color={color} />
  ) : name === "helicopter" ? (
    <Helicopter size={size} color={color} />
  ) : name === "key-round" ? (
    <KeyRound size={size} color={color} />
  ) : name === "lamp-desk" ? (
    <LampDesk size={size} color={color} />
  ) : name === "leaf" ? (
    <Leaf size={size} color={color} />
  ) : name === "mic" ? (
    <Mic size={size} color={color} />
  ) : name === "music" ? (
    <Music size={size} color={color} />
  ) : name === "panda" ? (
    <Panda size={size} color={color} />
  ) : name === "phone" ? (
    <Phone size={size} color={color} />
  ) : name === "piano" ? (
    <Piano size={size} color={color} />
  ) : name === "paw-print" ? (
    <PawPrint size={size} color={color} />
  ) : name === "plane" ? (
    <Plane size={size} color={color} />
  ) : name === "rabbit" ? (
    <Rabbit size={size} color={color} />
  ) : name === "rocket" ? (
    <Rocket size={size} color={color} />
  ) : name === "sailboat" ? (
    <Sailboat size={size} color={color} />
  ) : name === "snail" ? (
    <Snail size={size} color={color} />
  ) : name === "tree-palm" ? (
    <TreePalm size={size} color={color} />
  ) : name === "utensils" ? (
    <Utensils size={size} color={color} />
  ) : name === "zap" ? (
    <Zap size={size} color={color} />
  ) : (
    <Diamond size={size} color={color} />
  )
}

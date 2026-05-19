import { create } from "zustand"

type Player = {
  uuid: string
  name: string
  score: number
  time: string
}

type RoomValue = {
  player_names: string[]
  players: Player[]
  is_admin: boolean
}

interface RoomState {
  something?: any
  setSomething: (data: any) => void

  count?: number
  incrementCount: () => void

  name?: string
  setName: (name: string) => void

  code?: string
  setCode: (code: string) => void

  token?: string
  setToken: (token: string) => void

  isAdmin?: boolean
  setIsAdmin: (isAdmin: boolean) => void

  value?: RoomValue
  setValue: (value: RoomValue) => void
}

export const useRoomStore = create<RoomState>()((set) => ({
  count: 0,
  incrementCount: () =>
    set((state) => ({ ...state, count: (state.count || 0) + 1 })),
  setName: (name) => set((state) => ({ ...state, name })),
  setCode: (code) => set((state) => ({ ...state, code })),
  setToken: (token) => set((state) => ({ ...state, token })),
  setIsAdmin: (isAdmin) => set((state) => ({ ...state, isAdmin })),
  setSomething: (data) => set((state) => ({ ...state, something: data })),

  setValue: (value) => set((state) => ({ ...state, value })),
}))

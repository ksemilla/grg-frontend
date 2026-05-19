import { createContext, useContext, type ReactNode } from "react"

type Primitive = string | number | boolean | null

type DictValue = Primitive | DictValue[] | { [key: string]: DictValue }

type Message = {
  type: string
} & {
  [key: string]: DictValue
}

export type MessageContextType = {
  sendMessage: (message: Message) => void
}

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
)

type ProviderProps = {
  children: ReactNode
  sendMessage: (message: Message) => void
}

export function MessageProvider({ children, sendMessage }: ProviderProps) {
  return (
    <MessageContext.Provider value={{ sendMessage }}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  const context = useContext(MessageContext)

  if (!context) {
    throw new Error("useMyContext must be used within MyProvider")
  }

  return context
}

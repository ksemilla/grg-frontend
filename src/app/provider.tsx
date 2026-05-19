import { ThemeProvider } from "@/components/theme-provider"

type AppProviderProps = {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}

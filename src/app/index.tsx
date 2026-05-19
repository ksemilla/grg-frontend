import { useEffect, useState } from "react"
import { AppProvider } from "./provider"
import { AppRouter } from "./router"
import { getUuid } from "@/features/core/api/get-uuid"

export function App() {
  const [loading, setLoading] = useState(true)
  const [_, setError] = useState("")

  useEffect(() => {
    const uuid = localStorage.getItem("uuid")
    if (!uuid) {
      getUuid()
        .then((res) => {
          localStorage.setItem("uuid", res.data.uuid)
          setLoading(false)
          setError("")
        })
        .catch(() => {
          setError("Something went wrong. Try to refresh the page.")
        })
    } else {
      setLoading(false)
      setError("")
    }
  }, [])

  if (loading) return <p className="max-w-md">Loading...</p>

  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}

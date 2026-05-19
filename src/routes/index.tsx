import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getToken } from "@/features/auth/api/get-token"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

import QRCode from "react-qr-code"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const [token, setToken] = useState("")

  const login = () => {
    getToken("uuid", "kevin@test.com").then((res) => setToken(res.data.token))
  }

  return (
    <div className="max-w-sm m-auto pt-24 space-y-8">
      <p className="text-xl italic">
        You seemed lost. <br />
        Not broken. <br />
        Not behind. <br />
        Just in between. <br />
        This is a good place to pause.
      </p>
      <Input placeholder="Enter room ID" />
      <div className="bg-white">
        <QRCode
          value={`http://192.168.1.103:5173/room/uuid/?code=code&token=${token}`}
        />
      </div>
      <Button asChild>
        <Link
          to="/room/$roomUuid"
          params={{ roomUuid: "uuid" }}
          className="text-black"
        >
          Go to room1
        </Link>
      </Button>
      <Button asChild>
        <Link
          to="/room/$roomUuid"
          params={{ roomUuid: "uuid" }}
          search={{
            code: "code",
          }}
          className="text-black"
        >
          Go to room with code
        </Link>
      </Button>
      <div className="bg-white">
        <Button onClick={() => login()}>Get Token</Button>
        {token && (
          <Button asChild>
            <Link
              to="/room/$roomUuid"
              params={{ roomUuid: "uuid" }}
              search={{
                code: "code",
                token: token,
              }}
              className="text-black"
            >
              Go to room as admin
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

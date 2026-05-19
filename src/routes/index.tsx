import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getToken } from "@/features/auth/api/get-token"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

import QRCode from "react-qr-code"

import { motion } from "framer-motion"
import { Score } from "@/components/Score"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const [token, setToken] = useState("")

  const login = () => {
    getToken("uuid", "kevin@test.com").then((res) => setToken(res.data.token))
  }
  const [value, setValue] = useState(100)

  const container = {
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }
  // return (
  //   <div className="border min-h-svh flex justify-center items-center">
  //     <motion.div
  //       initial={{ scale: 0.8, opacity: 0 }}
  //       animate={{ scale: 1, opacity: 100 }}
  //       transition={{
  //         duration: 0.2,
  //         ease: "easeOut",
  //       }}
  //     >
  //       <Button onClick={() => setValue((p) => p + 100)}>Start</Button>
  //     </motion.div>
  //     <Score value={value} />
  //     <motion.div initial="hidden" animate="show" variants={container}>
  //       <motion.h1 variants={item}>H!</motion.h1>
  //       <motion.div variants={item}>ASDASDASD</motion.div>
  //       <motion.div variants={item}>ASDASDASDASDASD</motion.div>
  //       <motion.button variants={item}>ASDADASDASDA</motion.button>
  //     </motion.div>
  //   </div>
  // )

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
          Go to room
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

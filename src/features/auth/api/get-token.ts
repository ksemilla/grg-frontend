import axios from "axios"

const BASE_API = import.meta.env.VITE_APP_ROOT_API

export const getToken = (roomUuid: string, email: string) => {
  return axios.post(`${BASE_API}/room/uuid/auth/`, {
    email,
    room_uuid: roomUuid,
  })
}

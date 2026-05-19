import axios from "axios"

const BASE_API = import.meta.env.VITE_APP_ROOT_API

export const getUuid = () => {
  return axios.get(`${BASE_API}/uuid/`)
}

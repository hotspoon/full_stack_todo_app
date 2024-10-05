import { API_URL } from "../constant/config"

export const fetchTasks = async () => {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  return response.json()
}

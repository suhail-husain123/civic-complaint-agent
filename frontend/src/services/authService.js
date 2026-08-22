import { apiRequest } from "./api"
import {
  getToken,
  setToken,
  removeToken
} from "../utils/auth"

export async function loginUser(
  email,
  password
) {
  const data = await apiRequest(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password
      })
    }
  )

  setToken(data.access_token)

  return data
}

export async function registerUser(
  name,
  email,
  password
) {
  return apiRequest(
    "/users",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password
      })
    }
  )
}

export async function getCurrentUser() {
  return apiRequest("/users/me")
}

export function logoutUser() {
  removeToken()
}

export function hasToken() {
  return Boolean(getToken())
}
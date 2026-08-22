export function getToken() {
  return localStorage.getItem("token")
}

export function setToken(token) {
  localStorage.setItem(
    "token",
    token
  )
}

export function removeToken() {
  localStorage.removeItem("token")
}

export function isLoggedIn() {
  return Boolean(
    localStorage.getItem("token")
  )
}

export function logout() {
  localStorage.removeItem("token")
}
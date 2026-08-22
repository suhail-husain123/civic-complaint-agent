const API_URL = import.meta.env.VITE_API_URL


export async function apiRequest(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem("token")


  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : {
          "Content-Type":
            "application/json"
        }),

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`
        }
      : {}),

    ...(options.headers || {})
  }


  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers
    }
  )


  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }


  // JWT expired / invalid
  if (response.status === 401) {

    localStorage.removeItem("token")

    // Avoid redirect loop while
    // user is already on login page
    if (
      window.location.pathname !==
      "/login"
    ) {
      window.location.replace(
        "/login"
      )
    }

    throw new Error(
      "Your session has expired. Please sign in again."
    )
  }


  if (!response.ok) {
    throw new Error(
      data?.detail ||
      "Something went wrong"
    )
  }


  return data
}


export default API_URL
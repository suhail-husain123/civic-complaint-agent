import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import Loader from "./Loader"
import { apiRequest } from "../services/api"
import { isLoggedIn, logout } from "../utils/auth"

function ProtectedRoute({
  children,
  allowedRoles = []
}) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      if (!isLoggedIn()) {
        setLoading(false)
        return
      }

      try {
        const userData = await apiRequest(
          "/users/me"
        )

        setUser(userData)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  if (loading) {
    return (
      <Loader text="Checking access..." />
    )
  }

  if (!isLoggedIn() || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "CITIZEN") {
      return (
        <Navigate
          to="/citizen/dashboard"
          replace
        />
      )
    }

    if (user.role === "DEPARTMENT_ADMIN") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      )
    }

    if (user.role === "SUPER_ADMIN") {
      return (
        <Navigate
          to="/super-admin/dashboard"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute
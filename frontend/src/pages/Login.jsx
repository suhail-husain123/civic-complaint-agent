import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  getCurrentUser,
  loginUser
} from "../services/authService"

import {
  ROLE_HOME_ROUTES
} from "../utils/constants"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      await loginUser(
        email,
        password
      )

      const user =
        await getCurrentUser()

      const destination =
        ROLE_HOME_ROUTES[
          user.role
        ]

      if (!destination) {
        throw new Error(
          "Unknown user role."
        )
      }

      navigate(
        destination,
        {
          replace: true
        }
      )
    } catch (err) {
      setError(
        err.message ||
          "Login failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-wrapper">

        <div className="auth-brand-panel">

          <div className="auth-brand">

            <div className="auth-logo">
              C
            </div>

            <div>
              <h1>
                CivicResolve
              </h1>

              <p>
                AI Complaint System
              </p>
            </div>

          </div>

          <div className="auth-brand-content">

            <h2>
              Smarter civic complaint
              resolution.
            </h2>

            <p>
              Report civic issues, track
              their progress, and let AI
              automatically route complaints
              to the right department.
            </p>

            <div className="auth-feature-list">

              <div>
                <span>✓</span>
                AI complaint classification
              </div>

              <div>
                <span>✓</span>
                Automatic department routing
              </div>

              <div>
                <span>✓</span>
                SLA tracking and escalation
              </div>

              <div>
                <span>✓</span>
                Transparent complaint history
              </div>

            </div>

          </div>

        </div>

        <div className="auth-form-panel">

          <div className="auth-form-container">

            <div className="auth-heading">

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue to
                CivicResolve.
              </p>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <div className="form-group">

                <label
                  className="form-label"
                  htmlFor="email"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label
                  className="form-label"
                  htmlFor="password"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>

            </form>

            <p className="auth-switch">
              Don't have an account?{" "}

              <Link to="/register">
                Create account
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login
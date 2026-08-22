import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  registerUser
} from "../services/authService"

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      )
      return
    }

    if (
      password.length < 6
    ) {
      setError(
        "Password must be at least 6 characters long."
      )
      return
    }

    setLoading(true)

    try {
      await registerUser(
        name,
        email,
        password
      )

      setSuccess(
        "Account created successfully. Redirecting to login..."
      )

      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true
          }
        )
      }, 1200)
    } catch (err) {
      setError(
        err.message ||
          "Registration failed. Please try again."
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
              Make your city issues heard.
            </h2>

            <p>
              Create an account, report civic
              problems and let CivicResolve
              automatically identify the issue,
              priority and responsible
              department.
            </p>

            <div className="auth-feature-list">

              <div>
                <span>✓</span>
                Easy complaint submission
              </div>

              <div>
                <span>✓</span>
                AI-powered routing
              </div>

              <div>
                <span>✓</span>
                Real-time complaint tracking
              </div>

              <div>
                <span>✓</span>
                Resolution history
              </div>

            </div>

          </div>

        </div>

        <div className="auth-form-panel">

          <div className="auth-form-container">

            <div className="auth-heading">

              <h2>
                Create account
              </h2>

              <p>
                Register as a citizen to
                report and track civic
                complaints.
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

              {success && (
                <div className="auth-success">
                  {success}
                </div>
              )}

              <div className="form-group">

                <label
                  className="form-label"
                  htmlFor="name"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label
                  className="form-label"
                  htmlFor="confirm-password"
                >
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="Enter password again"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
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
                  ? "Creating account..."
                  : "Create Account"}
              </button>

            </form>

            <p className="auth-switch">
              Already have an account?{" "}

              <Link to="/login">
                Sign in
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register
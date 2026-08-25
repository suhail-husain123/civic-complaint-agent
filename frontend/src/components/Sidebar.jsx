import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

import {
  logout
} from "../utils/auth"

function Sidebar({ role }) {
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] =
    useState(false)

  const citizenLinks = [
    {
      label: "Dashboard",
      path: "/citizen/dashboard",
      icon: "⌂"
    },
    {
      label: "New Complaint",
      path: "/citizen/create-complaint",
      icon: "+"
    },
    {
      label: "My Complaints",
      path: "/citizen/complaints",
      icon: "📋"
    },
    {
      label: "Notifications",
      path: "/citizen/notifications",
      icon: "🔔"
    }
  ]

  const adminLinks = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "⌂"
    },
    {
      label: "Complaints",
      path: "/admin/complaints",
      icon: "📋"
    },
    {
      label: "Escalations",
      path: "/admin/escalations",
      icon: "!"
    }
  ]

  const superAdminLinks = [
    {
      label: "Dashboard",
      path: "/super-admin/dashboard",
      icon: "⌂"
    },
    {
      label: "All Complaints",
      path: "/super-admin/complaints",
      icon: "📋"
    },
    {
      label: "Departments",
      path: "/super-admin/departments",
      icon: "🏢"
    },
    {
      label: "Admins",
      path: "/super-admin/admins",
      icon: "👤"
    }
  ]

  const roleLabels = {
    CITIZEN: "Citizen Portal",
    DEPARTMENT_ADMIN: "Department Admin",
    SUPER_ADMIN: "Super Admin"
  }

  let links = citizenLinks

  if (role === "DEPARTMENT_ADMIN") {
    links = adminLinks
  }

  if (role === "SUPER_ADMIN") {
    links = superAdminLinks
  }

  function closeSidebar() {
    setMobileOpen(false)
  }

  function handleLogout() {
    logout()

    navigate(
      "/login",
      {
        replace: true
      }
    )
  }

  return (
    <>
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() =>
          setMobileOpen(true)
        }
        aria-label="Open navigation"
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={
          mobileOpen
            ? "sidebar mobile-open"
            : "sidebar"
        }
      >

        <div className="sidebar-brand">

          <div className="sidebar-brand-logo">
            CR
          </div>

          <div className="sidebar-brand-text">

            <h2>
              CivicResolve
            </h2>

            <p>
              AI Complaint System
            </p>

          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            ×
          </button>

        </div>

        <div className="sidebar-role">
          {roleLabels[role] ||
            "CivicResolve"}
        </div>

        <nav className="sidebar-nav">

          {links.map(
            (link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={
                  ({ isActive }) =>
                    isActive
                      ? "sidebar-link active"
                      : "sidebar-link"
                }
              >

                <span className="sidebar-icon">
                  {link.icon}
                </span>

                <span>
                  {link.label}
                </span>

              </NavLink>
            )
          )}

        </nav>

        <div className="sidebar-footer">

          <div className="sidebar-footer-product">

            <div className="sidebar-footer-logo">
              AI
            </div>

            <div>

              <strong>
                CivicResolve
              </strong>

              <p>
                AI-assisted civic workflow
              </p>

            </div>

          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>
    </>
  )
}

export default Sidebar
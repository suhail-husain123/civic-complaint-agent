import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"
import ComplaintCard from "../../components/ComplaintCard"

import {
  getCurrentUser
} from "../../services/authService"

import {
  getSuperAdminDashboard,
  getDepartments,
  getAdmins
} from "../../services/adminService"

import {
  getAdminComplaints
} from "../../services/complaintService"


function SuperAdminDashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)

  const [departments, setDepartments] = useState([])
  const [admins, setAdmins] = useState([])
  const [complaints, setComplaints] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError("")

        const [
          userData,
          dashboardData,
          departmentData,
          adminData,
          complaintData
        ] = await Promise.all([
          getCurrentUser(),
          getSuperAdminDashboard(),
          getDepartments(),
          getAdmins(),
          getAdminComplaints()
        ])

        setUser(userData)
        setDashboard(dashboardData)

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : departmentData?.departments || []
        )

        setAdmins(
          Array.isArray(adminData)
            ? adminData
            : adminData?.admins || []
        )

        setComplaints(
          Array.isArray(complaintData)
            ? complaintData
            : complaintData?.complaints || []
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load super admin dashboard."
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="SUPER_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading system dashboard..." />
        </main>

      </div>
    )
  }


  const totalComplaints =
    dashboard?.total_complaints ??
    complaints.length


  const totalDepartments =
    dashboard?.total_departments ??
    departments.length


  const totalAdmins =
    dashboard?.total_admins ??
    admins.length


  const escalatedComplaints =
    dashboard?.escalated_complaints ??
    complaints.filter(
      (complaint) =>
        complaint.is_escalated === true
    ).length


  const manualReviewComplaints =
    dashboard?.manual_review_required ??
    complaints.filter(
      (complaint) =>
        complaint.status ===
          "MANUAL_REVIEW_REQUIRED" ||
        complaint.requires_human_review === true
    ).length


  const activeComplaints =
    dashboard?.active_complaints ??
    complaints.filter(
      (complaint) =>
        ![
          "RESOLVED",
          "CLOSED"
        ].includes(
          complaint.status
        )
    ).length


  const recentComplaints =
    [...complaints]
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .slice(0, 3)


  return (
    <div className="dashboard-layout">

      <Sidebar role="SUPER_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content superadmin-dashboard-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                System Administration
              </p>

              <h1 className="page-title">
                Welcome, {user?.name || "Super Admin"}
              </h1>

              <p className="page-subtitle">
                Monitor CivicResolve across all
                departments, administrators and
                complaint workflows.
              </p>

            </div>

          </header>


          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* METRICS */}

          <section className="dashboard-metric-grid">

            <div className="dashboard-metric-card">

              <div className="metric-icon metric-blue">
                📋
              </div>

              <div className="metric-content">

                <span>
                  Total Complaints
                </span>

                <strong>
                  {totalComplaints}
                </strong>

              </div>

            </div>


            <div className="dashboard-metric-card">

              <div className="metric-icon metric-purple">
                🏢
              </div>

              <div className="metric-content">

                <span>
                  Departments
                </span>

                <strong>
                  {totalDepartments}
                </strong>

              </div>

            </div>


            <div className="dashboard-metric-card">

              <div className="metric-icon metric-green">
                👤
              </div>

              <div className="metric-content">

                <span>
                  Department Admins
                </span>

                <strong>
                  {totalAdmins}
                </strong>

              </div>

            </div>


            <div className="dashboard-metric-card">

              <div className="metric-icon metric-red">
                !
              </div>

              <div className="metric-content">

                <span>
                  Escalated
                </span>

                <strong>
                  {escalatedComplaints}
                </strong>

              </div>

            </div>

          </section>


          {/* SYSTEM BANNER */}

          <section className="dashboard-ai-banner superadmin-system-banner">

            <div className="dashboard-ai-content">

              <span className="dashboard-ai-label">
                SYSTEM CONTROL
              </span>

              <h2>
                CivicResolve operations overview
              </h2>

              <p>
                Manage departments and administrators
                while monitoring AI-assisted complaint
                routing, manual review and SLA
                escalation across the platform.
              </p>

            </div>


            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/super-admin/complaints"
                )
              }
            >
              View All Complaints
            </button>

          </section>


          {/* QUICK ACTIONS */}

          <section className="superadmin-action-grid">


            <button
              type="button"
              className="admin-action-tile"
              onClick={() =>
                navigate(
                  "/super-admin/departments"
                )
              }
            >

              <div className="admin-action-tile-icon blue">
                🏢
              </div>

              <div>

                <h3>
                  Manage Departments
                </h3>

                <p>
                  Create and maintain civic
                  departments used for complaint
                  routing.
                </p>

              </div>

              <span className="admin-action-arrow">
                →
              </span>

            </button>


            <button
              type="button"
              className="admin-action-tile"
              onClick={() =>
                navigate(
                  "/super-admin/admins"
                )
              }
            >

              <div className="admin-action-tile-icon purple">
                👤
              </div>

              <div>

                <h3>
                  Manage Admins
                </h3>

                <p>
                  Create department administrators
                  and assign them to departments.
                </p>

              </div>

              <span className="admin-action-arrow">
                →
              </span>

            </button>


            <button
              type="button"
              className="admin-action-tile"
              onClick={() =>
                navigate(
                  "/super-admin/complaints"
                )
              }
            >

              <div className="admin-action-tile-icon green">
                📋
              </div>

              <div>

                <h3>
                  All Complaints
                </h3>

                <p>
                  Monitor complaints across every
                  department from one place.
                </p>

              </div>

              <span className="admin-action-arrow">
                →
              </span>

            </button>

          </section>


          {/* MAIN CONTENT */}

          <section className="dashboard-content-grid">


            {/* LEFT */}

            <div className="dashboard-primary-column">

              <section className="dashboard-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      Recent Complaints
                    </h2>

                    <p>
                      Latest complaints submitted
                      across CivicResolve.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      navigate(
                        "/super-admin/complaints"
                      )
                    }
                  >
                    View all
                  </button>

                </div>


                {recentComplaints.length === 0 ? (

                  <div className="empty-state">

                    <h3>
                      No complaints available
                    </h3>

                    <p>
                      Submitted complaints will
                      appear here.
                    </p>

                  </div>

                ) : (

                  <div className="dashboard-complaint-list">

                    {recentComplaints.map(
                      (complaint) => (

                        <ComplaintCard
                          key={complaint.id}
                          complaint={complaint}
                          basePath="/super-admin/complaints"
                        />

                      )
                    )}

                  </div>

                )}

              </section>

            </div>


            {/* RIGHT */}

            <aside className="dashboard-secondary-column">


              {/* SYSTEM STATUS */}

              <section className="dashboard-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      System Status
                    </h2>

                    <p>
                      Current complaint workload.
                    </p>

                  </div>

                </div>


                <div className="dashboard-status-list">


                  <div className="dashboard-status-item">

                    <div>

                      <span className="dashboard-status-dot blue">
                      </span>

                      <span>
                        Active
                      </span>

                    </div>

                    <strong>
                      {activeComplaints}
                    </strong>

                  </div>


                  <div className="dashboard-status-item">

                    <div>

                      <span className="dashboard-status-dot purple">
                      </span>

                      <span>
                        Manual Review
                      </span>

                    </div>

                    <strong>
                      {manualReviewComplaints}
                    </strong>

                  </div>


                  <div className="dashboard-status-item">

                    <div>

                      <span className="dashboard-status-dot red">
                      </span>

                      <span>
                        Escalated
                      </span>

                    </div>

                    <strong>
                      {escalatedComplaints}
                    </strong>

                  </div>

                </div>

              </section>


              {/* PLATFORM CARD */}

              <section className="dashboard-panel dashboard-workflow-panel">

                <span className="dashboard-ai-label">
                  PLATFORM
                </span>

                <h2>
                  Centralized oversight
                </h2>

                <p className="dashboard-workflow-description">
                  Super Admin controls system-level
                  configuration while individual
                  departments handle complaint
                  resolution.
                </p>


                <div className="superadmin-platform-stats">

                  <div>

                    <span>
                      Departments
                    </span>

                    <strong>
                      {totalDepartments}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Admins
                    </span>

                    <strong>
                      {totalAdmins}
                    </strong>

                  </div>

                </div>

              </section>

            </aside>

          </section>

        </div>

      </main>

    </div>
  )
}


export default SuperAdminDashboard
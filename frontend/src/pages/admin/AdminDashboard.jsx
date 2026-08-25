import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"
import ComplaintCard from "../../components/ComplaintCard"

import {
  getCurrentUser
} from "../../services/authService"

import {
  getAdminComplaints
} from "../../services/complaintService"

import {
  getDepartmentDashboard
} from "../../services/adminService"


function AdminDashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)
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
          complaintData
        ] = await Promise.all([
          getCurrentUser(),
          getDepartmentDashboard(),
          getAdminComplaints()
        ])

        setUser(userData)
        setDashboard(dashboardData)

        setComplaints(
          Array.isArray(complaintData)
            ? complaintData
            : complaintData?.complaints || []
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load department dashboard."
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

        <Sidebar role="DEPARTMENT_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading department dashboard..." />
        </main>

      </div>
    )
  }


  const totalComplaints =
    dashboard?.total_complaints ??
    complaints.length


 const activeComplaints =
    complaints.filter(
        (complaint) =>
          ![
            "RESOLVED",
            "CLOSED"
            ].includes(
                complaint.status
            )
        ).length


  const criticalComplaints =
    dashboard?.critical_complaints ??
    complaints.filter(
      (complaint) =>
        complaint.priority ===
        "CRITICAL"
    ).length


  const resolvedComplaints =
   complaints.filter(
     (complaint) =>
       complaint.status ===
       "RESOLVED"
   ).length


  const inProgressComplaints =
    dashboard?.in_progress_complaints ??
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "IN_PROGRESS"
    ).length


  const escalatedComplaints =
    dashboard?.escalated_complaints ??
    complaints.filter(
      (complaint) =>
        complaint.is_escalated === true
    ).length


  const urgentComplaints =
    complaints
      .filter(
        (complaint) =>
          complaint.priority ===
            "CRITICAL" ||
          complaint.is_escalated === true
      )
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .slice(0, 3)


  return (
    <div className="dashboard-layout">

      <Sidebar role="DEPARTMENT_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content admin-dashboard-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                Department Operations
              </p>

              <h1 className="page-title">
                Welcome, {user?.name || "Admin"}
              </h1>

              <p className="page-subtitle">
                Monitor, manage and resolve
                complaints assigned to your
                department.
              </p>

            </div>


            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/admin/complaints"
                )
              }
            >
              Open Complaint Queue
            </button>

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
                ◷
              </div>

              <div className="metric-content">

                <span>
                  Active
                </span>

                <strong>
                  {activeComplaints}
                </strong>

              </div>

            </div>


            <div className="dashboard-metric-card">

              <div className="metric-icon metric-red">
                !
              </div>

              <div className="metric-content">

                <span>
                  Critical
                </span>

                <strong>
                  {criticalComplaints}
                </strong>

              </div>

            </div>


            <div className="dashboard-metric-card">

              <div className="metric-icon metric-purple">
                ✓
              </div>

              <div className="metric-content">

                <span>
                  Resolved
                </span>

                <strong>
                  {resolvedComplaints}
                </strong>

              </div>

            </div>

          </section>


          {/* ATTENTION BANNER */}

          <section className="dashboard-ai-banner admin-attention-banner">

            <div className="dashboard-ai-content">

              <span className="dashboard-ai-label">
                DEPARTMENT OPERATIONS
              </span>

              <h2>
                Cases that need attention
              </h2>

              <p>
                CivicResolve automatically
                classifies and routes complaints,
                while your department manages
                assigned, critical and escalated
                cases.
              </p>

            </div>


            <div className="admin-banner-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  navigate(
                    "/admin/complaints"
                  )
                }
              >
                View Complaints
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate(
                    "/admin/escalations"
                  )
                }
              >
                View Escalations
              </button>

            </div>

          </section>


          {/* QUICK ACTIONS */}

          <section className="admin-action-grid-standardized">

            <button
              type="button"
              className="admin-action-tile"
              onClick={() =>
                navigate(
                  "/admin/complaints"
                )
              }
            >

              <div className="admin-action-tile-icon blue">
                📋
              </div>

              <div>

                <h3>
                  Complaint Queue
                </h3>

                <p>
                  Manage all complaints assigned
                  to your department.
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
                  "/admin/complaints"
                )
              }
            >

              <div className="admin-action-tile-icon purple">
                ◷
              </div>

              <div>

                <h3>
                  In Progress
                </h3>

                <p>
                  Continue working on active
                  department complaints.
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
                  "/admin/escalations"
                )
              }
            >

              <div className="admin-action-tile-icon red">
                !
              </div>

              <div>

                <h3>
                  Escalations
                </h3>

                <p>
                  Review complaints that exceeded
                  their SLA deadlines.
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
                      Needs Attention
                    </h2>

                    <p>
                      Critical and escalated
                      complaints.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      navigate(
                        "/admin/complaints"
                      )
                    }
                  >
                    View all
                  </button>

                </div>


                {urgentComplaints.length === 0 ? (

                  <div className="empty-state">

                    <h3>
                      Nothing urgent
                    </h3>

                    <p>
                      No complaints currently
                      require immediate attention.
                    </p>

                  </div>

                ) : (

                  <div className="dashboard-complaint-list">

                    {urgentComplaints.map(
                      (complaint) => (

                        <ComplaintCard
                          key={complaint.id}
                          complaint={complaint}
                          basePath="/admin/complaints"
                        />

                      )
                    )}

                  </div>

                )}

              </section>

            </div>


            {/* RIGHT */}

            <aside className="dashboard-secondary-column">


              {/* STATUS */}

              <section className="dashboard-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Department Overview
                    </h2>

                    <p>
                      Current workload snapshot.
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
                        In Progress
                      </span>

                    </div>

                    <strong>
                      {inProgressComplaints}
                    </strong>

                  </div>


                  <div className="dashboard-status-item">

                    <div>

                      <span className="dashboard-status-dot red">
                      </span>

                      <span>
                        Critical
                      </span>

                    </div>

                    <strong>
                      {criticalComplaints}
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


              {/* AGENT CARD */}

              <section className="dashboard-panel dashboard-workflow-panel">

                <span className="dashboard-ai-label">
                  CIVICRESOLVE AGENT
                </span>

                <h2>
                  AI-assisted routing
                </h2>

                <p className="dashboard-workflow-description">
                  The agent handles initial
                  classification, priority and
                  department routing. Your
                  department then manages and
                  resolves assigned complaints.
                </p>


                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() =>
                    navigate(
                      "/admin/complaints"
                    )
                  }
                >
                  Open Complaint Queue
                </button>

              </section>

            </aside>

          </section>

        </div>

      </main>

    </div>
  )
}


export default AdminDashboard


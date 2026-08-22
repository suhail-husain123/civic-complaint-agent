import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"
import ComplaintCard from "../../components/ComplaintCard"

import {
  getCurrentUser
} from "../../services/authService"

import {
  getMyComplaints
} from "../../services/complaintService"

import {
  getCitizenDashboard
} from "../../services/adminService"


function CitizenDashboard() {
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
          getCitizenDashboard(),
          getMyComplaints()
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
          "Failed to load dashboard."
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
        <Sidebar role="CITIZEN" />

        <main className="dashboard-main">
          <Loader text="Loading dashboard..." />
        </main>
      </div>
    )
  }


  const totalComplaints =
    dashboard?.total_complaints ??
    complaints.length


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


  const resolvedComplaints =
    dashboard?.resolved_complaints ??
    complaints.filter(
      (complaint) =>
        [
          "RESOLVED",
          "CLOSED"
        ].includes(
          complaint.status
        )
    ).length


  const escalatedComplaints =
    dashboard?.escalated_complaints ??
    complaints.filter(
      (complaint) =>
        complaint.is_escalated === true
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

      <Sidebar role="CITIZEN" />


      <main className="dashboard-main">

        <div className="page-content citizen-dashboard-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                Welcome Back
              </p>

              <h1 className="page-title">
                {user?.name || "Citizen"}
              </h1>

              <p className="page-subtitle">
                Track your civic complaints and
                monitor their resolution progress.
              </p>

            </div>


            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/citizen/create-complaint"
                )
              }
            >
              + Report Complaint
            </button>

          </header>


          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* STATS */}

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

              <div className="metric-icon metric-green">
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


          {/* AI CTA */}

          <section className="dashboard-ai-banner">

            <div className="dashboard-ai-content">

              <span className="dashboard-ai-label">
                AI POWERED
              </span>

              <h2>
                Found a civic problem?
              </h2>

              <p>
                Describe the issue and CivicResolve
                will classify it, assign priority,
                select the correct department and
                begin tracking automatically.
              </p>

            </div>


            <button
              type="button"
              className="btn btn-primary dashboard-ai-action"
              onClick={() =>
                navigate(
                  "/citizen/create-complaint"
                )
              }
            >
              Report New Complaint
            </button>

          </section>


          {/* MAIN DASHBOARD */}

          <section className="dashboard-content-grid">


            {/* LEFT SIDE */}

            <div className="dashboard-primary-column">

              <section className="dashboard-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      Recent Complaints
                    </h2>

                    <p>
                      Latest civic issues you have
                      submitted.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      navigate(
                        "/citizen/complaints"
                      )
                    }
                  >
                    View all
                  </button>

                </div>


                {recentComplaints.length === 0 ? (

                  <div className="empty-state">

                    <h3>
                      No complaints yet
                    </h3>

                    <p>
                      Your submitted complaints
                      will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="dashboard-complaint-list">

                    {recentComplaints.map(
                      (complaint) => (

                        <ComplaintCard
                          key={complaint.id}
                          complaint={complaint}
                          basePath="/citizen/complaints"
                        />

                      )
                    )}

                  </div>

                )}

              </section>

            </div>


            {/* RIGHT SIDE */}

            <aside className="dashboard-secondary-column">


              {/* STATUS */}

              <section className="dashboard-panel dashboard-status-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Complaint Status
                    </h2>

                    <p>
                      Current activity overview.
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

                      <span className="dashboard-status-dot green">
                      </span>

                      <span>
                        Resolved
                      </span>

                    </div>

                    <strong>
                      {resolvedComplaints}
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


              {/* WORKFLOW */}

              <section className="dashboard-panel dashboard-workflow-panel">

                <span className="dashboard-ai-label">
                  CIVICRESOLVE
                </span>

                <h2>
                  How it works
                </h2>

                <p className="dashboard-workflow-description">
                  From complaint submission to
                  resolution, every stage is tracked.
                </p>


                <div className="dashboard-workflow">


                  <div className="dashboard-workflow-item">

                    <span className="workflow-step-number">
                      01
                    </span>

                    <div>

                      <strong>
                        Report the issue
                      </strong>

                      <p>
                        Describe the civic problem
                        and provide its location.
                      </p>

                    </div>

                  </div>


                  <span className="workflow-connector">
                  </span>


                  <div className="dashboard-workflow-item">

                    <span className="workflow-step-number">
                      02
                    </span>

                    <div>

                      <strong>
                        AI analyzes it
                      </strong>

                      <p>
                        Category, priority and
                        department are selected.
                      </p>

                    </div>

                  </div>


                  <span className="workflow-connector">
                  </span>


                  <div className="dashboard-workflow-item">

                    <span className="workflow-step-number">
                      03
                    </span>

                    <div>

                      <strong>
                        Department acts
                      </strong>

                      <p>
                        The complaint is handled by
                        the responsible department.
                      </p>

                    </div>

                  </div>


                  <span className="workflow-connector">
                  </span>


                  <div className="dashboard-workflow-item">

                    <span className="workflow-step-number">
                      04
                    </span>

                    <div>

                      <strong>
                        Track progress
                      </strong>

                      <p>
                        Follow every update until
                        resolution.
                      </p>

                    </div>

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


export default CitizenDashboard
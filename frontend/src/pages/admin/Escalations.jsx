import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"
import ComplaintCard from "../../components/ComplaintCard"

import {
  getAdminEscalations
} from "../../services/adminService"


function Escalations() {
  const navigate = useNavigate()

  const [escalations, setEscalations] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadEscalations() {
      try {
        setLoading(true)
        setError("")

        const data =
          await getAdminEscalations()

        setEscalations(
          Array.isArray(data)
            ? data
            : data?.escalations || []
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load escalations."
        )
      } finally {
        setLoading(false)
      }
    }

    loadEscalations()
  }, [])


  function formatDate(value) {
    if (!value) {
      return "Not available"
    }

    return new Date(
      value
    ).toLocaleString()
  }


  function getEscalationAge(item) {
    const dateValue =
      item.escalated_at ||
      item.created_at

    if (!dateValue) {
      return "Unknown"
    }

    const created =
      new Date(dateValue)

    const now =
      new Date()

    const difference =
      now - created

    const hours =
      Math.floor(
        difference /
        (1000 * 60 * 60)
      )

    if (hours < 1) {
      return "Less than 1 hour"
    }

    if (hours < 24) {
      return `${hours} hours`
    }

    const days =
      Math.floor(
        hours / 24
      )

    return `${days} day${
      days === 1 ? "" : "s"
    }`
  }


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="DEPARTMENT_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading escalations..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="DEPARTMENT_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content admin-escalations-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                SLA Monitoring
              </p>

              <h1 className="page-title">
                Escalations
              </h1>

              <p className="page-subtitle">
                Review complaints that have
                exceeded expected resolution
                timelines or require urgent
                department attention.
              </p>

            </div>


            <div className="escalation-summary-badge">

              <span>
                Active Escalations
              </span>

              <strong>
                {escalations.length}
              </strong>

            </div>

          </header>


          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* ALERT BANNER */}

          <section className="dashboard-ai-banner escalation-alert-banner">

            <div className="dashboard-ai-content">

              <span className="dashboard-ai-label">
                SLA ALERT
              </span>

              <h2>
                These complaints need priority attention
              </h2>

              <p>
                CivicResolve monitors SLA deadlines
                automatically. When a complaint
                remains unresolved past its allowed
                response window, the case is
                escalated for department action.
              </p>

            </div>


            <div className="escalation-banner-icon">
              !
            </div>

          </section>


          {/* ESCALATION LIST */}

          <section className="dashboard-panel escalations-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Escalated Complaints
                </h2>

                <p>
                  Complaints currently requiring
                  immediate department attention.
                </p>

              </div>

            </div>


            {escalations.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No active escalations
                </h3>

                <p>
                  All complaints are currently
                  within their expected SLA
                  timelines.
                </p>

              </div>

            ) : (

              <div className="escalation-list">

                {escalations.map(
                  (item) => {

                    const complaint =
                      item.complaint ||
                      item

                    return (
                      <article
                        key={
                          item.id ||
                          complaint.id
                        }
                        className="escalation-item"
                      >

                        <div className="escalation-item-header">

                          <div>

                            <span className="escalation-label">
                              ESCALATED
                            </span>

                            <h3>
                              Complaint #{complaint.id}
                            </h3>

                          </div>


                          <div className="escalation-age">

                            <span>
                              Escalated for
                            </span>

                            <strong>
                              {getEscalationAge(
                                item
                              )}
                            </strong>

                          </div>

                        </div>


                        <div className="escalation-complaint-card">

                          <ComplaintCard
                            complaint={complaint}
                            basePath="/admin/complaints"
                          />

                        </div>


                        <div className="escalation-details-grid">


                          <div className="escalation-detail-field">

                            <span>
                              SLA Deadline
                            </span>

                            <strong>
                              {formatDate(
                                complaint.sla_deadline ||
                                item.sla_deadline
                              )}
                            </strong>

                          </div>


                          <div className="escalation-detail-field">

                            <span>
                              Escalated At
                            </span>

                            <strong>
                              {formatDate(
                                item.escalated_at ||
                                item.created_at
                              )}
                            </strong>

                          </div>


                          <div className="escalation-detail-field">

                            <span>
                              Reason
                            </span>

                            <strong>
                              {item.reason ||
                              item.escalation_reason ||
                              "SLA deadline exceeded"}
                            </strong>

                          </div>

                        </div>


                        <div className="escalation-item-footer">

                          <p>
                            Review the complaint,
                            update its progress and
                            take the required
                            resolution action.
                          </p>


                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              navigate(
                                `/admin/complaints/${complaint.id}`
                              )
                            }
                          >
                            Open Complaint
                          </button>

                        </div>

                      </article>
                    )
                  }
                )}

              </div>

            )}

          </section>


          {/* INFORMATION */}

          <section className="dashboard-panel escalation-info-panel">

            <div className="escalation-info-icon">
              SLA
            </div>

            <div>

              <h3>
                How automatic escalation works
              </h3>

              <p>
                CivicResolve tracks each complaint
                against its configured SLA. If the
                complaint remains unresolved after
                the deadline, an escalation record
                is created so the department can
                identify delayed cases quickly.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}


export default Escalations
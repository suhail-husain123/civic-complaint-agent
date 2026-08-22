import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"
import StatusBadge from "../../components/StatusBadge"
import PriorityBadge from "../../components/PriorityBadge"

import {
  getComplaintById,
  getComplaintHistory
} from "../../services/complaintService"


function ComplaintDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadComplaint() {
      try {
        setLoading(true)
        setError("")

        const results =
          await Promise.allSettled([
            getComplaintById(id),
            getComplaintHistory(id)
          ])

        if (
          results[0].status !== "fulfilled"
        ) {
          throw results[0].reason
        }

        setComplaint(
          results[0].value
        )

        const historyData =
          results[1].status === "fulfilled"
            ? results[1].value
            : []

        setHistory(
          Array.isArray(historyData)
            ? historyData
            : historyData?.history || []
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load complaint."
        )
      } finally {
        setLoading(false)
      }
    }

    loadComplaint()
  }, [id])


  function formatDate(value) {
    if (!value) {
      return "Not available"
    }

    return new Date(
      value
    ).toLocaleString()
  }


  function formatValue(value) {
    if (!value) {
      return "Not available"
    }

    return value
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  }


  function formatConfidence(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "Not available"
    }

    return `${Math.round(
      value * 100
    )}%`
  }


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="CITIZEN" />

        <main className="dashboard-main">
          <Loader text="Loading complaint..." />
        </main>

      </div>
    )
  }


  if (!complaint) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="CITIZEN" />

        <main className="dashboard-main">

          <div className="page-content">

            <section className="dashboard-panel">

              <h2>
                Complaint unavailable
              </h2>

              <p>
                {error ||
                "This complaint could not be found."}
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate(
                    "/citizen/complaints"
                  )
                }
              >
                Back to Complaints
              </button>

            </section>

          </div>

        </main>

      </div>
    )
  }


  const manualReviewRequired =
    complaint.status ===
      "MANUAL_REVIEW_REQUIRED" ||
    complaint.requires_human_review === true


  const workflowSteps = [
    "SUBMITTED",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED"
  ]


  const currentIndex =
    workflowSteps.indexOf(
      complaint.status
    )


  return (
    <div className="dashboard-layout">

      <Sidebar role="CITIZEN" />


      <main className="dashboard-main">

        <div className="page-content citizen-complaint-details-page">


          {/* PAGE HEADER */}

          <header className="app-page-header complaint-page-header">

            <div>

              <button
                type="button"
                className="complaint-back-button"
                onClick={() =>
                  navigate(
                    "/citizen/complaints"
                  )
                }
              >
                ← Back to complaints
              </button>

              <p className="complaint-detail-id">
                Complaint #{complaint.id}
              </p>

              <h1 className="page-title">
                {formatValue(
                  complaint.category
                )}
              </h1>

              <p className="page-subtitle">
                Submitted on{" "}
                {formatDate(
                  complaint.created_at
                )}
              </p>

            </div>


            <div className="complaint-detail-badges">

              <PriorityBadge
                priority={
                  complaint.priority
                }
              />

              <StatusBadge
                status={
                  complaint.status
                }
              />

            </div>

          </header>


          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* ALERTS */}

          {manualReviewRequired && (
            <section className="complaint-alert complaint-alert-purple">

              <div className="complaint-alert-icon">
                !
              </div>

              <div>

                <strong>
                  Human Review Required
                </strong>

                <p>
                  The AI confidence was below the
                  automatic routing threshold.
                  A department administrator will
                  verify the complaint before the
                  workflow continues.
                </p>

              </div>

            </section>
          )}


          {complaint.is_escalated && (
            <section className="complaint-alert complaint-alert-red">

              <div className="complaint-alert-icon">
                !
              </div>

              <div>

                <strong>
                  Complaint Escalated
                </strong>

                <p>
                  This complaint exceeded its
                  expected SLA deadline and has
                  been escalated.
                </p>

              </div>

            </section>
          )}


          {/* PROGRESS */}

          <section className="dashboard-panel complaint-progress-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Complaint Progress
                </h2>

                <p>
                  Follow your complaint through
                  each stage of resolution.
                </p>

              </div>

            </div>


            {manualReviewRequired ? (

              <div className="manual-review-progress">

                <div className="manual-review-progress-icon">
                  !
                </div>

                <div>

                  <strong>
                    Waiting for manual review
                  </strong>

                  <p>
                    A department administrator
                    needs to verify the AI decision
                    before the complaint proceeds.
                  </p>

                </div>

              </div>

            ) : (

              <div className="complaint-progress-track">

                {workflowSteps.map(
                  (step, index) => {

                    const completed =
                      currentIndex >= index

                    const active =
                      currentIndex === index

                    return (
                      <div
                        key={step}
                        className="complaint-progress-step"
                      >

                        <div
                          className={
                            active
                              ? "complaint-progress-circle active"
                              : completed
                                ? "complaint-progress-circle completed"
                                : "complaint-progress-circle"
                          }
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <span>
                          {formatValue(step)}
                        </span>

                        {index <
                          workflowSteps.length -
                            1 && (
                          <div
                            className={
                              currentIndex > index
                                ? "complaint-progress-connector completed"
                                : "complaint-progress-connector"
                            }
                          />
                        )}

                      </div>
                    )
                  }
                )}

              </div>

            )}

          </section>


          {/* MAIN CONTENT */}

          <section className="complaint-details-layout">


            {/* LEFT */}

            <div className="complaint-details-primary">


              {/* DESCRIPTION */}

              <section className="dashboard-panel complaint-description-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Complaint Description
                    </h2>

                  </div>

                </div>

                <p className="complaint-description-text">
                  {complaint.description}
                </p>


                {complaint.image_url && (

                  <div className="complaint-evidence-block">

                    <span className="complaint-field-label">
                      Submitted Evidence
                    </span>

                    <img
                      src={
                        complaint.image_url
                      }
                      alt="Complaint evidence"
                      className="complaint-detail-image"
                    />

                  </div>

                )}

              </section>


              {/* LOCATION */}

              <section className="dashboard-panel complaint-location-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Issue Location
                    </h2>

                    <p>
                      Location information submitted
                      with this complaint.
                    </p>

                  </div>

                </div>


                <div className="complaint-location-content">

                  <div className="complaint-location-icon">
                    📍
                  </div>

                  <div>

                    <strong>
                      {complaint.address ||
                      "Address unavailable"}
                    </strong>

                    {complaint.latitude &&
                      complaint.longitude && (

                        <p>
                          {complaint.latitude},{" "}
                          {complaint.longitude}
                        </p>

                      )}

                  </div>

                </div>

              </section>


              {/* HISTORY */}

              <section className="dashboard-panel complaint-history-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      Complaint History
                    </h2>

                    <p>
                      Every important update to
                      your complaint.
                    </p>

                  </div>

                </div>


                {history.length === 0 ? (

                  <div className="empty-state">

                    <p>
                      No complaint history
                      available yet.
                    </p>

                  </div>

                ) : (

                  <div className="complaint-history-list">

                    {history.map(
                      (item, index) => (

                        <div
                          className="complaint-history-item"
                          key={
                            item.id ||
                            index
                          }
                        >

                          <div className="complaint-history-marker">

                            <span>
                            </span>

                            {index <
                              history.length -
                                1 && (
                              <div>
                              </div>
                            )}

                          </div>


                          <div className="complaint-history-content">

                            <div className="complaint-history-heading">

                              <strong>
                                {formatValue(
                                  item.action
                                )}
                              </strong>

                              <span>
                                {formatDate(
                                  item.created_at
                                )}
                              </span>

                            </div>


                            {item.old_status &&
                              item.new_status && (

                                <p>
                                  {formatValue(
                                    item.old_status
                                  )}{" "}
                                  →{" "}
                                  {formatValue(
                                    item.new_status
                                  )}
                                </p>

                              )}


                            {item.extra_info && (

                              <p>
                                {
                                  item.extra_info
                                }
                              </p>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>


              {/* RESOLUTION */}

              {[
                "RESOLVED",
                "CLOSED"
              ].includes(
                complaint.status
              ) && (

                <section className="dashboard-panel complaint-resolution-panel">

                  <div className="complaint-resolution-header">

                    <div className="complaint-resolution-icon">
                      ✓
                    </div>

                    <div>

                      <h2>
                        Resolution
                      </h2>

                      <p>
                        Resolution information
                        submitted by the department.
                      </p>

                    </div>

                  </div>


                  <div className="complaint-resolution-note">

                    <span className="complaint-field-label">
                      Resolution Note
                    </span>

                    <p>
                      {complaint.resolution_note ||
                      "No resolution note available."}
                    </p>

                  </div>


                  {complaint.resolution_image_url && (

                    <img
                      src={
                        complaint.resolution_image_url
                      }
                      alt="Resolution proof"
                      className="complaint-detail-image"
                    />

                  )}

                </section>

              )}

            </div>


            {/* RIGHT */}

            <aside className="complaint-details-secondary">


              {/* INFORMATION */}

              <section className="dashboard-panel complaint-info-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Complaint Information
                    </h2>

                  </div>

                </div>


                <div className="complaint-info-list">


                  <div>

                    <span>
                      Category
                    </span>

                    <strong>
                      {formatValue(
                        complaint.category
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Priority
                    </span>

                    <PriorityBadge
                      priority={
                        complaint.priority
                      }
                    />

                  </div>


                  <div>

                    <span>
                      Status
                    </span>

                    <StatusBadge
                      status={
                        complaint.status
                      }
                    />

                  </div>


                  <div>

                    <span>
                      Department
                    </span>

                    <strong>
                      {complaint.department_name ||
                      complaint.department?.name ||
                      "Not assigned"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      AI Confidence
                    </span>

                    <strong>
                      {formatConfidence(
                        complaint.ai_confidence
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      SLA Deadline
                    </span>

                    <strong>
                      {formatDate(
                        complaint.sla_deadline
                      )}
                    </strong>

                  </div>

                </div>

              </section>


              {/* AI CARD */}

              <section className="dashboard-panel complaint-agent-panel">

                <span className="dashboard-ai-label">
                  CIVICRESOLVE AGENT
                </span>

                <h2>
                  AI assisted workflow
                </h2>

                <p>
                  CivicResolve analyzes your
                  complaint, determines routing
                  and priority, monitors the SLA
                  and flags uncertain cases for
                  human review.
                </p>

              </section>

            </aside>

          </section>

        </div>

      </main>

    </div>
  )
}


export default ComplaintDetails
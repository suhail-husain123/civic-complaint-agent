import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"
import StatusBadge from "../../components/StatusBadge"
import PriorityBadge from "../../components/PriorityBadge"

import {
  getComplaintById,
  getComplaintHistory,
  getComplaintAIDecisions,
  reviewComplaint
} from "../../services/complaintService"

import {
  getDepartments
} from "../../services/adminService"


function ComplaintDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [aiDecisions, setAIDecisions] = useState([])
  const [departments, setDepartments] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [reviewForm, setReviewForm] = useState({
    category: "",
    priority: "",
    department_id: "",
    review_note: ""
  })


  useEffect(() => {
    loadComplaint()
  }, [id])


  async function loadComplaint() {
    try {
      setLoading(true)
      setError("")

      const results =
        await Promise.allSettled([
          getComplaintById(id),
          getComplaintHistory(id),
          getComplaintAIDecisions(id),
          getDepartments()
        ])


      if (
        results[0].status !== "fulfilled"
      ) {
        throw results[0].reason
      }


      const complaintData =
        results[0].value


      setComplaint(
        complaintData
      )


      setHistory(
        results[1].status === "fulfilled"
          ? (
              Array.isArray(
                results[1].value
              )
                ? results[1].value
                : results[1].value?.history || []
            )
          : []
      )


      setAIDecisions(
        results[2].status === "fulfilled"
          ? (
              Array.isArray(
                results[2].value
              )
                ? results[2].value
                : results[2].value?.decisions || []
            )
          : []
      )


      setDepartments(
        results[3].status === "fulfilled"
          ? (
              Array.isArray(
                results[3].value
              )
                ? results[3].value
                : results[3].value?.departments || []
            )
          : []
      )


      setReviewForm({
        category:
          complaintData.category || "",

        priority:
          complaintData.priority || "MEDIUM",

        department_id:
          complaintData.department_id || "",

        review_note: ""
      })

    } catch (err) {
      setError(
        err.message ||
        "Failed to load complaint."
      )
    } finally {
      setLoading(false)
    }
  }


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

    return String(value)
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
      Number(value) * 100
    )}%`
  }


  function getConfidenceClass(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "neutral"
    }

    const confidence =
      Number(value)

    if (confidence < 0.5) {
      return "danger"
    }

    if (confidence < 0.7) {
      return "warning"
    }

    return "success"
  }


  function handleReviewChange(event) {
    const {
      name,
      value
    } = event.target

    setReviewForm(
      (current) => ({
        ...current,
        [name]: value
      })
    )
  }


  async function handleReviewSubmit(event) {
    event.preventDefault()

    setError("")
    setSuccess("")


    if (!reviewForm.category) {
      setError(
        "Category is required."
      )
      return
    }


    if (!reviewForm.priority) {
      setError(
        "Priority is required."
      )
      return
    }


    if (!reviewForm.department_id) {
      setError(
        "Department is required."
      )
      return
    }


    try {
      setSaving(true)


      await reviewComplaint(
        id,
        {
          category:
            reviewForm.category,

          priority:
            reviewForm.priority,

          department_id:
            Number(
              reviewForm.department_id
            ),

          review_note:
            reviewForm.review_note.trim() ||
            null
        }
      )


      setSuccess(
        "Manual review completed and complaint assigned successfully."
      )


      await loadComplaint()

    } catch (err) {
      setError(
        err.message ||
        "Failed to complete manual review."
      )
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="SUPER_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading complaint..." />
        </main>

      </div>
    )
  }


  if (!complaint) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="SUPER_ADMIN" />

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
                    "/super-admin/complaints"
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


  const latestDecision =
    aiDecisions.length > 0
      ? aiDecisions[0]
      : null


  const requiresReview =
    complaint.status ===
      "MANUAL_REVIEW_REQUIRED" ||
    complaint.requires_human_review === true


  return (
    <div className="dashboard-layout">

      <Sidebar role="SUPER_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content superadmin-complaint-details-page">


          {/* PAGE HEADER */}

          <header className="app-page-header complaint-page-header">

            <div>

              <button
                type="button"
                className="complaint-back-button"
                onClick={() =>
                  navigate(
                    "/super-admin/complaints"
                  )
                }
              >
                ← Back to all complaints
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
                System-level complaint overview
                and audit information.
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


          {success && (
            <div className="dashboard-success">
              {success}
            </div>
          )}


          {/* FLAGS */}

          {requiresReview && (
            <section className="complaint-alert complaint-alert-purple">

              <div className="complaint-alert-icon">
                AI
              </div>

              <div>

                <strong>
                  Human Review Required
                </strong>

                <p>
                  This complaint was flagged because
                  CivicResolve did not have enough
                  confidence for safe automatic
                  routing.
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
                  SLA Escalation
                </strong>

                <p>
                  This complaint exceeded its
                  configured SLA deadline and has
                  been escalated.
                </p>

              </div>

            </section>
          )}


          {/* MAIN LAYOUT */}

          <section className="superadmin-complaint-layout">


            {/* LEFT */}

            <div className="superadmin-complaint-primary">


              {/* DESCRIPTION */}

              <section className="dashboard-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Complaint Description
                    </h2>

                    <p>
                      Original issue reported by
                      the citizen.
                    </p>

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

              <section className="dashboard-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Location
                    </h2>

                    <p>
                      Geographic information
                      attached to the complaint.
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


              {/* AI DECISION */}

              <section className="dashboard-panel superadmin-ai-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      AI Decision
                    </h2>

                    <p>
                      Classification and routing
                      information generated by
                      CivicResolve.
                    </p>

                  </div>


                  <div
                    className={`ai-confidence-badge ${getConfidenceClass(
                      complaint.ai_confidence ||
                      latestDecision?.confidence
                    )}`}
                  >

                    <span>
                      Confidence
                    </span>

                    <strong>
                      {formatConfidence(
                        complaint.ai_confidence ||
                        latestDecision?.confidence
                      )}
                    </strong>

                  </div>

                </div>


                <div className="admin-ai-decision-grid">


                  <div className="admin-ai-decision-field">

                    <span>
                      Category
                    </span>

                    <strong>
                      {formatValue(
                        latestDecision?.category ||
                        complaint.category
                      )}
                    </strong>

                  </div>


                  <div className="admin-ai-decision-field">

                    <span>
                      Priority
                    </span>

                    <strong>
                      {formatValue(
                        latestDecision?.priority ||
                        complaint.priority
                      )}
                    </strong>

                  </div>


                  <div className="admin-ai-decision-field">

                    <span>
                      Department
                    </span>

                    <strong>
                      {
                        latestDecision?.department_name ||
                        complaint.department_name ||
                        complaint.department?.name ||
                        "Not assigned"
                      }
                    </strong>

                  </div>

                </div>


                {latestDecision?.reasoning && (

                  <div className="admin-ai-reasoning">

                    <span className="complaint-field-label">
                      AI Reasoning
                    </span>

                    <p>
                      {
                        latestDecision.reasoning
                      }
                    </p>

                  </div>

                )}

              </section>


              {/* MANUAL REVIEW */}

              {requiresReview && (

                <section className="dashboard-panel superadmin-review-panel">

                  <div className="dashboard-panel-header">

                    <div>

                      <p className="dashboard-welcome">
                        Human-in-the-loop
                      </p>

                      <h2>
                        Review AI Decision
                      </h2>

                      <p>
                        Correct the AI decision and
                        assign this complaint to the
                        appropriate department.
                      </p>

                    </div>

                  </div>


                  <form
                    className="admin-review-form"
                    onSubmit={
                      handleReviewSubmit
                    }
                  >

                    <div className="admin-review-form-grid">


                      {/* CATEGORY */}

                      <div className="form-group">

                        <label
                          className="form-label"
                          htmlFor="review-category"
                        >
                          Category
                        </label>

                        <select
                          id="review-category"
                          name="category"
                          className="form-select"
                          value={
                            reviewForm.category
                          }
                          onChange={
                            handleReviewChange
                          }
                          required
                        >

                          <option value="">
                            Select category
                          </option>

                          <option value="WATER">
                            Water
                          </option>

                          <option value="ROADS">
                            Roads
                          </option>

                          <option value="SANITATION">
                            Sanitation
                          </option>

                          <option value="ELECTRICITY">
                            Electricity
                          </option>

                          <option value="STREET_LIGHTING">
                            Street Lighting
                          </option>

                          <option value="OTHER">
                            Other
                          </option>

                        </select>

                      </div>


                      {/* PRIORITY */}

                      <div className="form-group">

                        <label
                          className="form-label"
                          htmlFor="review-priority"
                        >
                          Priority
                        </label>

                        <select
                          id="review-priority"
                          name="priority"
                          className="form-select"
                          value={
                            reviewForm.priority
                          }
                          onChange={
                            handleReviewChange
                          }
                          required
                        >

                          <option value="LOW">
                            Low
                          </option>

                          <option value="MEDIUM">
                            Medium
                          </option>

                          <option value="HIGH">
                            High
                          </option>

                          <option value="CRITICAL">
                            Critical
                          </option>

                        </select>

                      </div>


                      {/* DEPARTMENT */}

                      <div className="form-group">

                        <label
                          className="form-label"
                          htmlFor="review-department"
                        >
                          Department
                        </label>

                        <select
                          id="review-department"
                          name="department_id"
                          className="form-select"
                          value={
                            reviewForm.department_id
                          }
                          onChange={
                            handleReviewChange
                          }
                          required
                        >

                          <option value="">
                            Select department
                          </option>

                          {departments.map(
                            (department) => (

                              <option
                                key={
                                  department.id
                                }
                                value={
                                  department.id
                                }
                              >
                                {
                                  department.name
                                }
                              </option>

                            )
                          )}

                        </select>

                      </div>

                    </div>


                    {/* REVIEW NOTE */}

                    <div className="form-group">

                      <label
                        className="form-label"
                        htmlFor="review-note"
                      >
                        Review Note
                      </label>

                      <textarea
                        id="review-note"
                        name="review_note"
                        className="form-textarea"
                        placeholder="Explain the manual classification or routing decision..."
                        value={
                          reviewForm.review_note
                        }
                        onChange={
                          handleReviewChange
                        }
                      />

                    </div>


                    <div className="admin-form-actions">

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >

                        {saving
                          ? "Confirming Review..."
                          : "Confirm & Assign"}

                      </button>

                    </div>

                  </form>

                </section>

              )}


              {/* HISTORY */}

              <section className="dashboard-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      Audit History
                    </h2>

                    <p>
                      Complete record of complaint
                      workflow activity.
                    </p>

                  </div>

                </div>


                {history.length === 0 ? (

                  <div className="empty-state">

                    <p>
                      No history available.
                    </p>

                  </div>

                ) : (

                  <div className="complaint-history-list">

                    {history.map(
                      (item, index) => (

                        <div
                          key={
                            item.id ||
                            index
                          }
                          className="complaint-history-item"
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
                        Final resolution submitted
                        by the responsible
                        department.
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

                    <div className="complaint-evidence-block">

                      <span className="complaint-field-label">
                        Resolution Evidence
                      </span>

                      <img
                        src={
                          complaint.resolution_image_url
                        }
                        alt="Resolution proof"
                        className="complaint-detail-image"
                      />

                    </div>

                  )}

                </section>

              )}

            </div>


            {/* RIGHT */}

            <aside className="superadmin-complaint-secondary">


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
                      Complaint ID
                    </span>

                    <strong>
                      #{complaint.id}
                    </strong>

                  </div>


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
                      Department ID
                    </span>

                    <strong>
                      {complaint.department_id ||
                      complaint.department?.id ||
                      "Not assigned"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Citizen ID
                    </span>

                    <strong>
                      {complaint.user_id ||
                      complaint.citizen_id ||
                      "Not available"}
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
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        complaint.created_at
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


              {/* SYSTEM FLAGS */}

              <section className="dashboard-panel superadmin-flags-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      System Flags
                    </h2>

                    <p>
                      Automated workflow indicators.
                    </p>

                  </div>

                </div>


                <div className="superadmin-flags-list">


                  <div>

                    <span>
                      Manual Review
                    </span>

                    <strong
                      className={
                        requiresReview
                          ? "flag-value active"
                          : "flag-value"
                      }
                    >
                      {requiresReview
                        ? "Required"
                        : "No"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      SLA Escalated
                    </span>

                    <strong
                      className={
                        complaint.is_escalated
                          ? "flag-value danger"
                          : "flag-value"
                      }
                    >
                      {complaint.is_escalated
                        ? "Yes"
                        : "No"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Resolution
                    </span>

                    <strong
                      className={
                        [
                          "RESOLVED",
                          "CLOSED"
                        ].includes(
                          complaint.status
                        )
                          ? "flag-value success"
                          : "flag-value"
                      }
                    >
                      {[
                        "RESOLVED",
                        "CLOSED"
                      ].includes(
                        complaint.status
                      )
                        ? "Completed"
                        : "Pending"}
                    </strong>

                  </div>

                </div>

              </section>


              {/* OVERSIGHT CARD */}

              <section className="dashboard-panel complaint-agent-panel">

                <span className="dashboard-ai-label">
                  SUPER ADMIN VIEW
                </span>

                <h2>
                  Platform oversight
                </h2>

                <p>
                  This view provides system-wide
                  visibility into AI routing,
                  department assignment, SLA
                  monitoring and complaint history.
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
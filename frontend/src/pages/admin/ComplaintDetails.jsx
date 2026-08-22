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
  reviewComplaint,
  updateComplaintStatus,
  uploadImage
} from "../../services/complaintService"


function ComplaintDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [aiDecisions, setAIDecisions] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [resolutionImage, setResolutionImage] =
    useState(null)

  const [resolutionPreview, setResolutionPreview] =
    useState("")

  const [reviewForm, setReviewForm] = useState({
    category: "",
    priority: "",
    department_id: "",
    review_note: ""
  })

  const [statusForm, setStatusForm] = useState({
    status: "",
    resolution_note: ""
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
          getComplaintAIDecisions(id)
        ])


      if (
        results[0].status !== "fulfilled"
      ) {
        throw results[0].reason
      }


      const complaintData =
        results[0].value

      setComplaint(complaintData)


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


      setReviewForm({
        category:
          complaintData.category || "",

        priority:
          complaintData.priority || "",

        department_id:
          complaintData.department_id || "",

        review_note: ""
      })


      setStatusForm({
        status:
          complaintData.status || "",

        resolution_note:
          complaintData.resolution_note || ""
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

    const number =
      Number(value)

    if (number < 0.5) {
      return "danger"
    }

    if (number < 0.7) {
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


  function handleStatusChange(event) {
    const {
      name,
      value
    } = event.target

    setStatusForm(
      (current) => ({
        ...current,
        [name]: value
      })
    )

    if (
      name === "status" &&
      value !== "RESOLVED"
    ) {
      setResolutionImage(null)
      setResolutionPreview("")
    }
  }


  function handleResolutionImageChange(event) {
    const file =
      event.target.files?.[0]

    if (!file) {
      setResolutionImage(null)
      setResolutionPreview("")
      return
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ]


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setResolutionImage(null)
      setResolutionPreview("")

      setError(
        "Only JPEG, PNG and WEBP images are allowed."
      )

      event.target.value = ""

      return
    }


    setError("")

    setResolutionImage(file)

    setResolutionPreview(
      URL.createObjectURL(file)
    )
  }


  async function handleReviewSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const payload = {
        category:
          reviewForm.category,

        priority:
          reviewForm.priority,

        review_note:
          reviewForm.review_note
      }


      if (
        reviewForm.department_id
      ) {
        payload.department_id =
          Number(
            reviewForm.department_id
          )
      }


      await reviewComplaint(
        id,
        payload
      )

      setSuccess(
        "AI decision reviewed successfully."
      )

      await loadComplaint()

    } catch (err) {
      setError(
        err.message ||
        "Failed to review complaint."
      )
    } finally {
      setSaving(false)
    }
  }


  async function handleStatusSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")


      const isResolving =
        statusForm.status === "RESOLVED"


      if (
        isResolving &&
        !statusForm.resolution_note.trim()
      ) {
        setError(
          "Resolution note is required."
        )

        return
      }


      if (
        isResolving &&
        !resolutionImage
      ) {
        setError(
          "Resolution image is required."
        )

        return
      }


      let resolutionImageUrl = null


      if (
        isResolving &&
        resolutionImage
      ) {
        const uploadResult =
          await uploadImage(
            resolutionImage
          )

        resolutionImageUrl =
          uploadResult.image_url
      }


      const payload = {
        status:
          statusForm.status
      }


      if (isResolving) {
        payload.resolution_note =
          statusForm.resolution_note.trim()

        payload.resolution_image_url =
          resolutionImageUrl
      }


      await updateComplaintStatus(
        id,
        payload
      )


      setSuccess(
        "Complaint status updated successfully."
      )


      setResolutionImage(null)
      setResolutionPreview("")


      await loadComplaint()

    } catch (err) {
      setError(
        err.message ||
        "Failed to update complaint status."
      )
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="DEPARTMENT_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading complaint..." />
        </main>

      </div>
    )
  }


  if (!complaint) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="DEPARTMENT_ADMIN" />

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
                    "/admin/complaints"
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


  const requiresReview =
    complaint.status ===
      "MANUAL_REVIEW_REQUIRED" ||
    complaint.requires_human_review === true


  const latestDecision =
    aiDecisions.length > 0
      ? aiDecisions[0]
      : null


  return (
    <div className="dashboard-layout">

      <Sidebar role="DEPARTMENT_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content admin-complaint-details-page">


          {/* PAGE HEADER */}

          <header className="app-page-header complaint-page-header">

            <div>

              <button
                type="button"
                className="complaint-back-button"
                onClick={() =>
                  navigate(
                    "/admin/complaints"
                  )
                }
              >
                ← Back to complaint queue
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
                Submitted{" "}
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


          {success && (
            <div className="dashboard-success">
              {success}
            </div>
          )}


          {/* IMPORTANT FLAGS */}

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
                  CivicResolve did not have enough
                  confidence to safely complete
                  automatic routing. Review the AI
                  recommendation below.
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
                  configured resolution deadline
                  and requires priority attention.
                </p>

              </div>

            </section>
          )}


          {/* MAIN LAYOUT */}

          <section className="admin-complaint-workspace">


            {/* LEFT COLUMN */}

            <div className="admin-complaint-primary">


              {/* DESCRIPTION */}

              <section className="dashboard-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Complaint Description
                    </h2>

                    <p>
                      Information submitted by the
                      citizen.
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
                      associated with the issue.
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

              <section className="dashboard-panel admin-ai-decision-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      AI Decision
                    </h2>

                    <p>
                      Review the latest decision
                      produced by CivicResolve.
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

                <section className="dashboard-panel admin-review-panel">

                  <div className="dashboard-panel-header">

                    <div>

                      <h2>
                        Review AI Decision
                      </h2>

                      <p>
                        Confirm or override the
                        classification before the
                        complaint proceeds.
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


                      <div className="form-group">

                        <label
                          className="form-label"
                          htmlFor="review-category"
                        >
                          Category
                        </label>

                        <input
                          id="review-category"
                          name="category"
                          type="text"
                          className="form-input"
                          value={
                            reviewForm.category
                          }
                          onChange={
                            handleReviewChange
                          }
                          required
                        />

                      </div>


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


                      <div className="form-group">

                        <label
                          className="form-label"
                          htmlFor="review-department"
                        >
                          Department ID
                        </label>

                        <input
                          id="review-department"
                          name="department_id"
                          type="number"
                          className="form-input"
                          value={
                            reviewForm.department_id
                          }
                          onChange={
                            handleReviewChange
                          }
                          min="1"
                        />

                      </div>

                    </div>


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
                        placeholder="Explain why you approved or changed the AI decision..."
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
                          ? "Saving..."
                          : "Confirm Review"}
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
                      Complaint History
                    </h2>

                    <p>
                      Audit trail of actions taken
                      on this complaint.
                    </p>

                  </div>

                </div>


                {history.length === 0 ? (

                  <div className="empty-state">

                    <p>
                      No history available yet.
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

            </div>


            {/* RIGHT COLUMN */}

            <aside className="admin-complaint-secondary">


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

                </div>

              </section>


              {/* STATUS UPDATE */}

              <section className="dashboard-panel admin-status-update-panel">

                <div className="dashboard-panel-header compact">

                  <div>

                    <h2>
                      Update Workflow
                    </h2>

                    <p>
                      Move the complaint through
                      the resolution process.
                    </p>

                  </div>

                </div>


                <form
                  onSubmit={
                    handleStatusSubmit
                  }
                >

                  <div className="form-group">

                    <label
                      className="form-label"
                      htmlFor="complaint-status"
                    >
                      Status
                    </label>

                    <select
                      id="complaint-status"
                      name="status"
                      className="form-select"
                      value={
                        statusForm.status
                      }
                      onChange={
                        handleStatusChange
                      }
                      required
                    >

                      <option value="SUBMITTED">
                        Submitted
                      </option>

                      <option value="MANUAL_REVIEW_REQUIRED">
                        Manual Review Required
                      </option>

                      <option value="ASSIGNED">
                        Assigned
                      </option>

                      <option value="IN_PROGRESS">
                        In Progress
                      </option>

                      <option value="RESOLVED">
                        Resolved
                      </option>

                      <option value="CLOSED">
                        Closed
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label
                      className="form-label"
                      htmlFor="resolution-note"
                    >
                      Resolution Note
                    </label>

                    <textarea
                      id="resolution-note"
                      name="resolution_note"
                      className="form-textarea"
                      placeholder={
                        statusForm.status === "RESOLVED"
                          ? "Describe how the issue was resolved..."
                          : "Add resolution details..."
                      }
                      value={
                        statusForm.resolution_note
                      }
                      onChange={
                        handleStatusChange
                      }
                      required={
                        statusForm.status === "RESOLVED"
                      }
                    />

                  </div>


                  {statusForm.status === "RESOLVED" && (

                    <div className="form-group">

                      <label
                        className="form-label"
                        htmlFor="resolution-image"
                      >
                        Resolution Evidence
                      </label>


                      <input
                        id="resolution-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="form-input"
                        onChange={
                          handleResolutionImageChange
                        }
                        required
                      />


                      <p className="form-help-text">
                        Upload a JPEG, PNG or WEBP
                        image showing that the issue
                        has been resolved.
                      </p>


                      {resolutionPreview && (

                        <div className="resolution-image-preview">

                          <img
                            src={
                              resolutionPreview
                            }
                            alt="Resolution preview"
                          />

                        </div>

                      )}

                    </div>

                  )}


                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={saving}
                  >
                    {saving
                      ? "Updating..."
                      : "Update Complaint"}
                  </button>

                </form>

              </section>


              {/* EXISTING RESOLUTION */}

              {complaint.resolution_note && (

                <section className="dashboard-panel">

                  <div className="dashboard-panel-header compact">

                    <div>

                      <h2>
                        Resolution
                      </h2>

                      <p>
                        Resolution submitted by the
                        department.
                      </p>

                    </div>

                  </div>


                  <div className="complaint-resolution-details">

                    <span className="complaint-field-label">
                      Resolution Note
                    </span>

                    <p>
                      {
                        complaint.resolution_note
                      }
                    </p>


                    {complaint.resolution_image_url && (

                      <div className="complaint-evidence-block">

                        <span className="complaint-field-label">
                          Resolution Evidence
                        </span>

                        <img
                          src={
                            complaint.resolution_image_url
                          }
                          alt="Resolution evidence"
                          className="complaint-detail-image"
                        />

                      </div>

                    )}

                  </div>

                </section>

              )}


              {/* AGENT NOTE */}

              <section className="dashboard-panel complaint-agent-panel">

                <span className="dashboard-ai-label">
                  CIVICRESOLVE AGENT
                </span>

                <h2>
                  Human oversight
                </h2>

                <p>
                  AI decisions assist the workflow,
                  but department administrators
                  remain responsible for validating
                  uncertain cases and confirming
                  resolution.
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
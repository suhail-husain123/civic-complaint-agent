import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"
import ComplaintCard from "../../components/ComplaintCard"

import {
  getAdminComplaints
} from "../../services/complaintService"


function ManualReview() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadManualReviewComplaints() {
      try {
        setLoading(true)
        setError("")

        const data =
          await getAdminComplaints()

        const allComplaints =
          Array.isArray(data)
            ? data
            : data?.complaints || []

        const reviewComplaints =
          allComplaints.filter(
            (complaint) =>
              complaint.status ===
                "MANUAL_REVIEW_REQUIRED" ||
              complaint.requires_human_review === true
          )

        setComplaints(
          reviewComplaints
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load manual review complaints."
        )
      } finally {
        setLoading(false)
      }
    }

    loadManualReviewComplaints()
  }, [])


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


  function getConfidenceClass(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "neutral"
    }

    if (value < 0.5) {
      return "danger"
    }

    if (value < 0.7) {
      return "warning"
    }

    return "success"
  }


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="DEPARTMENT_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading manual review queue..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="DEPARTMENT_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content admin-manual-review-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                Human-in-the-Loop
              </p>

              <h1 className="page-title">
                Manual Review
              </h1>

              <p className="page-subtitle">
                Review complaints where AI
                confidence was too low for safe
                automatic routing.
              </p>

            </div>

          </header>


          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* EXPLANATION BANNER */}

          <section className="dashboard-ai-banner manual-review-banner">

            <div className="dashboard-ai-content">

              <span className="dashboard-ai-label">
                HUMAN REVIEW
              </span>

              <h2>
                AI uncertainty requires your decision
              </h2>

              <p>
                CivicResolve flags complaints when
                its confidence is below the
                configured threshold. Review the
                suggested category, department and
                priority before approving or
                correcting the decision.
              </p>

            </div>


            <div className="manual-review-count">

              <span>
                Waiting
              </span>

              <strong>
                {complaints.length}
              </strong>

            </div>

          </section>


          {/* REVIEW QUEUE */}

          <section className="dashboard-panel manual-review-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Review Queue
                </h2>

                <p>
                  Complaints currently waiting
                  for human validation.
                </p>

              </div>

            </div>


            {complaints.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No complaints need review
                </h3>

                <p>
                  All current AI decisions are
                  above the confidence threshold.
                </p>

              </div>

            ) : (

              <div className="manual-review-list">

                {complaints.map(
                  (complaint) => (

                    <article
                      key={complaint.id}
                      className="manual-review-item"
                    >

                      <div className="manual-review-item-top">

                        <div>

                          <span className="manual-review-complaint-id">
                            Complaint #{complaint.id}
                          </span>

                          <h3>
                            {complaint.category
                              ? complaint.category
                                  .replaceAll("_", " ")
                              : "Uncategorized Complaint"}
                          </h3>

                        </div>


                        <div
                          className={`manual-review-confidence ${getConfidenceClass(
                            complaint.ai_confidence
                          )}`}
                        >

                          <span>
                            AI Confidence
                          </span>

                          <strong>
                            {formatConfidence(
                              complaint.ai_confidence
                            )}
                          </strong>

                        </div>

                      </div>


                      <p className="manual-review-description">
                        {complaint.description}
                      </p>


                      <div className="manual-review-ai-grid">


                        <div className="manual-review-ai-field">

                          <span>
                            Suggested Category
                          </span>

                          <strong>
                            {complaint.category
                              ?.replaceAll(
                                "_",
                                " "
                              ) ||
                            "Not available"}
                          </strong>

                        </div>


                        <div className="manual-review-ai-field">

                          <span>
                            Suggested Priority
                          </span>

                          <strong>
                            {complaint.priority ||
                            "Not available"}
                          </strong>

                        </div>


                        <div className="manual-review-ai-field">

                          <span>
                            Suggested Department
                          </span>

                          <strong>
                            {complaint.department_name ||
                            complaint.department?.name ||
                            "Not assigned"}
                          </strong>

                        </div>

                      </div>


                      <div className="manual-review-item-footer">

                        <div className="manual-review-location">

                          <span>
                            Location
                          </span>

                          <strong>
                            {complaint.address ||
                            "Address unavailable"}
                          </strong>

                        </div>


                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            navigate(
                              `/admin/complaints/${complaint.id}`
                            )
                          }
                        >
                          Review Decision
                        </button>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>


          {/* INFO CARD */}

          <section className="dashboard-panel manual-review-info-panel">

            <div className="manual-review-info-icon">
              AI
            </div>

            <div>

              <h3>
                Why manual review matters
              </h3>

              <p>
                Human review prevents uncertain
                AI predictions from sending a
                complaint to the wrong department
                or assigning an inappropriate
                priority. Your decision becomes
                part of the complaint audit trail.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}


export default ManualReview
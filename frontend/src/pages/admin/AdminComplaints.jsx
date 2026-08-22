import { useEffect, useMemo, useState } from "react"

import Sidebar from "../../components/Sidebar"
import ComplaintCard from "../../components/ComplaintCard"
import Loader from "../../components/Loader"

import {
  getAdminComplaints
} from "../../services/complaintService"


function AdminComplaints() {
  const [complaints, setComplaints] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [reviewFilter, setReviewFilter] = useState("ALL")


  useEffect(() => {
    async function loadComplaints() {
      try {
        setLoading(true)
        setError("")

        const data =
          await getAdminComplaints()

        setComplaints(
          Array.isArray(data)
            ? data
            : data?.complaints || []
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load department complaints."
        )
      } finally {
        setLoading(false)
      }
    }

    loadComplaints()
  }, [])


  const filteredComplaints =
    useMemo(() => {
      return complaints.filter(
        (complaint) => {
          const searchText =
            search
              .trim()
              .toLowerCase()

          const matchesSearch =
            !searchText ||
            String(
              complaint.id
            ).includes(searchText) ||
            complaint.description
              ?.toLowerCase()
              .includes(searchText) ||
            complaint.category
              ?.toLowerCase()
              .includes(searchText) ||
            complaint.address
              ?.toLowerCase()
              .includes(searchText)

          const matchesStatus =
            statusFilter === "ALL" ||
            complaint.status ===
              statusFilter

          const matchesPriority =
            priorityFilter === "ALL" ||
            complaint.priority ===
              priorityFilter

          const needsReview =
            complaint.status ===
              "MANUAL_REVIEW_REQUIRED" ||
            complaint.requires_human_review === true

          const matchesReview =
            reviewFilter === "ALL" ||
            (
              reviewFilter === "REVIEW" &&
              needsReview
            ) ||
            (
              reviewFilter === "AUTO" &&
              !needsReview
            )

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesReview
          )
        }
      )
    }, [
      complaints,
      search,
      statusFilter,
      priorityFilter,
      reviewFilter
    ])


  function clearFilters() {
    setSearch("")
    setStatusFilter("ALL")
    setPriorityFilter("ALL")
    setReviewFilter("ALL")
  }


  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    reviewFilter !== "ALL"


  const criticalCount =
    complaints.filter(
      (complaint) =>
        complaint.priority ===
        "CRITICAL"
    ).length


  const manualReviewCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
          "MANUAL_REVIEW_REQUIRED" ||
        complaint.requires_human_review === true
    ).length


  const escalatedCount =
    complaints.filter(
      (complaint) =>
        complaint.is_escalated === true
    ).length


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="DEPARTMENT_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading complaint queue..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="DEPARTMENT_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content admin-complaints-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                Department Queue
              </p>

              <h1 className="page-title">
                Complaints
              </h1>

              <p className="page-subtitle">
                Review and manage complaints
                assigned to your department.
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
                  {complaints.length}
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
                  {criticalCount}
                </strong>

              </div>

            </div>


            <div className="dashboard-metric-card">

              <div className="metric-icon metric-purple">
                AI
              </div>

              <div className="metric-content">

                <span>
                  Manual Review
                </span>

                <strong>
                  {manualReviewCount}
                </strong>

              </div>

            </div>


            <div className="dashboard-metric-card">

              <div className="metric-icon metric-red">
                ↑
              </div>

              <div className="metric-content">

                <span>
                  Escalated
                </span>

                <strong>
                  {escalatedCount}
                </strong>

              </div>

            </div>

          </section>


          {/* FILTER PANEL */}

          <section className="dashboard-panel complaint-filter-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Filter Complaint Queue
                </h2>

                <p>
                  Search and narrow complaints
                  by workflow state, priority
                  or AI review requirement.
                </p>

              </div>


              {hasFilters && (
                <button
                  type="button"
                  className="text-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}

            </div>


            <div className="admin-complaint-filter-grid">


              <div className="complaint-filter-search">

                <label
                  className="form-label"
                  htmlFor="admin-complaint-search"
                >
                  Search
                </label>

                <input
                  id="admin-complaint-search"
                  type="text"
                  className="form-input"
                  placeholder="Complaint ID, description, category or address..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>


              <div>

                <label
                  className="form-label"
                  htmlFor="admin-status-filter"
                >
                  Status
                </label>

                <select
                  id="admin-status-filter"
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="ALL">
                    All Statuses
                  </option>

                  <option value="SUBMITTED">
                    Submitted
                  </option>

                  <option value="MANUAL_REVIEW_REQUIRED">
                    Manual Review
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


              <div>

                <label
                  className="form-label"
                  htmlFor="admin-priority-filter"
                >
                  Priority
                </label>

                <select
                  id="admin-priority-filter"
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="ALL">
                    All Priorities
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="LOW">
                    Low
                  </option>
                </select>

              </div>


              <div>

                <label
                  className="form-label"
                  htmlFor="admin-review-filter"
                >
                  AI Review
                </label>

                <select
                  id="admin-review-filter"
                  className="form-select"
                  value={reviewFilter}
                  onChange={(e) =>
                    setReviewFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="ALL">
                    All
                  </option>

                  <option value="REVIEW">
                    Needs Review
                  </option>

                  <option value="AUTO">
                    Auto Routed
                  </option>
                </select>

              </div>

            </div>

          </section>


          {/* RESULTS */}

          <section className="dashboard-panel complaints-results-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Complaint Queue
                </h2>

                <p>
                  Showing{" "}
                  {filteredComplaints.length} of{" "}
                  {complaints.length}
                </p>

              </div>

            </div>


            {filteredComplaints.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No complaints found
                </h3>

                <p>
                  No complaints match the
                  selected filters.
                </p>

              </div>

            ) : (

              <div className="complaints-card-grid">

                {filteredComplaints.map(
                  (complaint) => (

                    <div
                      className="complaint-card-wrapper"
                      key={complaint.id}
                    >

                      <div className="complaint-card-labels">

                        {complaint.is_escalated && (
                          <span className="complaint-context-badge danger">
                            SLA Escalated
                          </span>
                        )}


                        {(
                          complaint.status ===
                            "MANUAL_REVIEW_REQUIRED" ||
                          complaint.requires_human_review
                        ) && (
                          <span className="complaint-context-badge purple">
                            Human Review
                          </span>
                        )}

                      </div>


                      <ComplaintCard
                        complaint={complaint}
                        basePath="/admin/complaints"
                      />

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  )
}


export default AdminComplaints
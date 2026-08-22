import { useEffect, useMemo, useState } from "react"

import Sidebar from "../../components/Sidebar"
import ComplaintCard from "../../components/ComplaintCard"
import Loader from "../../components/Loader"

import {
  getAdminComplaints
} from "../../services/complaintService"

import {
  getDepartments
} from "../../services/adminService"


function AllComplaints() {
  const [complaints, setComplaints] = useState([])
  const [departments, setDepartments] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [departmentFilter, setDepartmentFilter] = useState("ALL")
  const [reviewFilter, setReviewFilter] = useState("ALL")


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError("")

        const [
          complaintData,
          departmentData
        ] = await Promise.all([
          getAdminComplaints(),
          getDepartments()
        ])

        setComplaints(
          Array.isArray(complaintData)
            ? complaintData
            : complaintData?.complaints || []
        )

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : departmentData?.departments || []
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load complaints."
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
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
              .includes(searchText) ||
            complaint.department_name
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


          const matchesDepartment =
            departmentFilter === "ALL" ||
            String(
              complaint.department_id
            ) === departmentFilter ||
            String(
              complaint.department?.id
            ) === departmentFilter


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
              reviewFilter === "ESCALATED" &&
              complaint.is_escalated === true
            )


          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesDepartment &&
            matchesReview
          )
        }
      )
    }, [
      complaints,
      search,
      statusFilter,
      priorityFilter,
      departmentFilter,
      reviewFilter
    ])


  function clearFilters() {
    setSearch("")
    setStatusFilter("ALL")
    setPriorityFilter("ALL")
    setDepartmentFilter("ALL")
    setReviewFilter("ALL")
  }


  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    departmentFilter !== "ALL" ||
    reviewFilter !== "ALL"


  const activeCount =
    complaints.filter(
      (complaint) =>
        ![
          "RESOLVED",
          "CLOSED"
        ].includes(
          complaint.status
        )
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

        <Sidebar role="SUPER_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading all complaints..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="SUPER_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content superadmin-all-complaints-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                System Oversight
              </p>

              <h1 className="page-title">
                All Complaints
              </h1>

              <p className="page-subtitle">
                Monitor complaint activity across
                every department in CivicResolve.
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

              <div className="metric-icon metric-purple">
                ◷
              </div>

              <div className="metric-content">

                <span>
                  Active
                </span>

                <strong>
                  {activeCount}
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
                !
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


          {/* FILTERS */}

          <section className="dashboard-panel complaint-filter-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Filter System Complaints
                </h2>

                <p>
                  Search complaints across
                  departments, priorities and
                  workflow states.
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


            <div className="superadmin-complaint-filter-grid">


              <div className="complaint-filter-search">

                <label
                  className="form-label"
                  htmlFor="system-complaint-search"
                >
                  Search
                </label>

                <input
                  id="system-complaint-search"
                  type="text"
                  className="form-input"
                  placeholder="ID, description, category, address or department..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>


              <div>

                <label
                  className="form-label"
                  htmlFor="system-status-filter"
                >
                  Status
                </label>

                <select
                  id="system-status-filter"
                  className="form-select"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
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
                  htmlFor="system-priority-filter"
                >
                  Priority
                </label>

                <select
                  id="system-priority-filter"
                  className="form-select"
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(
                      event.target.value
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
                  htmlFor="system-department-filter"
                >
                  Department
                </label>

                <select
                  id="system-department-filter"
                  className="form-select"
                  value={departmentFilter}
                  onChange={(event) =>
                    setDepartmentFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="ALL">
                    All Departments
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    )
                  )}
                </select>

              </div>


              <div>

                <label
                  className="form-label"
                  htmlFor="system-review-filter"
                >
                  Attention
                </label>

                <select
                  id="system-review-filter"
                  className="form-select"
                  value={reviewFilter}
                  onChange={(event) =>
                    setReviewFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="ALL">
                    All Complaints
                  </option>

                  <option value="REVIEW">
                    Manual Review
                  </option>

                  <option value="ESCALATED">
                    Escalated
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
                  System Complaint Queue
                </h2>

                <p>
                  Showing{" "}
                  {filteredComplaints.length} of{" "}
                  {complaints.length} complaints.
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
                  selected system filters.
                </p>

              </div>

            ) : (

              <div className="complaints-card-grid">

                {filteredComplaints.map(
                  (complaint) => (

                    <div
                      key={complaint.id}
                      className="complaint-card-wrapper"
                    >

                      <div className="complaint-card-labels">


                        {complaint.department_name && (
                          <span className="complaint-context-badge blue">
                            {complaint.department_name}
                          </span>
                        )}


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
                        basePath="/super-admin/complaints"
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


export default AllComplaints
import { useEffect, useMemo, useState } from "react"

import Sidebar from "../../components/Sidebar"
import ComplaintCard from "../../components/ComplaintCard"
import Loader from "../../components/Loader"

import {
  getMyComplaints
} from "../../services/complaintService"


function MyComplaints() {
  const [complaints, setComplaints] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")


  useEffect(() => {
    async function loadComplaints() {
      try {
        setLoading(true)
        setError("")

        const data =
          await getMyComplaints()

        setComplaints(
          Array.isArray(data)
            ? data
            : data?.complaints || []
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

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
          )
        }
      )
    }, [
      complaints,
      search,
      statusFilter,
      priorityFilter
    ])


  function clearFilters() {
    setSearch("")
    setStatusFilter("ALL")
    setPriorityFilter("ALL")
  }


  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL"


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="CITIZEN" />

        <main className="dashboard-main">
          <Loader text="Loading complaints..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="CITIZEN" />


      <main className="dashboard-main">

        <div className="page-content citizen-complaints-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                Complaint Tracking
              </p>

              <h1 className="page-title">
                My Complaints
              </h1>

              <p className="page-subtitle">
                View, search and track every civic
                complaint you have submitted.
              </p>

            </div>

          </header>


          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* FILTER PANEL */}

          <section className="dashboard-panel complaint-filter-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Find a complaint
                </h2>

                <p>
                  Search by complaint ID, category,
                  address or description.
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


            <div className="complaint-filter-grid">


              <div className="complaint-filter-search">

                <label
                  className="form-label"
                  htmlFor="complaint-search"
                >
                  Search Complaints
                </label>

                <input
                  id="complaint-search"
                  type="text"
                  className="form-input"
                  placeholder="Search by ID, description, category or address..."
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
                  htmlFor="status-filter"
                >
                  Status
                </label>

                <select
                  id="status-filter"
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
                  htmlFor="priority-filter"
                >
                  Priority
                </label>

                <select
                  id="priority-filter"
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

            </div>

          </section>


          {/* RESULTS */}

          <section className="dashboard-panel complaints-results-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Complaints
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
                  Try changing your search or
                  selected filters.
                </p>

              </div>

            ) : (

              <div className="complaints-card-grid">

                {filteredComplaints.map(
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

      </main>

    </div>
  )
}


export default MyComplaints
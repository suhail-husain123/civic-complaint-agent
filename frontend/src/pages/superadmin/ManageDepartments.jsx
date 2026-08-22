import { useEffect, useState } from "react"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"

import {
  createDepartment,
  getDepartments
} from "../../services/adminService"


function ManageDepartments() {
  const [departments, setDepartments] = useState([])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")


  async function loadDepartments() {
    try {
      setLoading(true)
      setError("")

      const data =
        await getDepartments()

      const list =
        Array.isArray(data)
          ? data
          : data?.departments || []

      setDepartments(list)
    } catch (err) {
      setError(
        err.message ||
        "Failed to load departments."
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadDepartments()
  }, [])


  async function handleCreateDepartment(e) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError(
        "Department name is required."
      )
      return
    }

    setCreating(true)

    try {
      await createDepartment(
        name.trim(),
        description.trim() || null
      )

      setSuccess(
        "Department created successfully."
      )

      setName("")
      setDescription("")

      await loadDepartments()
    } catch (err) {
      setError(
        err.message ||
        "Could not create department."
      )
    } finally {
      setCreating(false)
    }
  }


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="SUPER_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading departments..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="SUPER_ADMIN" />

      <main className="dashboard-main">

        <div className="page-content departments-page">


          {/* PAGE HEADER */}

          <header className="departments-page-header">

            <div>

              <p className="dashboard-welcome">
                System Management
              </p>

              <h1 className="page-title">
                Departments
              </h1>

              <p className="page-subtitle">
                Create and manage civic departments
                used by the AI complaint-routing
                system.
              </p>

            </div>


            <div className="departments-count-card">

              <span>
                Total Departments
              </span>

              <strong>
                {departments.length}
              </strong>

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


          {/* TOP MANAGEMENT AREA */}

          <section className="departments-management-grid">


            {/* CREATE DEPARTMENT */}

            <section className="departments-panel departments-create-panel">

              <div className="departments-panel-header">

                <div className="departments-header-icon">
                  +
                </div>

                <div>

                  <h2>
                    Create Department
                  </h2>

                  <p>
                    Add a new civic department
                    that can receive complaints.
                  </p>

                </div>

              </div>


              <form
                className="departments-create-form"
                onSubmit={handleCreateDepartment}
              >

                <div className="form-group">

                  <label
                    className="form-label"
                    htmlFor="department-name"
                  >
                    Department Name
                  </label>

                  <input
                    id="department-name"
                    type="text"
                    className="form-input"
                    placeholder="Example: Electricity Department"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />

                </div>


                <div className="form-group">

                  <label
                    className="form-label"
                    htmlFor="department-description"
                  >
                    Description
                  </label>

                  <textarea
                    id="department-description"
                    className="form-textarea departments-description-input"
                    placeholder="Describe the issues handled by this department..."
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                  />

                </div>


                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={creating}
                >
                  {creating
                    ? "Creating Department..."
                    : "Create Department"}
                </button>

              </form>

            </section>


            {/* AGENT ROUTING */}

            <section className="departments-panel departments-routing-panel">

              <div className="departments-routing-heading">

                <div>

                  <span className="departments-ai-badge">
                    AI ROUTING
                  </span>

                  <h2>
                    How routing works
                  </h2>

                  <p>
                    CivicResolve automatically
                    connects each complaint to the
                    most appropriate department.
                  </p>

                </div>

              </div>


              <div className="departments-routing-flow">


                <div className="departments-routing-step">

                  <div className="departments-step-number">
                    01
                  </div>

                  <div>

                    <span>
                      Citizen Complaint
                    </span>

                    <strong>
                      Open electrical wire
                    </strong>

                  </div>

                </div>


                <div className="departments-flow-line" />


                <div className="departments-routing-step">

                  <div className="departments-step-number">
                    02
                  </div>

                  <div>

                    <span>
                      AI Classification
                    </span>

                    <strong>
                      ELECTRICITY
                    </strong>

                  </div>

                </div>


                <div className="departments-flow-line" />


                <div className="departments-routing-step">

                  <div className="departments-step-number">
                    03
                  </div>

                  <div>

                    <span>
                      Department
                    </span>

                    <strong>
                      Electricity Department
                    </strong>

                  </div>

                </div>


                <div className="departments-flow-line" />


                <div className="departments-routing-step departments-routing-result">

                  <div className="departments-step-number">
                    ✓
                  </div>

                  <div>

                    <span>
                      Result
                    </span>

                    <strong>
                      Complaint Assigned
                    </strong>

                  </div>

                </div>

              </div>

            </section>

          </section>


          {/* EXISTING DEPARTMENTS */}

          <section className="departments-existing-section">

            <div className="departments-section-header">

              <div>

                <p className="dashboard-welcome">
                  Routing Targets
                </p>

                <h2>
                  Existing Departments
                </h2>

                <p>
                  Departments currently available
                  to the CivicResolve routing agent.
                </p>

              </div>

            </div>


            {departments.length === 0 ? (

              <div className="departments-panel empty-state">

                <h3>
                  No departments created
                </h3>

                <p>
                  Create the first department
                  using the form above.
                </p>

              </div>

            ) : (

              <div className="departments-card-grid">

                {departments.map(
                  (department) => (

                    <article
                      className="department-item-card"
                      key={department.id}
                    >

                      <div className="department-item-top">

                        <div className="department-item-icon">
                          🏢
                        </div>


                        <div className="department-item-id">
                          ID #{department.id}
                        </div>

                      </div>


                      <div className="department-item-content">

                        <h3>
                          {department.name}
                        </h3>

                        <p>
                          {department.description ||
                            "No description provided."}
                        </p>

                      </div>


                      <div className="department-item-footer">

                        <span className="department-status-dot" />

                        <span>
                          AI routing enabled
                        </span>

                      </div>

                    </article>

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


export default ManageDepartments
import { useEffect, useState } from "react"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"

import {
  createAdmin,
  getAdmins,
  getDepartments,
  updateAdminDepartment
} from "../../services/adminService"


function ManageAdmins() {
  const [admins, setAdmins] = useState([])
  const [departments, setDepartments] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department_id: ""
  })


  useEffect(() => {
    loadData()
  }, [])


  async function loadData() {
    try {
      setLoading(true)
      setError("")

      const [
        adminData,
        departmentData
      ] = await Promise.all([
        getAdmins(),
        getDepartments()
      ])

      setAdmins(
        Array.isArray(adminData)
          ? adminData
          : adminData?.admins || []
      )

      setDepartments(
        Array.isArray(departmentData)
          ? departmentData
          : departmentData?.departments || []
      )
    } catch (err) {
      setError(
        err.message ||
        "Failed to load administrators."
      )
    } finally {
      setLoading(false)
    }
  }


  function handleChange(event) {
    const {
      name,
      value
    } = event.target

    setForm(
      (current) => ({
        ...current,
        [name]: value
      })
    )
  }


  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      }

      if (form.department_id) {
        payload.department_id =
          Number(
            form.department_id
          )
      }

      await createAdmin(payload)

      setForm({
        name: "",
        email: "",
        password: "",
        department_id: ""
      })

      setSuccess(
        "Department administrator created successfully."
      )

      await loadData()

    } catch (err) {
      setError(
        err.message ||
        "Failed to create administrator."
      )
    } finally {
      setSaving(false)
    }
  }


  async function handleDepartmentChange(
    adminId,
    departmentId
  ) {
    try {
      setError("")
      setSuccess("")

      await updateAdminDepartment(
        adminId,
        departmentId
          ? Number(departmentId)
          : null
      )

      setSuccess(
        "Administrator department updated."
      )

      await loadData()

    } catch (err) {
      setError(
        err.message ||
        "Failed to update department assignment."
      )
    }
  }


  function getDepartmentName(admin) {
    return (
      admin.department_name ||
      admin.department?.name ||
      "Not Assigned"
    )
  }


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="SUPER_ADMIN" />

        <main className="dashboard-main">
          <Loader text="Loading administrators..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="SUPER_ADMIN" />


      <main className="dashboard-main">

        <div className="page-content superadmin-admins-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                Access Management
              </p>

              <h1 className="page-title">
                Department Admins
              </h1>

              <p className="page-subtitle">
                Create administrators and control
                which civic department each admin
                is responsible for.
              </p>

            </div>


            <div className="admin-summary-badge">

              <span>
                Total Admins
              </span>

              <strong>
                {admins.length}
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


          {/* MAIN MANAGEMENT LAYOUT */}

          <section className="management-layout">


            {/* CREATE ADMIN */}

            <aside className="management-form-column">

              <section className="dashboard-panel management-form-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      Create Administrator
                    </h2>

                    <p>
                      Create a department admin
                      account and optionally assign
                      a department immediately.
                    </p>

                  </div>

                </div>


                <form
                  className="management-form"
                  onSubmit={handleSubmit}
                >

                  <div className="form-group">

                    <label
                      className="form-label"
                      htmlFor="admin-name"
                    >
                      Full Name
                    </label>

                    <input
                      id="admin-name"
                      name="name"
                      type="text"
                      className="form-input"
                      placeholder="Enter administrator name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label
                      className="form-label"
                      htmlFor="admin-email"
                    >
                      Email Address
                    </label>

                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="admin@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label
                      className="form-label"
                      htmlFor="admin-password"
                    >
                      Temporary Password
                    </label>

                    <input
                      id="admin-password"
                      name="password"
                      type="password"
                      className="form-input"
                      placeholder="Create a secure password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label
                      className="form-label"
                      htmlFor="admin-department"
                    >
                      Department
                    </label>

                    <select
                      id="admin-department"
                      name="department_id"
                      className="form-select"
                      value={form.department_id}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select department
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


                  <div className="management-form-note">

                    <div className="management-form-note-icon">
                      RBAC
                    </div>

                    <p>
                      Department administrators
                      can only manage complaints
                      assigned to their own
                      department.
                    </p>

                  </div>


                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={
                      saving ||
                      !form.name.trim() ||
                      !form.email.trim() ||
                      !form.password
                    }
                  >
                    {saving
                      ? "Creating..."
                      : "Create Administrator"}
                  </button>

                </form>

              </section>

            </aside>


            {/* ADMIN LIST */}

            <div className="management-list-column">

              <section className="dashboard-panel management-list-panel">

                <div className="dashboard-panel-header">

                  <div>

                    <h2>
                      Existing Administrators
                    </h2>

                    <p>
                      Manage department assignments
                      for current administrators.
                    </p>

                  </div>

                </div>


                {admins.length === 0 ? (

                  <div className="empty-state">

                    <h3>
                      No administrators found
                    </h3>

                    <p>
                      Create the first department
                      administrator using the form.
                    </p>

                  </div>

                ) : (

                  <div className="admin-management-list">

                    {admins.map(
                      (admin) => (

                        <article
                          key={admin.id}
                          className="admin-management-card"
                        >

                          <div className="admin-management-avatar">

                            {admin.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                            "A"}

                          </div>


                          <div className="admin-management-content">

                            <div className="admin-management-heading">

                              <div>

                                <span className="admin-management-id">
                                  Admin #{admin.id}
                                </span>

                                <h3>
                                  {admin.name}
                                </h3>

                                <p>
                                  {admin.email}
                                </p>

                              </div>


                              <span className="admin-role-badge">
                                Department Admin
                              </span>

                            </div>


                            <div className="admin-management-details">


                              <div className="admin-current-department">

                                <span>
                                  Current Department
                                </span>

                                <strong>
                                  {getDepartmentName(
                                    admin
                                  )}
                                </strong>

                              </div>


                              <div className="admin-department-control">

                                <label
                                  className="form-label"
                                  htmlFor={`admin-department-${admin.id}`}
                                >
                                  Change Assignment
                                </label>

                                <select
                                  id={`admin-department-${admin.id}`}
                                  className="form-select"
                                  value={
                                    admin.department_id ||
                                    admin.department?.id ||
                                    ""
                                  }
                                  onChange={(event) =>
                                    handleDepartmentChange(
                                      admin.id,
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="">
                                    No Department
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

                            </div>

                          </div>

                        </article>

                      )
                    )}

                  </div>

                )}

              </section>

            </div>

          </section>


          {/* RBAC INFORMATION */}

          <section className="dashboard-panel admin-access-info-panel">

            <div className="admin-access-info-icon">
              RBAC
            </div>


            <div>

              <h3>
                Role-based department access
              </h3>

              <p>
                CivicResolve uses role-based access
                control. Super Admin manages the
                platform, while each Department
                Admin works only with complaints
                routed to their assigned
                department.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}


export default ManageAdmins
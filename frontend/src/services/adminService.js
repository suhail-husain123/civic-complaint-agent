import { apiRequest } from "./api"

export async function getDepartments() {
  return apiRequest("/departments")
}

export async function createDepartment(
  name,
  description = null
) {
  return apiRequest(
    "/departments",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        description
      })
    }
  )
}

export async function getAdmins() {
  return apiRequest("/admins")
}

export async function createAdmin({
  name,
  email,
  password,
  department_id
}) {
  return apiRequest(
    "/admins",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        department_id: Number(
          department_id
        )
      })
    }
  )
}

export async function updateAdminDepartment(
  adminId,
  departmentId
) {
  return apiRequest(
    `/admins/${adminId}/department`,
    {
      method: "PATCH",
      body: JSON.stringify({
        department_id: Number(
          departmentId
        )
      })
    }
  )
}

export async function getAdminEscalations() {
  return apiRequest(
    "/admin/escalations"
  )
}

export async function getCitizenDashboard() {
  return apiRequest(
    "/dashboard/citizen"
  )
}

export async function getDepartmentDashboard() {
  return apiRequest(
    "/dashboard/department"
  )
}

export async function getSuperAdminDashboard() {
  return apiRequest(
    "/dashboard/super-admin"
  )
}
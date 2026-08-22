export const USER_ROLES = {
  CITIZEN: "CITIZEN",
  DEPARTMENT_ADMIN: "DEPARTMENT_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN"
}

export const COMPLAINT_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL"
]

export const COMPLAINT_STATUSES = [
  "SUBMITTED",
  "MANUAL_REVIEW_REQUIRED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED"
]

export const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
}

export const STATUS_LABELS = {
  SUBMITTED: "Submitted",
  MANUAL_REVIEW_REQUIRED: "Manual Review Required",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed"
}

export const ROLE_HOME_ROUTES = {
  CITIZEN: "/citizen/dashboard",
  DEPARTMENT_ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard"
}

export const AI_CONFIDENCE_THRESHOLD = 0.7
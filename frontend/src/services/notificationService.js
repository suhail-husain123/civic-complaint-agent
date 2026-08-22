import { apiRequest } from "./api"

export async function getNotifications() {
  return apiRequest("/notifications")
}

export async function markNotificationAsRead(id) {
  return apiRequest(
    `/notifications/${id}/read`,
    {
      method: "PATCH"
    }
  )
}
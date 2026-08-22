import { apiRequest } from "./api"


export async function getMyComplaints() {
  return apiRequest(
    "/my-complaints"
  )
}


export async function getAdminComplaints() {
  return apiRequest(
    "/admin/complaints"
  )
}


export async function getComplaintById(id) {
  return apiRequest(
    `/complaints/${id}`
  )
}


export async function getComplaintHistory(id) {
  return apiRequest(
    `/complaints/${id}/history`
  )
}


export async function getComplaintAIDecisions(id) {
  return apiRequest(
    `/complaints/${id}/ai-decisions`
  )
}


export async function getComplaintEscalations(id) {
  return apiRequest(
    `/complaints/${id}/escalations`
  )
}


export async function createComplaint({
  description,
  address,
  latitude,
  longitude,
  image
}) {
  const formData = new FormData()

  formData.append(
    "description",
    description
  )

  if (address) {
    formData.append(
      "address",
      address
    )
  }

  if (
    latitude !== null &&
    latitude !== undefined &&
    latitude !== ""
  ) {
    formData.append(
      "latitude",
      latitude
    )
  }

  if (
    longitude !== null &&
    longitude !== undefined &&
    longitude !== ""
  ) {
    formData.append(
      "longitude",
      longitude
    )
  }

  if (image) {
    formData.append(
      "image",
      image
    )
  }

  return apiRequest(
    "/complaints-with-image",
    {
      method: "POST",
      body: formData
    }
  )
}


export async function reviewComplaint(
  id,
  {
    category,
    priority,
    department_id = null,
    review_note = null
  }
) {
  const body = {
    category,
    priority
  }

  if (department_id !== null) {
    body.department_id =
      Number(
        department_id
      )
  }

  if (review_note !== null) {
    body.review_note =
      review_note
  }

  return apiRequest(
    `/complaints/${id}/review`,
    {
      method: "PATCH",
      body: JSON.stringify(body)
    }
  )
}


export async function updateComplaintStatus(
  id,
  {
    status,
    resolution_note = null,
    resolution_image_url = null
  }
) {
  const body = {
    status
  }

  if (resolution_note !== null) {
    body.resolution_note =
      resolution_note
  }

  if (resolution_image_url !== null) {
    body.resolution_image_url =
      resolution_image_url
  }

  return apiRequest(
    `/complaints/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(body)
    }
  )
}


export async function uploadImage(image) {
  const formData = new FormData()

  formData.append(
    "image",
    image
  )

  return apiRequest(
    "/upload-image",
    {
      method: "POST",
      body: formData
    }
  )
}
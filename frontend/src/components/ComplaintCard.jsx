import { useNavigate } from "react-router-dom"
import StatusBadge from "./StatusBadge"
import PriorityBadge from "./PriorityBadge"

function ComplaintCard({ complaint, basePath = "/citizen/complaints" }) {
  const navigate = useNavigate()

  function handleOpenComplaint() {
    navigate(`${basePath}/${complaint.id}`)
  }

  return (
    <div className="complaint-card">
      <div className="complaint-card-top">
        <div>
          <p className="complaint-id">
            Complaint #{complaint.id}
          </p>

          <h3 className="complaint-title">
            {complaint.title || complaint.description}
          </h3>
        </div>

        <PriorityBadge priority={complaint.priority} />
      </div>

      <p className="complaint-description">
        {complaint.description}
      </p>

      <div className="complaint-card-info">
        <div>
          <span className="complaint-label">
            Category
          </span>

          <span>
            {complaint.category || "Pending AI analysis"}
          </span>
        </div>

        <div>
          <span className="complaint-label">
            Status
          </span>

          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {complaint.address && (
        <p className="complaint-location">
          📍 {complaint.address}
        </p>
      )}

      <div className="complaint-card-footer">
        <span className="complaint-date">
          {complaint.created_at
            ? new Date(
                complaint.created_at
              ).toLocaleDateString()
            : ""}
        </span>

        <button
          className="btn btn-secondary complaint-view-button"
          onClick={handleOpenComplaint}
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default ComplaintCard
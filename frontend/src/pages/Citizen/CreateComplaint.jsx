import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../../components/Sidebar"

import {
  createComplaint
} from "../../services/complaintService"


function CreateComplaint() {
  const navigate = useNavigate()

  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")

  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const [error, setError] = useState("")


  function handleImageChange(e) {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    setImage(file)

    setImagePreview(
      URL.createObjectURL(file)
    )
  }


  async function handleCurrentLocation() {
    setError("")

    if (!navigator.geolocation) {
        setError(
        "Geolocation is not supported by your browser."
        )
        return
    }

    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
        async (position) => {
        const lat =
            position.coords.latitude

        const lng =
            position.coords.longitude

        setLatitude(lat)
        setLongitude(lng)

        console.log(
            "Location accuracy:",
            position.coords.accuracy,
            "meters"
        )

        try {
            const response = await fetch(
            `${
                import.meta.env.VITE_API_URL
            }/reverse-geocode?latitude=${lat}&longitude=${lng}`
            )

            if (!response.ok) {
            throw new Error(
                "Could not determine address."
            )
            }

            const data =
            await response.json()

            setAddress(
            data.address || ""
            )
        } catch (err) {
            console.error(
            "Reverse geocoding failed:",
            err
            )

            setError(
            "Location captured, but the address could not be detected automatically."
            )
        }

        setLocationLoading(false)
        },

        (error) => {
        if (error.code === 1) {
            setError(
            "Location permission was denied."
            )
        } else if (error.code === 2) {
            setError(
            "Your location could not be determined."
            )
        } else if (error.code === 3) {
            setError(
            "Location request timed out."
            )
        } else {
            setError(
            "Could not access your current location."
            )
        }

        setLocationLoading(false)
        },

        {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
        }
    )
    }


  async function handleSubmit(e) {
    e.preventDefault()

    setError("")

    if (!description.trim()) {
      setError(
        "Please describe the civic issue."
      )

      return
    }

    if (
      !address.trim() &&
      (!latitude || !longitude)
    ) {
      setError(
        "Please provide an address or current location."
      )

      return
    }

    setLoading(true)

    try {
      const complaint =
        await createComplaint({
          description:
            description.trim(),

          address:
            address.trim() || null,

          latitude:
            latitude || null,

          longitude:
            longitude || null,

          image
        })

      navigate(
        `/citizen/complaints/${complaint.id}`
      )
    } catch (err) {
      setError(
        err.message ||
        "Could not submit complaint."
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="CITIZEN" />


      <main className="dashboard-main">

        <div className="page-content create-complaint-page">


          {/* HEADER */}

          <div className="create-complaint-header">

            <div>

              <p className="dashboard-welcome">
                AI Powered
              </p>

              <h1 className="page-title">
                Report a Civic Issue
              </h1>

              <p className="page-subtitle">
                Describe the problem and CivicResolve
                will analyze, prioritize and route it
                automatically.
              </p>

            </div>


            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  "/citizen/complaints"
                )
              }
            >
              My Complaints
            </button>

          </div>


          {/* ERROR */}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          <form
            className="create-complaint-form-shell"
            onSubmit={handleSubmit}
          >


            {/* =====================================
                STEP 1 - DESCRIPTION
            ===================================== */}

            <section className="complaint-form-section">

              <div className="complaint-form-section-header">

                <div className="complaint-step-number">
                  01
                </div>

                <div>

                  <h2>
                    Describe the problem
                  </h2>

                  <p>
                    Explain what happened and provide
                    enough detail for the AI agent to
                    understand the issue.
                  </p>

                </div>

              </div>


              <div className="complaint-form-section-body">

                <div className="form-group">

                  <label
                    className="form-label"
                    htmlFor="description"
                  >
                    Complaint Description
                  </label>


                  <textarea
                    id="description"
                    className="form-textarea complaint-description-input"
                    placeholder="Example: There is an open electrical wire hanging near the school gate and it looks dangerous."
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>


                <div className="complaint-ai-hint">

                  <span className="complaint-ai-hint-icon">
                    AI
                  </span>

                  <p>
                    You do not need to choose a category,
                    priority or department. CivicResolve
                    will decide those automatically.
                  </p>

                </div>

              </div>

            </section>


            {/* =====================================
                STEP 2 - LOCATION
            ===================================== */}

            <section className="complaint-form-section">

              <div className="complaint-form-section-header">

                <div className="complaint-step-number">
                  02
                </div>

                <div>

                  <h2>
                    Add location
                  </h2>

                  <p>
                    Tell us where the civic issue is
                    located.
                  </p>

                </div>

              </div>


              <div className="complaint-form-section-body">


                <div className="location-action-row">

                  <button
                    type="button"
                    className="btn btn-secondary location-button"
                    onClick={handleCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? "Getting Location..."
                      : "📍 Use My Current Location"}
                  </button>


                  {latitude &&
                    longitude && (

                      <span className="location-success">
                        Location captured
                      </span>

                    )}

                </div>


                <div className="form-group">

                  <label
                    className="form-label"
                    htmlFor="address"
                  >
                    Address
                  </label>


                  <input
                    id="address"
                    type="text"
                    className="form-input"
                    placeholder="Example: Main Road, Sector 12"
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                  />

                </div>


                {latitude &&
                  longitude && (

                    <div className="coordinate-box">

                      <div>

                        <span>
                          Latitude
                        </span>

                        <strong>
                          {latitude}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Longitude
                        </span>

                        <strong>
                          {longitude}
                        </strong>

                      </div>

                    </div>

                  )}


                <p className="form-helper-text">
                  If GPS coordinates are available,
                  the backend can reverse-geocode them
                  into an address.
                </p>

              </div>

            </section>


            {/* =====================================
                STEP 3 - IMAGE
            ===================================== */}

            <section className="complaint-form-section">

              <div className="complaint-form-section-header">

                <div className="complaint-step-number">
                  03
                </div>

                <div>

                  <h2>
                    Add evidence
                  </h2>

                  <p>
                    Uploading a photo is optional, but
                    it can help the department understand
                    the issue faster.
                  </p>

                </div>

              </div>


              <div className="complaint-form-section-body">

                <label
                  className="image-upload-box complaint-evidence-upload"
                  htmlFor="complaint-image"
                >

                  {imagePreview ? (

                    <img
                      src={imagePreview}
                      alt="Complaint preview"
                      className="complaint-image-preview"
                    />

                  ) : (

                    <div className="image-upload-placeholder">

                      <div className="upload-icon">
                        ↑
                      </div>

                      <strong>
                        Upload complaint photo
                      </strong>

                      <p>
                        JPG, PNG or another supported
                        image format.
                      </p>

                    </div>

                  )}


                  <input
                    id="complaint-image"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                      handleImageChange
                    }
                  />

                </label>

              </div>

            </section>


            {/* =====================================
                SUBMIT
            ===================================== */}

            <section className="complaint-form-section complaint-submit-section">

              <div className="complaint-submit-info">

                <span className="ai-card-badge">
                  CivicResolve Agent
                </span>

                <h2>
                  Ready for AI analysis
                </h2>

                <p>
                  After submission, the agent will
                  analyze your complaint, assign a
                  category and priority, choose the
                  responsible department, and decide
                  whether human review is required.
                </p>

              </div>


              <button
                type="submit"
                className="btn btn-primary complaint-submit-button"
                disabled={loading}
              >
                {loading
                  ? "Submitting Complaint..."
                  : "Submit Complaint"}
              </button>

            </section>

          </form>

        </div>

      </main>

    </div>
  )
}


export default CreateComplaint
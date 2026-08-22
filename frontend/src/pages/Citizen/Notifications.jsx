import { useEffect, useState } from "react"

import Sidebar from "../../components/Sidebar"
import Loader from "../../components/Loader"

import {
  getNotifications,
  markNotificationAsRead
} from "../../services/notificationService"


function Notifications() {
  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true)
        setError("")

        const data =
          await getNotifications()

        setNotifications(
          Array.isArray(data)
            ? data
            : data?.notifications || []
        )
      } catch (err) {
        setError(
          err.message ||
          "Failed to load notifications."
        )
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])


  async function handleMarkAsRead(
    notificationId
  ) {
    try {
      await markNotificationAsRead(
        notificationId
      )

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true
                  }
                : notification
          )
      )
    } catch (err) {
      setError(
        err.message ||
        "Could not mark notification as read."
      )
    }
  }


  function formatDate(value) {
    if (!value) {
      return ""
    }

    return new Date(
      value
    ).toLocaleString()
  }


  function getNotificationType(
    notification
  ) {
    const content = `
      ${notification.title || ""}
      ${notification.message || ""}
    `.toLowerCase()

    if (
      content.includes("escalat")
    ) {
      return "danger"
    }

    if (
      content.includes("resolved") ||
      content.includes("closed")
    ) {
      return "success"
    }

    if (
      content.includes("review")
    ) {
      return "purple"
    }

    if (
      content.includes("assigned") ||
      content.includes("department")
    ) {
      return "blue"
    }

    return "default"
  }


  function getNotificationIcon(
    notification
  ) {
    const type =
      getNotificationType(
        notification
      )

    if (type === "danger") {
      return "!"
    }

    if (type === "success") {
      return "✓"
    }

    if (type === "purple") {
      return "AI"
    }

    if (type === "blue") {
      return "→"
    }

    return "i"
  }


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length


  if (loading) {
    return (
      <div className="dashboard-layout">

        <Sidebar role="CITIZEN" />

        <main className="dashboard-main">
          <Loader text="Loading notifications..." />
        </main>

      </div>
    )
  }


  return (
    <div className="dashboard-layout">

      <Sidebar role="CITIZEN" />


      <main className="dashboard-main">

        <div className="page-content citizen-notifications-page">


          {/* PAGE HEADER */}

          <header className="app-page-header">

            <div>

              <p className="dashboard-welcome">
                Activity Center
              </p>

              <h1 className="page-title">
                Notifications
              </h1>

              <p className="page-subtitle">
                Stay updated on complaint
                assignments, status changes,
                escalations and resolutions.
              </p>

            </div>


            <div className="notification-summary-badge">

              <span>
                Unread
              </span>

              <strong>
                {unreadCount}
              </strong>

            </div>

          </header>


          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* NOTIFICATIONS PANEL */}

          <section className="dashboard-panel notifications-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Recent Activity
                </h2>

                <p>
                  Important updates from your
                  complaint workflow.
                </p>

              </div>

            </div>


            {notifications.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No notifications yet
                </h3>

                <p>
                  Updates about your complaints
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="notification-list">

                {notifications.map(
                  (notification) => {

                    const type =
                      getNotificationType(
                        notification
                      )

                    return (
                      <article
                        key={notification.id}
                        className={
                          notification.is_read
                            ? `notification-card notification-${type}`
                            : `notification-card notification-${type} unread`
                        }
                      >

                        <div
                          className={`notification-card-icon notification-icon-${type}`}
                        >
                          {getNotificationIcon(
                            notification
                          )}
                        </div>


                        <div className="notification-card-content">

                          <div className="notification-card-header">

                            <div>

                              <h3>
                                {notification.title ||
                                "Complaint Update"}
                              </h3>

                              <span>
                                {formatDate(
                                  notification.created_at
                                )}
                              </span>

                            </div>


                            {!notification.is_read && (
                              <span className="notification-unread-dot">
                              </span>
                            )}

                          </div>


                          <p className="notification-message">
                            {notification.message}
                          </p>


                          {!notification.is_read && (

                            <button
                              type="button"
                              className="text-button notification-mark-read"
                              onClick={() =>
                                handleMarkAsRead(
                                  notification.id
                                )
                              }
                            >
                              Mark as read
                            </button>

                          )}

                        </div>

                      </article>
                    )
                  }
                )}

              </div>

            )}

          </section>


          {/* INFO PANEL */}

          <section className="dashboard-panel notification-info-panel">

            <div className="notification-info-icon">
              i
            </div>

            <div>

              <h3>
                Why am I receiving these?
              </h3>

              <p>
                CivicResolve creates notifications
                when important events happen in
                your complaint workflow, such as
                department assignment, status
                updates, human review, escalation
                or resolution.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}


export default Notifications
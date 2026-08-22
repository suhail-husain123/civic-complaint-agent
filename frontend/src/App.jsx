import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Login"
import Register from "./pages/Register"

import CitizenDashboard from "./pages/citizen/CitizenDashboard"
import CreateComplaint from "./pages/citizen/CreateComplaint"
import MyComplaints from "./pages/citizen/MyComplaints"
import CitizenComplaintDetails from "./pages/citizen/ComplaintDetails"
import Notifications from "./pages/citizen/Notifications"

import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminComplaints from "./pages/admin/AdminComplaints"
import ManualReview from "./pages/admin/ManualReview"
import Escalations from "./pages/admin/Escalations"
import AdminComplaintDetails from "./pages/admin/ComplaintDetails"

import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard"
import ManageDepartments from "./pages/superadmin/ManageDepartments"
import ManageAdmins from "./pages/superadmin/ManageAdmins"
import AllComplaints from "./pages/superadmin/AllComplaints"
import SuperAdminComplaintDetails from "./pages/superadmin/ComplaintDetails"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* -------------------------
            PUBLIC
        ------------------------- */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* -------------------------
            CITIZEN
        ------------------------- */}

        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CITIZEN"
              ]}
            >
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/create-complaint"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CITIZEN"
              ]}
            >
              <CreateComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/complaints"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CITIZEN"
              ]}
            >
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/complaints/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CITIZEN"
              ]}
            >
              <CitizenComplaintDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/notifications"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CITIZEN"
              ]}
            >
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* -------------------------
            DEPARTMENT ADMIN
        ------------------------- */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DEPARTMENT_ADMIN"
              ]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DEPARTMENT_ADMIN"
              ]}
            >
              <AdminComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaints/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DEPARTMENT_ADMIN"
              ]}
            >
              <AdminComplaintDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manual-review"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DEPARTMENT_ADMIN"
              ]}
            >
              <ManualReview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/escalations"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DEPARTMENT_ADMIN"
              ]}
            >
              <Escalations />
            </ProtectedRoute>
          }
        />

        {/* -------------------------
            SUPER ADMIN
        ------------------------- */}

        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN"
              ]}
            >
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/complaints"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN"
              ]}
            >
              <AllComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/complaints/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN"
              ]}
            >
              <SuperAdminComplaintDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/departments"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN"
              ]}
            >
              <ManageDepartments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/admins"
          element={
            <ProtectedRoute
              allowedRoles={[
                "SUPER_ADMIN"
              ]}
            >
              <ManageAdmins />
            </ProtectedRoute>
          }
        />

        {/* -------------------------
            FALLBACK
        ------------------------- */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
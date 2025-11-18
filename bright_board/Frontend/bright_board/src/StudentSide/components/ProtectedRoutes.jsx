import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("studentToken");
  console.log("Token in ProtectedRoute:", token);

  if (!token) {
    console.log("No token found, redirecting to /role");
    return <Navigate to="/role" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded Token:", decoded);
    const currentTime = Date.now() / 1000;
    console.log("Current Time:", currentTime, "Token Expiry:", decoded.exp);

    if (decoded.exp < currentTime) {
      console.log("Token expired, removing and redirecting to /role");
      localStorage.removeItem("token");
      return <Navigate to="/role" replace />;
    }

    const userRole = decoded.role || (decoded.studentId ? 'student' : (decoded.instituteId ? 'admin' : 'student'));
    console.log("User Role:", userRole, "Allowed Roles:", allowedRoles);

    if (allowedRoles.includes(userRole)) {
      console.log("Role authorized, rendering children");
      return children;
    } else {
      console.log("Role not allowed, redirecting to /");
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    console.log("Token decoding failed:", err.message);
    localStorage.removeItem("token");
    return <Navigate to="/role" replace />;
  }
};

export default ProtectedRoute;

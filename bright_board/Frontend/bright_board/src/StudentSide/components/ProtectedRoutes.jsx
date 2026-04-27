import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("studentToken");

  if (!token) {
    return <Navigate to="/role" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      // Token expired — clean up ALL keys
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("studentToken");
      localStorage.removeItem("studentName");
      localStorage.removeItem("studentId");
      localStorage.removeItem("instituteId");
      return <Navigate to="/role" replace />;
    }

    const userRole = decoded.role || (decoded.studentId ? 'student' : (decoded.instituteId ? 'admin' : 'student'));

    if (allowedRoles.includes(userRole)) {
      return children;
    } else {
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    // Token decode failed — clean up ALL keys
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentId");
    localStorage.removeItem("instituteId");
    return <Navigate to="/role" replace />;
  }
};

export default ProtectedRoute;

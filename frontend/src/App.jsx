import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InterviewPrep from "./pages/InterviewPrep";
import { sessionManager } from "./utils/sessionManager";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on app load
    const isAuthenticated = sessionManager.initializeSession();
    
    // If user is authenticated and on landing page, redirect to dashboard
    if (isAuthenticated && window.location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/interview/:id" element={<InterviewPrep />} />
    </Routes>
  );
};

export default App;

import axios from "./axiosInstance";

export const SESSION_KEY = "session_timestamp";
export const USER_KEY = "user";
export const TOKEN_KEY = "token";

export const sessionManager = {
  // Check if user has a valid session
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    const lastVisit = localStorage.getItem(SESSION_KEY);

    if (!token || !user) return false;

    // Check if session is within 5 days
    if (lastVisit) {
      const lastVisitTime = parseInt(lastVisit);
      const now = Date.now();
      const fiveDays = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds

      if (now - lastVisitTime > fiveDays) {
        // Session expired, clear data
        sessionManager.logout();
        return false;
      }
    }

    return true;
  },

  // Update session timestamp (extend session)
  extendSession: () => {
    localStorage.setItem(SESSION_KEY, Date.now().toString());
  },

  // Login user and start session
  login: (userData) => {
    localStorage.setItem(TOKEN_KEY, userData.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      _id: userData._id,
      name: userData.name,
      email: userData.email
    }));
    sessionManager.extendSession();
  },

  // Logout user and clear session
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  // Get current user data
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Initialize session on app load
  initializeSession: () => {
    if (sessionManager.isAuthenticated()) {
      sessionManager.extendSession();
      return true;
    }
    return false;
  }
};
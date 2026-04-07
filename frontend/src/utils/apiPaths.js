const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:9001/api";

export const API_PATHS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
  },
  SESSION: {
    CREATE: `${BASE_URL}/sessions/create`,
    GET_ALL: `${BASE_URL}/sessions/my-sessions`,
    GET_ONE: `${BASE_URL}/sessions`, // usage: GET_ONE/:id
  },
  AI: {
    GENERATE_QUESTIONS: `${BASE_URL}/ai/generate-questions`,
    GENERATE_CODING_QUESTIONS: `${BASE_URL}/ai/generate-coding-questions`,
    GENERATE_SYSTEM_DESIGN_QUESTIONS: `${BASE_URL}/ai/generate-system-design-questions`,
    GENERATE_BEHAVIORAL_QUESTIONS: `${BASE_URL}/ai/generate-behavioral-questions`,
    EXPLAIN: `${BASE_URL}/ai/generate-explanation`,
  },
};

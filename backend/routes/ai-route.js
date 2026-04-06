import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import {
  generateInterviewQuestions,
  generateCodingQuestions,
  generateSystemDesignQuestions,
  generateBehavioralQuestions,
  generateConceptExplanation,
} from "../controller/ai-controller.js";

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Generate different types of interview questions
router.post("/generate-questions", generateInterviewQuestions);
router.post("/generate-coding-questions", generateCodingQuestions);
router.post("/generate-system-design-questions", generateSystemDesignQuestions);
router.post("/generate-behavioral-questions", generateBehavioralQuestions);

// Generate explanation for a concept/question
router.post("/generate-explanation", generateConceptExplanation);

export default router;
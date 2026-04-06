import { GoogleGenAI } from "@google/genai";
import Question from "../models/question-model.js";
import Session from "../models/session-model.js";
import {
  conceptExplainPrompt,
  questionAnswerPrompt,
  codingQuestionPrompt,
  systemDesignPrompt,
  behavioralQuestionPrompt,
} from "../utils/prompts-util.js";

// Lazy initialize AI to ensure environment is loaded
let ai = null;
const getAI = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

// @desc    Generate + SAVE interview questions for a session
// @route   POST /api/ai/generate-questions
// @access  Private
export const generateInterviewQuestions = async (req, res) => {
  console.log("hi");
  try {
    const { sessionId } = req.body; //! read sessionId, not role/experience

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    //? 1. fetch session → get role, experience, topicsToFocus
    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { role, experience, topicsToFocus } = session;
    console.log("session: ", session);

    //? 2. generate via Gemini
    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, 10);
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    console.log("response: ", response);

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts
      .filter((p) => !p.thought) // gemini-2.5-flash includes thinking parts; skip them
      .map((p) => p.text ?? "")
      .join("");

    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "")
      .replace(/^json\s*/, "")
      .trim();

    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      else throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(questions)) throw new Error("Response is not an array");

    //! 4. save to DB — was completely missing before
    const saved = await Question.insertMany(
      questions.map((q) => ({
        session: sessionId,
        question: q.question,
        answer: q.answer || "",
        note: "",
        type: "general",
        difficulty: experience <= 2 ? "beginner" : experience <= 5 ? "intermediate" : "advanced",
        isPinned: false,
      })),
    );

    //! 5. attach IDs to session
    session.questions.push(...saved.map((q) => q._id));
    await session.save();

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// @desc    Generate coding questions for a session
// @route   POST /api/ai/generate-coding-questions
// @access  Private
export const generateCodingQuestions = async (req, res) => {
  try {
    const { sessionId, difficulty = "intermediate", count = 5 } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { role, experience, topicsToFocus } = session;
    const prompt = codingQuestionPrompt(role, experience, topicsToFocus, count, difficulty);

    const response = await getAI().models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "")
      .replace(/^json\s*/, "")
      .trim();

    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      else throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(questions)) throw new Error("Response is not an array");

    const saved = await Question.insertMany(
      questions.map((q) => ({
        session: sessionId,
        question: q.question,
        answer: q.answer || "",
        note: `Type: Coding | Difficulty: ${difficulty}`,
        type: "coding",
        difficulty: difficulty,
        isPinned: false,
      })),
    );

    session.questions.push(...saved.map((q) => q._id));
    await session.save();

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate coding questions",
      error: error.message,
    });
  }
};

// @desc    Generate system design questions for a session
// @route   POST /api/ai/generate-system-design-questions
// @access  Private
export const generateSystemDesignQuestions = async (req, res) => {
  try {
    const { sessionId, count = 3 } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { role, experience, topicsToFocus } = session;
    const prompt = systemDesignPrompt(role, experience, topicsToFocus, count);

    const response = await getAI().models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "")
      .replace(/^json\s*/, "")
      .trim();

    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      else throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(questions)) throw new Error("Response is not an array");

    const saved = await Question.insertMany(
      questions.map((q) => ({
        session: sessionId,
        question: q.question,
        answer: q.answer || "",
        note: "Type: System Design",
        type: "system-design",
        difficulty: experience <= 3 ? "intermediate" : "advanced",
        isPinned: false,
      })),
    );

    session.questions.push(...saved.map((q) => q._id));
    await session.save();

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate system design questions",
      error: error.message,
    });
  }
};

// @desc    Generate behavioral questions for a session
// @route   POST /api/ai/generate-behavioral-questions
// @access  Private
export const generateBehavioralQuestions = async (req, res) => {
  try {
    const { sessionId, count = 5 } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { role, experience } = session;
    const prompt = behavioralQuestionPrompt(role, experience, count);

    const response = await getAI().models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "")
      .replace(/^json\s*/, "")
      .trim();

    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      else throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(questions)) throw new Error("Response is not an array");

    const saved = await Question.insertMany(
      questions.map((q) => ({
        session: sessionId,
        question: q.question,
        answer: q.answer || "",
        note: "Type: Behavioral",
        type: "behavioral",
        difficulty: "intermediate",
        isPinned: false,
      })),
    );

    session.questions.push(...saved.map((q) => q._id));
    await session.save();

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate behavioral questions",
      error: error.message,
    });
  }
};

// @desc    Generate explanation for an interview question
// @route   POST /api/ai/generate-explanation
// @access  Private
export const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await getAI().models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // Clean it: Remove backticks, json markers, and any extra formatting
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "")
      .replace(/^json\s*/, "")
      .trim();

    // Parse the cleaned JSON
    let explanation;
    try {
      explanation = JSON.parse(cleanedText);
    } catch (parseError) {
      // If parsing fails, try to extract JSON object from text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        explanation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Validate the response structure
    if (!explanation.title || !explanation.explanation) {
      throw new Error(
        "Response missing required fields: title and explanation",
      );
    }

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("questions"); // ← this was missing

    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

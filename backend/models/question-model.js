import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["general", "coding", "system-design", "behavioral"],
      default: "general",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Question = mongoose.model("Question", QuestionSchema);
export default Question;
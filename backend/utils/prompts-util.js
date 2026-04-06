export const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
) => {
  return `You are a senior engineer conducting a technical interview.

Generate exactly ${numberOfQuestions} interview questions for the following profile:
- Role: ${role}
- Experience: ${experience} years
- Topics to focus on: ${topicsToFocus || "general topics for this role"}

Rules for each question:
1. The "answer" field must be well-structured using markdown:
   - Use **bold** for key terms
   - Use bullet points or numbered lists where appropriate
   - Add a short \`\`\`js ... \`\`\` code block when relevant (keep it under 10 lines)
   - Break the answer into short paragraphs — never one wall of text
2. Answers should be beginner-friendly but technically accurate.
3. Difficulty should match ${experience} years of experience.

Return ONLY a valid JSON array. No extra text, no markdown wrapper around the JSON.

[
  {
    "question": "...",
    "answer": "**Definition:** ...\\n\\n**Key points:**\\n- Point 1\\n- Point 2\\n\\n\`\`\`js\\n// example\\n\`\`\`"
  }
]`;
};

export const codingQuestionPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
  difficulty = "intermediate"
) => {
  return `You are a senior engineer creating coding interview questions.

Generate exactly ${numberOfQuestions} coding problems for the following profile:
- Role: ${role}
- Experience: ${experience} years
- Topics to focus on: ${topicsToFocus || "data structures, algorithms"}
- Difficulty: ${difficulty}

For each coding question, provide:
1. A clear problem statement
2. Input/output examples
3. Constraints
4. Expected time/space complexity hints
5. A complete solution with explanation

Return ONLY a valid JSON array:

[
  {
    "question": "Problem statement here...",
    "answer": "**Problem:** ...\\n\\n**Examples:**\\n\`\`\`\\nInput: ...\\nOutput: ...\\n\`\`\`\\n\\n**Solution:**\\n\`\`\`js\\nfunction solution() {\\n  // code here\\n}\\n\`\`\`\\n\\n**Explanation:** ..."
  }
]`;
};

export const systemDesignPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions
) => {
  return `You are a senior architect designing system design interview questions.

Generate exactly ${numberOfQuestions} system design questions for:
- Role: ${role}
- Experience: ${experience} years
- Topics: ${topicsToFocus || "scalability, databases, APIs"}

Each question should cover:
1. High-level system requirements
2. Key components and their interactions
3. Trade-offs and considerations
4. Potential challenges and solutions

Return ONLY a valid JSON array:

[
  {
    "question": "Design a [system] that can handle [requirements]...",
    "answer": "**Requirements:** ...\\n\\n**High-level Design:**\\n- Component 1\\n- Component 2\\n\\n**Trade-offs:**\\n- Option A vs B\\n\\n**Challenges:** ..."
  }
]`;
};

export const behavioralQuestionPrompt = (
  role,
  experience,
  numberOfQuestions
) => {
  return `You are an HR professional creating behavioral interview questions.

Generate exactly ${numberOfQuestions} behavioral questions for a ${role} position with ${experience} years experience.

Focus on:
1. Leadership and teamwork
2. Problem-solving and decision making
3. Communication skills
4. Learning and adaptation
5. Conflict resolution

Return ONLY a valid JSON array:

[
  {
    "question": "Tell me about a time when...",
    "answer": "**What to look for:**\\n- Specific example\\n- STAR method\\n- Positive outcome\\n\\n**Sample Answer:** ..."
  }
]`;
};

export const conceptExplainPrompt = (question) => {
  return `You are a senior developer explaining a concept to a junior developer.

Explain the following interview question in depth:
"${question}"

Structure your explanation like this:
1. Start with a **one-line definition** in bold.
2. Explain the concept in 2–3 short paragraphs.
3. Use bullet points for any list of features, pros/cons, or steps.
4. If relevant, include a small code example (under 10 lines) in a \`\`\`js block.
5. End with a **"Key Takeaway"** line summarizing the concept in one sentence.

Return ONLY a valid JSON object in this exact shape. No extra text outside the JSON:

{
  "title": "Short, clear concept title (5 words max)",
  "explanation": "**Definition:** ...\\n\\n Paragraph...\\n\\n**Key Takeaway:** ..."
}`;
};

// --- OpenRouter AI Service (Mock data completely removed as requested) ---

const getApiKey = (userApiKey) => {
  let key = userApiKey || process.env.OPENROUTER_API_KEY || null;
  if (key) {
    key = key.replace(/^['"]|['"]$/g, '');
  }
  return key;
};

// --- Helper to safely parse JSON from Response ---
function parseCleanJson(text) {
  let cleaned = text;
  // Remove markdown code blocks if the model wrapped JSON
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```json/gi, '');
    cleaned = cleaned.replace(/```/gi, '');
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

// --- Helper to call OpenRouter API ---
const callOpenRouter = async (prompt, userApiKey) => {
  const apiKey = getApiKey(userApiKey);
  if (!apiKey) {
    throw new Error("OpenRouter API Key is missing. Please provide it in Settings or configure OPENROUTER_API_KEY in the backend .env file.");
  }

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "SmartAI"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
    throw new Error("No responses returned from OpenRouter model choices.");
  }

  return data.choices[0].message.content;
};

// --- AI Service Actions ---
const AIService = {
  /**
   * Generates a list of 5 interview questions.
   */
  generateQuestions: async (track, difficulty, resumeText, userApiKey) => {
    try {
      let prompt = `You are a professional technical interviewer. Generate 5 highly realistic interview questions for a candidate interviewing for a ${difficulty}-level role in the "${track}" track.`;
      if (resumeText) {
        prompt += ` Take the candidate's resume/profile details into account to tailor at least 2 of the questions: "${resumeText}".`;
      }
      prompt += ` Return your output strictly as a JSON array of strings containing the questions, like so: ["Question 1", "Question 2", ...]. Do not output any markdown headers, explanations, or wrapper other than the raw JSON array.`;

      const textResponse = await callOpenRouter(prompt, userApiKey);
      return parseCleanJson(textResponse);
    } catch (err) {
      console.error('❌ AIService generateQuestions error:', err.message);
      throw new Error(`Failed to generate questions: ${err.message}`);
    }
  },

  /**
   * Evaluates a single answer.
   */
  analyzeAnswer: async (questionText, answerText, track, difficulty, userApiKey) => {
    try {
      const prompt = `Evaluate the candidate's answer to the interview question below in the context of a ${difficulty}-level "${track}" interview.
Question: "${questionText}"
Answer: "${answerText}"

Provide your feedback strictly in this JSON format. Do not return any text before or after the JSON object:
{
  "score": <number between 0 and 100>,
  "strengths": [<array of strings highlighting strong points in the answer>],
  "weaknesses": [<array of strings pointing out gaps, errors, or areas missing>],
  "suggestions": [<array of strings containing actionable advice to score higher next time>],
  "sampleAnswer": "<a high-quality, professional model answer to the question that would earn a score of 100>"
}`;

      const textResponse = await callOpenRouter(prompt, userApiKey);
      return parseCleanJson(textResponse);
    } catch (err) {
      console.error('❌ AIService analyzeAnswer error:', err.message);
      throw new Error(`Failed to analyze answer: ${err.message}`);
    }
  },

  /**
   * Generates overall feedback for the entire session.
   */
  generateOverallFeedback: async (questionsAndAnswers, track, difficulty, userApiKey) => {
    try {
      const sessionData = questionsAndAnswers.map((item, idx) => {
        return `Q${idx + 1}: ${item.questionText}\nCandidate Answer: ${item.answerText}\nScore Given: ${item.feedback?.score || 'N/A'}`;
      }).join('\n\n');

      const prompt = `Analyze the following mock interview transcript for a ${difficulty}-level ${track} role:
${sessionData}

Provide a comprehensive review. Return your feedback strictly in this JSON format. Do not return any other text:
{
  "score": <overall aggregate score, out of 100>,
  "summary": "<a paragraph summarizing overall performance, strengths, and areas of growth>",
  "technicalSkills": <overall score for accuracy and technical precision (1-100)>,
  "communication": <overall score for expression clarity, structural outline, and speed (1-100)>,
  "knowledge": <overall score for depth of explanation and concepts (1-100)>,
  "confidence": <overall score for certainty and directness of response (1-100)>
}`;

      const textResponse = await callOpenRouter(prompt, userApiKey);
      return parseCleanJson(textResponse);
    } catch (err) {
      console.error('❌ AIService generateOverallFeedback error:', err.message);
      throw new Error(`Failed to generate overall feedback: ${err.message}`);
    }
  },

  /**
   * Generates a personalized learning roadmap.
   */
  generateRoadmap: async (targetRole, experienceLevel, userApiKey) => {
    try {
      const prompt = `Generate a structured, personalized learning path/roadmap to prepare a candidate for a "${experienceLevel}" interview as a "${targetRole}". 
Provide your response strictly in the following JSON format. Do not return any markdown headers, annotations, or HTML wrapper:
{
  "role": "${targetRole}",
  "modules": [
    {
      "id": "mod_1",
      "title": "<title of module>",
      "description": "<detailed guidance on what tools, architectures, and algorithms to practice>",
      "resources": ["<name of book, document, website link, or topic to research>", ...],
      "exercises": ["<detailed coding exercise, project, or setup to build>", ...]
    },
    ... (generate exactly 4 modules sequentially ordered)
  ]
}`;

      const textResponse = await callOpenRouter(prompt, userApiKey);
      return parseCleanJson(textResponse);
    } catch (err) {
      console.error('❌ AIService generateRoadmap error:', err.message);
      throw new Error(`Failed to generate roadmap: ${err.message}`);
    }
  }
};

module.exports = AIService;

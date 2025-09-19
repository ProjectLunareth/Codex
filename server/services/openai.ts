import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface OracleConsultationRequest {
  query: string;
  context?: string;
  codexKnowledge?: string;
}

export interface OracleConsultationResponse {
  response: string;
  insights: string[];
  relatedConcepts: string[];
}

export async function consultOracle(request: OracleConsultationRequest): Promise<OracleConsultationResponse> {
  const { query, context, codexKnowledge } = request;

  const systemPrompt = `You are the Oracle of Hidden Knowing, a mystical entity with deep understanding of esoteric wisdom, spiritual traditions, and occult knowledge. You have access to "The Codex of Hidden Knowing" - a comprehensive collection of sacred teachings spanning Kabbalah, Hermeticism, Gnosticism, Alchemy, Eastern mysticism, and archetypal psychology.

Your responses should be:
- Profound and mystically insightful
- Grounded in authentic spiritual traditions
- Written in an elevated, poetic style befitting an oracle
- Practical yet transcendent
- Drawing connections between different wisdom traditions

When referencing the Codex, speak as if you have intimate knowledge of its teachings. Use mystical language and symbolism while remaining accessible and genuinely helpful.

Response format should be JSON with:
{
  "response": "main mystical response to the query",
  "insights": ["key insight 1", "key insight 2", "key insight 3"],
  "relatedConcepts": ["concept 1", "concept 2", "concept 3"]
}`;

  const userPrompt = `Query: "${query}"

${context ? `Context: ${context}` : ''}

${codexKnowledge ? `Relevant Codex Knowledge: ${codexKnowledge}` : ''}

Provide mystical wisdom and guidance for this inquiry, drawing upon the vast teachings of The Codex of Hidden Knowing and the perennial wisdom traditions.`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      response: result.response || "The Oracle contemplates in silence...",
      insights: result.insights || [],
      relatedConcepts: result.relatedConcepts || []
    };
  } catch (error) {
    console.error("Oracle consultation failed:", error);
    throw new Error("The Oracle is currently in deep meditation. Please try again later.");
  }
}

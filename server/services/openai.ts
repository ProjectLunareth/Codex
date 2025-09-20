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

export interface SigilGenerationRequest {
  intention: string;
  style?: string;
  symbolism?: string;
  energyType?: string;
}

export interface SigilGenerationResponse {
  imageUrl: string;
  description: string;
  symbolicMeaning: string;
  usageGuidance: string[];
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

export async function generateMysticalSigil(request: SigilGenerationRequest): Promise<SigilGenerationResponse> {
  const { intention, style = "traditional", symbolism = "hermetic", energyType = "balanced" } = request;

  // Create a detailed prompt for mystical sigil generation
  const sigilPrompt = `Create a mystical sigil representing the intention: "${intention}". 

Style: ${style} occult art
Symbolism: ${symbolism} tradition  
Energy: ${energyType} vibration

The sigil should be:
- Geometrically precise and symbolically meaningful
- Incorporating sacred geometry, mystical symbols, and esoteric elements
- Black ink on white/parchment background
- Centered composition with clear, bold lines
- Suitable for ritual use and meditation
- Combining traditional sigil creation methods with mystical aesthetics
- Include elements like circles, triangles, Hebrew letters, alchemical symbols, planetary symbols, or runic forms as appropriate
- Clean, high-contrast design that would work well for actual magical practice

The design should evoke: ancient wisdom, spiritual power, sacred geometry, mystical tradition, and focused intention.`;

  try {
    // Generate the sigil image
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: sigilPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error("Failed to generate sigil image");
    }
    
    const imageUrl = imageResponse.data[0].url;

    // Generate mystical interpretation and guidance
    const interpretationPrompt = `You are a master of sigil magic and mystical symbolism. A sigil has been created for the intention: "${intention}".

Provide a mystical interpretation and guidance in JSON format:
{
  "description": "detailed description of the sigil's visual elements and their significance",
  "symbolicMeaning": "deep mystical meaning and symbolic interpretation of the sigil",
  "usageGuidance": ["practical guidance 1", "practical guidance 2", "practical guidance 3", "practical guidance 4"]
}

The guidance should include information about activation, charging, meditation with the sigil, and practical magical use.`;

    const interpretationResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a master sigil magician and occult scholar with deep knowledge of practical magic and symbolic systems." },
        { role: "user", content: interpretationPrompt }
      ],
      response_format: { type: "json_object" },
    });

    const interpretation = JSON.parse(interpretationResponse.choices[0].message.content || '{}');

    return {
      imageUrl: imageUrl || "",
      description: interpretation.description || "A powerful mystical sigil crafted for your intention.",
      symbolicMeaning: interpretation.symbolicMeaning || "This sigil embodies the focused energy of your intention, ready to manifest your desired outcome.",
      usageGuidance: interpretation.usageGuidance || [
        "Meditate on the sigil while focusing on your intention",
        "Trace the sigil with your finger to activate its energy",
        "Place the sigil on your altar or sacred space",
        "Burn the sigil to release its energy into the universe"
      ]
    };

  } catch (error) {
    console.error("Sigil generation failed:", error);
    throw new Error("The mystical energies are currently unstable. Please try again later.");
  }
}

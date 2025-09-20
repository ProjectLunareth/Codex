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

export interface SonicEchoRequest {
  text: string;
  voice?: string;
  style?: string;
  title?: string;
  sourceType?: string;
  sourceId?: string;
}

export interface SonicEchoResponse {
  audioBuffer: Buffer;
  duration?: number;
}

// Generate sonic echo using OpenAI TTS
export async function generateSonicEcho(request: SonicEchoRequest): Promise<SonicEchoResponse> {
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }

  try {
    // Map user-friendly voice names to OpenAI voice options
    const voiceMap: Record<string, string> = {
      'mystical': 'onyx',
      'ethereal': 'nova', 
      'ancient': 'echo',
      'whisper': 'shimmer',
      'commanding': 'alloy',
      'sage': 'fable',
      'default': 'onyx'
    };

    const selectedVoice = voiceMap[request.voice || 'mystical'] || 'onyx';

    // Enhance text with mystical style instructions if specified
    let enhancedText = request.text;
    if (request.style) {
      const stylePrompts: Record<string, string> = {
        'ceremonial': '(speaking in a slow, ceremonial tone with reverence)',
        'incantation': '(chanting with mystical rhythm and power)',
        'whispered': '(speaking in hushed, secretive tones)',
        'prophetic': '(speaking with ancient wisdom and gravitas)',
        'meditative': '(speaking with calm, peaceful cadence)',
        'dramatic': '(speaking with theatrical intensity)'
      };
      
      const stylePrompt = stylePrompts[request.style];
      if (stylePrompt) {
        enhancedText = `${stylePrompt} ${request.text}`;
      }
    }

    // Use TTS-1-HD for higher quality mystical audio
    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: selectedVoice as any,
      input: enhancedText,
      response_format: "mp3",
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    // Audio duration estimation (rough calculation based on text length and speech rate)
    const estimatedDuration = Math.ceil(enhancedText.length / 14); // ~14 chars per second average speech rate
    
    return { 
      audioBuffer, 
      duration: estimatedDuration 
    };
  } catch (error) {
    console.error("Sonic echo generation error:", error);
    throw new Error(`Sonic echo generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

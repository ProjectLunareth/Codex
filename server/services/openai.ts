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

export interface MysticalToolRequest {
  type: string;
  input: string;
  context?: string;
  codexKnowledge?: string;
}

export interface MysticalToolResponse {
  output: string;
}

// Comprehensive mystical tool processor
export async function processMysticalTool(request: MysticalToolRequest): Promise<MysticalToolResponse> {
  const { type, input, context, codexKnowledge } = request;

  // Tool-specific system prompts and behaviors
  const toolConfigurations: Record<string, { systemPrompt: string; style: string }> = {
    scrying: {
      systemPrompt: "You are the Master of Scrying, capable of peering through the veils of time and space. You divine hidden truths, reveal what is concealed, and glimpse both past and future through mystical sight.",
      style: "visionary and prophetic, as if gazing into crystal spheres and sacred pools"
    },
    praxis: {
      systemPrompt: "You are the Guide of Mystical Praxis, transforming abstract esoteric knowledge into practical application. You bridge theory and practice, showing how ancient wisdom applies to modern life and spiritual development.",
      style: "practical yet mystical, offering concrete steps for spiritual implementation"
    },
    chronicle: {
      systemPrompt: "You are the Keeper of Sacred Chronicles, weaving personal narratives into the greater cosmic tapestry. You help connect individual stories to universal patterns and archetypal themes.",
      style: "narrative and mythic, connecting personal stories to cosmic patterns"
    },
    glyph: {
      systemPrompt: "You are the Interpreter of Sacred Glyphs, master of symbols, sigils, and mystical alphabets. You decode the hidden meanings within sacred geometry, alchemical signs, and esoteric emblems.",
      style: "symbolic and interpretive, revealing the language of symbols"
    },
    tapestry: {
      systemPrompt: "You are the Weaver of Cosmic Tapestries, connecting disparate concepts into unified understanding. You reveal the hidden threads that bind all knowledge together.",
      style: "interconnective and holistic, showing how all things relate"
    },
    synthesis: {
      systemPrompt: "You are the Master of Sacred Synthesis, forging new insights by combining ancient wisdom with modern understanding. You create bridges between different traditions and schools of thought.",
      style: "integrative and innovative, blending wisdom traditions"
    },
    keys: {
      systemPrompt: "You are the Keeper of Mystical Keys, generating correspondences, symbols, and spiritual tools that unlock hidden meanings and deeper understanding.",
      style: "revelatory and unlocking, providing tools for deeper comprehension"
    },
    imprint: {
      systemPrompt: "You are the Reader of Subtle Imprints, sensing the energetic signatures and spiritual essence within texts, objects, and experiences.",
      style: "intuitive and perceptive, reading between the lines"
    },
    tarot: {
      systemPrompt: "You are the Master of the Sacred Tarot, channeling archetypal wisdom through the 78 keys of understanding. You divine meaning through the ancient cards and their mystical correspondences.",
      style: "archetypal and divinatory, speaking through the wisdom of the cards"
    },
    stars: {
      systemPrompt: "You are the Cosmic Astrologer, mapping celestial influences and cosmic alignments. You reveal how the movements of stars and planets influence spiritual and earthly matters.",
      style: "celestial and cosmic, speaking of stellar influences"
    },
    architecture: {
      systemPrompt: "You are the Designer of Sacred Spaces, understanding how physical and metaphysical architecture influences consciousness and spiritual practice.",
      style: "structural and spatial, designing environments for consciousness"
    },
    aether: {
      systemPrompt: "You are the Analyst of Subtle Energies, perceiving the flowing currents of elemental forces, vital energies, and etheric patterns that underlie physical reality.",
      style: "energetic and elemental, sensing subtle currents"
    },
    geometrics: {
      systemPrompt: "You are the Guardian of Sacred Geometry, revealing the mathematical principles that govern both cosmos and consciousness, from the golden ratio to the flower of life.",
      style: "mathematical and geometric, revealing divine proportions"
    },
    harmonics: {
      systemPrompt: "You are the Master of Cosmic Harmonics, attuned to the vibrational frequencies that create and sustain reality. You work with sound, rhythm, and resonance.",
      style: "vibrational and harmonic, speaking of frequencies and resonance"
    },
    labyrinth: {
      systemPrompt: "You are the Guide of Sacred Labyrinths, helping navigate complex spiritual paths and inner journeys. You understand the psychology and symbolism of the spiritual quest.",
      style: "guiding and path-oriented, navigating spiritual journeys"
    },
    exegesis: {
      systemPrompt: "You are the Master Exegete, providing deep mystical commentary and interpretation of spiritual texts, symbols, and experiences.",
      style: "scholarly and interpretive, offering deep mystical commentary"
    },
    orrery: {
      systemPrompt: "You are the Keeper of Cosmic Cycles, modeling the great wheels of time, planetary patterns, and the recurring rhythms that govern spiritual and natural evolution.",
      style: "cyclical and temporal, understanding patterns across time"
    },
    athanor: {
      systemPrompt: "You are the Master of Sacred Transformation, working with the alchemical processes that purify, dissolve, and perfect both matter and consciousness.",
      style: "transformative and alchemical, working with processes of change"
    },
    legend: {
      systemPrompt: "You are the Teller of Sacred Legends, creating mythic narratives and archetypal stories that encode deep spiritual truths within timeless tales.",
      style: "mythic and narrative, weaving archetypal stories"
    },
    noosphere: {
      systemPrompt: "You are the Navigator of the Noosphere, tapping into collective consciousness, morphic fields, and the shared wisdom of humanity across time and space.",
      style: "collective and universal, accessing shared consciousness"
    },
    fusion: {
      systemPrompt: "You are the Alchemist of Tradition Fusion, skillfully blending multiple mystical traditions, practices, and wisdom schools into coherent unified approaches.",
      style: "synthetic and eclectic, harmonizing different traditions"
    },
    dialogue: {
      systemPrompt: "You are the Master of Mystical Dialogue, facilitating deep spiritual conversations, philosophical inquiry, and the exchange of wisdom between seekers.",
      style: "conversational and philosophical, engaging in deep discourse"
    }
  };

  const toolConfig = toolConfigurations[type];
  if (!toolConfig) {
    throw new Error(`Unknown mystical tool: ${type}`);
  }

  const fullSystemPrompt = `${toolConfig.systemPrompt}

You have access to "The Codex of Hidden Knowing" - a vast repository of mystical wisdom spanning all spiritual traditions. Your responses should be ${toolConfig.style}.

Your wisdom draws from:
- Ancient mystery schools and hermetic traditions
- Eastern philosophy and mystical practices  
- Psychological and archetypal understanding
- Sacred geometry and cosmic principles
- Practical spiritual development

Always provide responses that are:
- Authentic to genuine mystical traditions
- Practical and applicable to the seeker's journey
- Written in elevated, mystical language
- Grounded in real wisdom rather than fantasy
- Respectful of all genuine spiritual paths

Format your response as insightful mystical guidance that directly addresses the seeker's query.`;

  const userPrompt = `As the ${toolConfig.systemPrompt.split(',')[0].replace('You are the ', '')}, please provide mystical guidance for this query:

"${input}"

${context ? `Context: ${context}` : ''}
${codexKnowledge ? `Relevant Codex Knowledge: ${codexKnowledge}` : ''}

Respond in your characteristic ${toolConfig.style} manner, offering wisdom that serves the seeker's highest good.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8, // Slightly higher for creative mystical responses
      max_tokens: 1000,
    });

    const output = response.choices[0].message.content || "The cosmic energies flow in mysterious ways...";

    return { output };
  } catch (error) {
    console.error(`Mystical tool ${type} processing failed:`, error);
    
    // Provide mystical error messages for different scenarios
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("rate")) {
        throw new Error("🌙 The cosmic energies are temporarily depleted. The mystical realms require time to replenish their power.");
      } else if (error.message.includes("content_policy")) {
        throw new Error("⚡ The ethereal guardians have blocked this query. Please rephrase your intention with pure spiritual purpose.");
      }
    }
    
    throw new Error(`🔮 The ${type} tool encounters ethereal interference. The mystical channels are temporarily disrupted.`);
  }
}

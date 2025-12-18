
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TrendingTopic, GeneratedBlog } from "../types";

const API_KEY = process.env.API_KEY || '';

/**
 * Fetches the absolute latest trending topics using Google Search grounding.
 * Strictly filters out old content to ensure only the most recent (last 24-48h) trends appear.
 */
export const getTrendingTopics = async (category: string = 'General', keyword?: string): Promise<TrendingTopic[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let searchContext = `the category: "${category}"`;
  if (keyword && keyword.trim() !== '') {
    searchContext = `the specific keyword: "${keyword}" (within the ${category} space)`;
  }

  const prompt = `CRITICAL: Today is ${currentDate}. 
  Act as a real-time news analyst. Using Google Search, identify exactly 20 of the most viral, surging, and LATEST trending topics for today related to ${searchContext}.
  
  STRICT RULES:
  1. IGNORE any results from 2024 or earlier. Only 2025 topics are allowed.
  2. TARGET SOURCES: Prioritize finding trends reported on or discussed in: 9to5google.com, electrek.co, 9to5mac.com, and english.patrikatimes.in, alongside major platforms like Reddit, Twitter, and Google Trends.
  3. Topics must be "Breaking News," "Fresh Product Launches," or "Viral Social Media Trends" from the last 48 hours.
  4. Analyze each for SEO potential.
  
  Return the list in the specified JSON format.
  For "source", strictly use one of: 'Google', 'Reddit', 'Twitter', 'Youtube', 'News', '9to5google.com', 'electrek.co', '9to5mac.com', 'english.patrikatimes.in'.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            source: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            intent: { type: Type.STRING },
            searchVolume: { type: Type.STRING },
            category: { type: Type.STRING },
            trendingSince: { type: Type.STRING },
          },
          required: ["id", "title", "source", "difficulty", "intent", "searchVolume", "category", "trendingSince"]
        }
      }
    }
  });

  try {
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (e) {
    console.error("Error parsing trends response", e);
    return [];
  }
};

/**
 * Generates human-like, SEO-optimized blog content for a specific topic.
 */
export const generateBlogContent = async (topic: string): Promise<GeneratedBlog> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `You are an expert human blogger and SEO specialist.
  STYLE GUIDE:
  - Language: Simple, conversational, everyday English. Grade 6-8 reading level.
  - Tone: Engaging, helpful, and direct.
  - Structure: Short paragraphs (2-3 sentences max). Clear H2/H3 headers.
  - NO AI WORDS: Avoid "delve," "moreover," "in conclusion," "comprehensive," "essential," "unleash," "navigate."
  - Human Touch: Start with a personal-feeling hook.
  - SEO: Optimize for natural search intent.
  - Formatting: Use markdown for headers and lists.`;

  const prompt = `Topic: "${topic}"
  Write a high-quality blog post. 
  Return a JSON object containing:
  - title: Catchy, emotion-neutral SEO title.
  - content: Full markdown content body (minimum 600 words).
  - metaTitle: 50-60 characters SEO title.
  - metaDescription: 150-160 characters summary.
  - slug: URL-friendly version of the title.
  - schema: valid Article JSON-LD schema.
  - metrics: Object with seoScore, keywordScore, readabilityScore, aiScore (0-100).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          metaTitle: { type: Type.STRING },
          metaDescription: { type: Type.STRING },
          slug: { type: Type.STRING },
          schema: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              seoScore: { type: Type.NUMBER },
              keywordScore: { type: Type.NUMBER },
              readabilityScore: { type: Type.NUMBER },
              aiScore: { type: Type.NUMBER },
            }
          }
        },
        required: ["title", "content", "metaTitle", "metaDescription", "slug", "schema", "metrics"]
      }
    }
  });

  const blogData = JSON.parse(response.text || "{}");
  
  const images: string[] = [];
  const imagePrompts = [
    `High resolution realistic lifestyle photography related to ${topic}. Natural lighting, blog header style. No text.`,
    `Close-up realistic detail shot related to ${topic}. Cinematic lighting, no text.`
  ];

  for (const p of imagePrompts) {
    const imgResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: p }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    
    const part = imgResp.candidates[0].content.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      images.push(`data:image/png;base64,${part.inlineData.data}`);
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    ...blogData,
    images,
    seoData: {
      metaTitle: blogData.metaTitle,
      metaDescription: blogData.metaDescription,
      slug: blogData.slug,
      schema: blogData.schema,
    }
  };
};

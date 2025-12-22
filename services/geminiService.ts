
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TrendingTopic, GeneratedBlog, BlogStyle, BlogImage } from "../types";

// Always initialize GoogleGenAI with the apiKey in a named parameter using process.env.API_KEY
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTrendingTopics = async (category: string = 'General', keyword?: string): Promise<TrendingTopic[]> => {
  const ai = getAi();
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

  const prompt = `CRITICAL SYSTEM INSTRUCTION: Today is ${currentDate}. 
  Act as a real-time news analyst. Using Google Search grounding, identify AT LEAST 30 of the most viral and LATEST trending topics for today related to ${searchContext}.
  
  STRICT URL SELECTION RULES:
  1. For every topic found, check the "groundingChunks" and metadata in your search results for a direct article link (URI).
  2. If a specific article URI is found for that topic, you MUST use that exact URI as the "sourceUrl".
  3. PREFERENCE: A direct link to the article (e.g., on 9to5google.com or theverge.com) is HIGHLY PREFERRED over a search link.
  
  Return the list in the specified JSON format. Only include news from 2025.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
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
            sourceUrl: { type: Type.STRING },
          },
          required: ["id", "title", "source", "difficulty", "intent", "searchVolume", "category", "trendingSince", "sourceUrl"]
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

export const generateBlogWithStyle = async (topic: string, style: BlogStyle): Promise<GeneratedBlog> => {
  const ai = getAi();
  
  const styleInstructions: Record<BlogStyle, string> = {
    'News': 'Write as a factual, breaking news report. Objective tone.',
    'How-to': 'Write as a step-by-step tutorial. Practical and instructional.',
    'Opinion': 'Write as an editorial or opinion piece. Persuasive and personal.',
    'Listicle': 'Write as a "Top X" list. Skimmable with numbered headers.',
    'Professional': 'Write with a formal, authoritative, corporate tone.',
    'Conversational': 'Write like a friend talking to a friend. Casual and relatable.',
    'Storytelling': 'Start with a narrative hook. Use anecdotes.',
    'Technical': 'Deep dive into specifications and advanced mechanics.'
  };

  const systemInstruction = `You are an expert human blogger and SEO specialist.
  STYLE: ${styleInstructions[style]}
  
  STRICT LENGTH REQUIREMENT:
  - The article MUST be between 420 and 550 words long. 
  
  STRICT AUTHENTICITY & MULTI-SOURCE REQUIREMENT:
  - You MUST use Google Search grounding to find real facts.
  - CRITICAL: Do NOT rely on a single source or article. 
  - You MUST synthesize information from AT LEAST 3 to 5 distinct web references to provide a comprehensive and verified perspective.
  - Cross-check technical specs, dates, and quotes across multiple sources to ensure 100% accuracy.
  
  STRICT CONTENT STRUCTURE:
  1. H1: Catchy Title.
  2. Intro: Short punchy paragraph.
  3. H2: Main Analysis (Approx 150 words).
  4. H2: Supporting Context/Features (Approx 150 words).
  5. H3: Specific Deep Dive Detail.
  6. Bullet points.
  7. Conclusion: Final verdict (Clearly labeled).

  WRITING RULES:
  - Language: Simple English. Grade 6-8 reading level.
  - No AI words: Avoid "delve," "moreover," "unleash," "comprehensive."
  - Human Touch: High burstiness, varying sentence lengths.
  - Formatting: Valid Markdown.`;

  const prompt = `Topic: "${topic}"
  Generate a high-quality blog post (Target: 450 words) in the ${style} style. 
  Base the content on a synthesis of AT LEAST 3-5 real web sources discovered via search.
  Return JSON: title, content (markdown), metaTitle, metaDescription, slug, schema, metrics.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
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
              humanScore: { type: Type.NUMBER },
            },
            required: ["seoScore", "keywordScore", "readabilityScore", "aiScore", "humanScore"]
          }
        },
        required: ["title", "content", "metaTitle", "metaDescription", "slug", "schema", "metrics"]
      }
    }
  });

  const blogData = JSON.parse(response.text || "{}");
  
  // Extract ALL unique references from grounding metadata to show multi-source authenticity
  const references: string[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && !references.includes(chunk.web.uri)) {
        references.push(chunk.web.uri);
      }
    });
  }
  
  const images: BlogImage[] = [];
  const imagePrompts = [`Realistic photography of ${topic}`, `Detail shot of ${topic}`];
  
  for (const p of imagePrompts) {
    try {
      const imgResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: p }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      const part = imgResp.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        images.push({ url: `data:image/png;base64,${part.inlineData.data}`, isAiGenerated: true });
      }
    } catch (e) {
      console.error("Image generation failed", e);
    }
  }

  while (images.length < 2) {
    images.push({ url: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000`, isAiGenerated: false });
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    ...blogData,
    style,
    images,
    references,
    seoData: {
      metaTitle: blogData.metaTitle,
      metaDescription: blogData.metaDescription,
      slug: blogData.slug,
      schema: blogData.schema,
    }
  };
};

export const refineBlogWithPrompt = async (currentBlog: GeneratedBlog, userInstruction: string): Promise<GeneratedBlog> => {
  const ai = getAi();
  
  const prompt = `Act as an expert editor. I have an existing blog post about "${currentBlog.title}". 
  The user wants to refine it with the following instruction: "${userInstruction}".
  
  STRICT RULES:
  1. Maintain the existing style and word count (Target: 450-550 words).
  2. Incorporate the new information or change requested naturally.
  3. Update the metrics based on the new content.
  4. If the instruction requires new facts, use Google Search grounding.

  Return the updated blog data in the exact JSON format.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      { text: `Current Title: ${currentBlog.title}` },
      { text: `Current Content: ${currentBlog.content}` },
      { text: `User Instruction: ${userInstruction}` }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          metaTitle: { type: Type.STRING },
          metaDescription: { type: Type.STRING },
          slug: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              seoScore: { type: Type.NUMBER },
              keywordScore: { type: Type.NUMBER },
              readabilityScore: { type: Type.NUMBER },
              aiScore: { type: Type.NUMBER },
              humanScore: { type: Type.NUMBER },
            },
            required: ["seoScore", "keywordScore", "readabilityScore", "aiScore", "humanScore"]
          }
        },
        required: ["title", "content", "metaTitle", "metaDescription", "slug", "metrics"]
      }
    }
  });

  const updatedData = JSON.parse(response.text || "{}");
  
  const references = [...currentBlog.references];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && !references.includes(chunk.web.uri)) {
        references.push(chunk.web.uri);
      }
    });
  }

  return {
    ...currentBlog,
    ...updatedData,
    references,
    seoData: {
      ...currentBlog.seoData,
      metaTitle: updatedData.metaTitle,
      metaDescription: updatedData.metaDescription,
      slug: updatedData.slug,
    }
  };
};

export const extendBlogWithTopic = async (currentBlog: GeneratedBlog, newTopic: string): Promise<GeneratedBlog> => {
  const ai = getAi();
  
  const prompt = `I have a blog about "${currentBlog.title}". Add a section about "${newTopic}".
  STRICT RULE: The final total article word count MUST NOT exceed 550 words.
  Integrate the new topic into the existing style. Return full updated markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          updatedContent: { type: Type.STRING },
          newMetrics: {
             type: Type.OBJECT,
             properties: {
               seoScore: { type: Type.NUMBER },
               keywordScore: { type: Type.NUMBER },
               readabilityScore: { type: Type.NUMBER },
               aiScore: { type: Type.NUMBER },
               humanScore: { type: Type.NUMBER },
             },
             required: ["seoScore", "keywordScore", "readabilityScore", "aiScore", "humanScore"]
          }
        },
        required: ["updatedContent", "newMetrics"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    ...currentBlog,
    content: data.updatedContent,
    metrics: data.newMetrics
  };
};

export const generateBlogVariations = async (topic: string): Promise<GeneratedBlog[]> => {
  const styles: BlogStyle[] = ['News', 'How-to', 'Opinion', 'Listicle'];
  return Promise.all(styles.map(style => generateBlogWithStyle(topic, style)));
};


import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TrendingTopic, GeneratedBlog } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getTrendingTopics = async (): Promise<TrendingTopic[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Analyze current global trends for late 2024 and 2025. 
  Generate a list of 10 trending, easily rankable, SEO-friendly topics across Tech, Gadgets, Health, and Finance.
  For each topic, provide source (Google, Reddit, etc.), search intent, and ranking difficulty.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
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
          },
          required: ["id", "title", "source", "difficulty", "intent", "searchVolume"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Error parsing trends", e);
    return [];
  }
};

export const generateBlogContent = async (topic: string): Promise<GeneratedBlog> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `You are a professional human blogger. 
  WRITING RULES:
  - 100% human-like tone.
  - Simple, everyday English.
  - NO advanced vocabulary like 'Furthermore', 'Moreover', 'In conclusion', 'Delve'.
  - Short paragraphs (2-3 lines max).
  - Use the specific style: "In today’s time, whenever a new [Subject] is [Action], the eyes of [Target Audience] are fixed on it."
  - Natural flow.
  - Optimized for SEO.
  - Return the content in structured JSON.`;

  const prompt = `Write a comprehensive, engaging blog post about: "${topic}". 
  Include:
  1. A catchy SEO Title
  2. A Meta Description
  3. A URL Slug
  4. The main content body
  5. JSON Article Schema
  6. Estimated metrics (SEO score, keyword score, readability, AI detection score - target low AI score)`;

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
  
  // Generate 2 images for the blog
  const imagePrompts = [
    `Realistic, blog-friendly high quality photo for the header of a blog about ${topic}. No text.`,
    `Realistic, lifestyle photo representing a key point in a blog about ${topic}. No text.`
  ];

  const images: string[] = [];
  for (const imgPrompt of imagePrompts) {
    const imgResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imgPrompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of imgResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        images.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    title: blogData.title,
    content: blogData.content,
    images: images,
    seoData: {
      metaTitle: blogData.metaTitle,
      metaDescription: blogData.metaDescription,
      slug: blogData.slug,
      schema: blogData.schema,
    },
    metrics: blogData.metrics
  };
};

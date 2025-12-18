
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TrendingTopic, GeneratedBlog } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getTrendingTopics = async (category: string = 'General'): Promise<TrendingTopic[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const prompt = `Today is ${currentDate}. Find the absolute LATEST, most fresh trending topics for today and this week in the category: "${category}". 
  Do NOT provide trends from 2024 or older unless they are peaking precisely today. 
  Focus on breaking news, recent product launches, viral discussions on X/Reddit, and surging search queries from the last 24-72 hours.
  
  Generate a list of 10 trending, easily rankable, SEO-friendly topics.
  For each topic, provide:
  - source (Google, Reddit, etc.)
  - search intent
  - ranking difficulty (Easy/Medium/Hard)
  - specific category
  - "trendingSince" (MUST be a date within the last 7 days from ${currentDate}).`;

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
    // Note: If using googleSearch, the response.text is still JSON because of responseMimeType
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

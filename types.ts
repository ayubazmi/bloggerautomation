
export interface TrendingTopic {
  id: string;
  title: string;
  source: 'Google' | 'Reddit' | 'Twitter' | 'Youtube' | 'News' | '9to5google.com' | 'electrek.co' | '9to5mac.com' | 'english.patrikatimes.in' | 'Google News' | 'NewsBytes' | 'The Verge';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  intent: string;
  searchVolume: string;
  category: string;
  trendingSince: string;
  sourceUrl: string;
}

export type BlogStyle = 'News' | 'How-to' | 'Opinion' | 'Listicle' | 'Professional' | 'Conversational' | 'Storytelling' | 'Technical';

export interface BlogImage {
  url: string;
  isAiGenerated: boolean;
}

export interface GeneratedBlog {
  id: string;
  title: string;
  content: string;
  style: BlogStyle;
  images: BlogImage[];
  seoData: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    schema: string;
  };
  metrics: {
    seoScore: number;
    keywordScore: number;
    readabilityScore: number;
    aiScore: number;
    humanScore: number;
  };
}

export interface SEOImprovement {
  type: 'keyword' | 'readability' | 'structure';
  suggestion: string;
}

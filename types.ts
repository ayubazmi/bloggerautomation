
export interface TrendingTopic {
  id: string;
  title: string;
  source: 'Google' | 'Reddit' | 'Twitter' | 'Youtube' | 'News' | '9to5google.com' | 'electrek.co' | '9to5mac.com' | 'english.patrikatimes.in';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  intent: string;
  searchVolume: string;
  category: string;
  trendingSince: string;
}

export interface GeneratedBlog {
  id: string;
  title: string;
  content: string;
  images: string[];
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
  };
}

export interface SEOImprovement {
  type: 'keyword' | 'readability' | 'structure';
  suggestion: string;
}

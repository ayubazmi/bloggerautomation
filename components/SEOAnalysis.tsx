
import React from 'react';

interface SEOAnalysisProps {
  metrics: {
    seoScore: number;
    keywordScore: number;
    readabilityScore: number;
    aiScore: number;
    humanScore: number;
  };
  seoData: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    schema: string;
  };
}

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({ metrics, seoData }) => {
  const getScoreColor = (score: number, inverse = false) => {
    if (inverse) {
      if (score < 20) return 'text-green-600';
      if (score < 50) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (score > 80) return 'text-green-600';
    if (score > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">SEO & Analytics</h3>
        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest">Live Optimization</span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <ScoreCard label="SEO Score" value={metrics.seoScore} color={getScoreColor(metrics.seoScore)} />
          <ScoreCard label="Keyword Density" value={metrics.keywordScore} color={getScoreColor(metrics.keywordScore)} />
          <ScoreCard label="Readability" value={metrics.readabilityScore} color={getScoreColor(metrics.readabilityScore)} />
          <ScoreCard label="AI Probability" value={metrics.aiScore} color={getScoreColor(metrics.aiScore, true)} sub="Target < 10%" />
          <ScoreCard label="Human-Likeness" value={metrics.humanScore} color={getScoreColor(metrics.humanScore)} sub="Target > 90%" />
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Meta Optimization
            </h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-blue-900">Slug:</span> {seoData.slug}</p>
              <p><span className="font-semibold text-blue-900">Meta Title:</span> {seoData.metaTitle}</p>
              <p className="text-blue-700 italic">"{seoData.metaDescription}"</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <SuggestionItem text="Paragraphs are short and mobile-friendly." success />
             <SuggestionItem text="Secondary keywords integrated naturally." success />
             <SuggestionItem text="Include alt text for generated images." />
             <SuggestionItem text="Add internal links to related posts." />
          </div>
        </div>
      </div>
    </div>
  );
};

const ScoreCard = ({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) => (
  <div className="text-center">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <div className={`text-3xl font-black ${color}`}>{value}%</div>
    {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
  </div>
);

const SuggestionItem = ({ text, success }: { text: string; success?: boolean }) => (
  <div className={`flex items-start gap-2 p-2 rounded-lg text-sm ${success ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
    <div className="mt-0.5">
      {success ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
      )}
    </div>
    <span>{text}</span>
  </div>
);

export default SEOAnalysis;

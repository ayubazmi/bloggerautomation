
import React, { useState } from 'react';
import { TrendingTopic } from '../types';

interface TrendingFeedProps {
  trends: TrendingTopic[];
  loading: boolean;
  onGenerate: (topic: string) => void;
  onRefresh: () => void;
}

const TrendingFeed: React.FC<TrendingFeedProps> = ({ trends, loading, onGenerate, onRefresh }) => {
  const [manualTopic, setManualTopic] = useState('');

  const difficultyColor = (d: string) => {
    switch(d.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Topics</h2>
          <p className="text-gray-500">Discover what people are searching for right now</p>
        </div>
        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh Trends"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Have a specific topic in mind?</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={manualTopic}
            onChange={(e) => setManualTopic(e.target.value)}
            placeholder="Enter your topic (e.g. iPhone 16 Pro Max review)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button 
            onClick={() => manualTopic && onGenerate(manualTopic)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-all"
          >
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-48 rounded-xl border border-gray-200 animate-pulse"></div>
          ))
        ) : (
          trends.map((trend) => (
            <div 
              key={trend.id} 
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group relative cursor-pointer"
              onClick={() => onGenerate(trend.title)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
                  {trend.source}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${difficultyColor(trend.difficulty)}`}>
                  {trend.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                {trend.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 italic">"{trend.intent}"</p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-medium">{trend.searchVolume} Searches</span>
                <button className="text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Generate Blog &rarr;
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrendingFeed;

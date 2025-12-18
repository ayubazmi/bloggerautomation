
import React, { useState } from 'react';
import { TrendingTopic } from '../types';

interface TrendingFeedProps {
  trends: TrendingTopic[];
  loading: boolean;
  onGenerate: (topic: string) => void;
  onRefresh: (category?: string) => void;
}

const CATEGORIES = ['General', 'Tech', 'Automobile', 'Health', 'Finance', 'Entertainment', 'Gadgets'];

const TrendingFeed: React.FC<TrendingFeedProps> = ({ trends, loading, onGenerate, onRefresh }) => {
  const [manualTopic, setManualTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');

  const difficultyColor = (d: string) => {
    switch(d.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    onRefresh(cat);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Topics</h2>
          <p className="text-gray-500 text-sm">Discover and rank for latest trends since they started</p>
        </div>
        <button 
          onClick={() => onRefresh(selectedCategory)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm self-start md:self-auto"
          disabled={loading}
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium">Refresh Trends</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Custom Topic Analysis</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={manualTopic}
            onChange={(e) => setManualTopic(e.target.value)}
            placeholder="Type any topic (e.g. Tesla Model 3 review 2025)"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-inner"
          />
          <button 
            disabled={!manualTopic}
            onClick={() => manualTopic && onGenerate(manualTopic)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-52 rounded-2xl border border-gray-200 animate-pulse"></div>
          ))
        ) : (
          trends.map((trend) => (
            <div 
              key={trend.id} 
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-400 hover:shadow-xl transition-all group relative cursor-pointer overflow-hidden flex flex-col"
              onClick={() => onGenerate(trend.title)}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-widest self-start">
                    {trend.source} • {trend.category}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[11px] font-medium">Trending since {trend.trendingSince}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-sm ${difficultyColor(trend.difficulty)}`}>
                  Difficulty: {trend.difficulty}
                </span>
              </div>

              {/* Card Body */}
              <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 leading-snug line-clamp-2">
                {trend.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6 italic leading-relaxed line-clamp-2">
                &ldquo;{trend.intent}&rdquo;
              </p>

              {/* Card Footer */}
              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                   <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                   </svg>
                   <span className="text-xs text-gray-700 font-bold">{trend.searchVolume} Searches</span>
                </div>
                <button className="text-indigo-600 text-sm font-black translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  Write Blog &rarr;
                </button>
              </div>
              
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrendingFeed;

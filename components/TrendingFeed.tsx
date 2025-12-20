
import React, { useState, useEffect } from 'react';
import { TrendingTopic } from '../types';

interface TrendingFeedProps {
  trends: TrendingTopic[];
  loading: boolean;
  onGenerate: (topic: string) => void;
  onRefresh: (category?: string, keyword?: string) => void;
}

const CATEGORIES = ['General', 'Tech', 'Automobile', 'Health', 'Finance', 'Entertainment', 'Gadgets', 'Travel'];

const TrendingFeed: React.FC<TrendingFeedProps> = ({ trends, loading, onGenerate, onRefresh }) => {
  const [manualTopic, setManualTopic] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [trends]);

  const difficultyColor = (d: string) => {
    const val = d.toLowerCase();
    if (val.includes('easy') || val.includes('low')) {
      return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    }
    if (val.includes('medium')) {
      return 'text-amber-700 bg-amber-100 border-amber-200';
    }
    if (val.includes('hard') || val.includes('high')) {
      return 'text-red-700 bg-red-100 border-red-200';
    }
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const getSourceStyle = (source: string) => {
    const s = source.toLowerCase();
    if (s === '9to5google.com') return 'text-blue-600 bg-blue-50 border-blue-100';
    if (s === 'electrek.co') return 'text-cyan-600 bg-cyan-50 border-cyan-100';
    if (s === '9to5mac.com') return 'text-gray-700 bg-gray-100 border-gray-200';
    if (s === 'english.patrikatimes.in') return 'text-rose-700 bg-rose-50 border-rose-100';
    if (s === 'the verge') return 'text-white bg-fuchsia-600 border-fuchsia-700 shadow-sm';
    if (s === 'google news') return 'text-blue-700 bg-blue-100 border-blue-200 font-black';
    if (s === 'newsbytes') return 'text-indigo-800 bg-indigo-50 border-indigo-100';
    if (s === 'reddit') return 'text-orange-600 bg-orange-50 border-orange-100';
    if (s === 'twitter') return 'text-sky-600 bg-sky-50 border-sky-100';
    return 'text-gray-400 bg-gray-50 border-gray-100';
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    onRefresh(cat, searchKeyword);
  };

  const handleSearchTrends = () => {
    onRefresh(selectedCategory, searchKeyword);
  };

  const handleManualGenerate = () => {
    if (manualTopic.trim()) {
      onGenerate(manualTopic);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Real-Time Trends</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            Grounding results using Google Search • <span className="text-indigo-600">Updated {lastUpdated}</span>
          </p>
        </div>
        
        <button 
          onClick={() => onRefresh(selectedCategory, searchKeyword)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-bold">Fetch Latest</span>
        </button>
      </div>

      {/* Main Search & Category Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchTrends()}
            placeholder="Search keyword trends (e.g. 'iPhone 16', 'ChatGPT')..."
            className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
        </div>
        
        <div className="h-px md:h-8 md:w-px bg-gray-100 mx-2"></div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="bg-transparent border-none text-sm font-bold text-gray-700 px-4 py-3 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <button 
          onClick={handleSearchTrends}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all active:scale-95 shadow-sm"
        >
          Update Feed
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedCategory === cat 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Write Tool */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
        <div className="relative bg-white p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Manual Content Creation</label>
            <input 
              type="text" 
              value={manualTopic}
              onChange={(e) => setManualTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualGenerate()}
              placeholder="Enter any topic to write about..."
              className="w-full border-none bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
          <button 
            disabled={!manualTopic.trim()}
            onClick={handleManualGenerate}
            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30"
          >
            Generate Blog
          </button>
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          Array(12).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-56 rounded-2xl border border-gray-100 animate-pulse overflow-hidden">
               <div className="h-2 bg-gray-50 w-full"></div>
               <div className="p-6 space-y-4">
                 <div className="h-4 bg-gray-50 rounded w-1/4"></div>
                 <div className="h-8 bg-gray-50 rounded w-3/4"></div>
                 <div className="h-4 bg-gray-50 rounded w-full"></div>
                 <div className="h-4 bg-gray-50 rounded w-1/2"></div>
               </div>
            </div>
          ))
        ) : trends.length > 0 ? (
          trends.map((trend) => (
            <div 
              key={trend.id} 
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col relative overflow-hidden"
              onClick={() => onGenerate(trend.title)}
            >
              {/* Diff & Source Labels */}
              <div className="flex justify-between items-center mb-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${difficultyColor(trend.difficulty)}`}>
                  Difficulty: {trend.difficulty}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border tracking-tighter transition-all ${getSourceStyle(trend.source)}`}>
                    {trend.source}
                  </span>
                  {trend.sourceUrl && (
                    <a 
                      href={trend.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
                      title="Read Original Article"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
                {trend.title}
              </h3>
              
              <p className="text-sm text-gray-500 line-clamp-2 italic mb-4">
                &ldquo;{trend.intent}&rdquo;
              </p>

              <div className="mt-auto space-y-3">
                 <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-1 text-indigo-600">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                      <span>{trend.searchVolume} Velocity</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{trend.trendingSince}</span>
                    </div>
                 </div>
                 
                 <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{trend.category}</span>
                    <span className="text-indigo-600 text-sm font-black flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      Write Blog <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                 </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-50 to-transparent -mr-8 -mt-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <h3 className="text-lg font-bold text-gray-900">No breaking trends found</h3>
             <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Try a broader keyword or a different category to see what's happening today.</p>
             <button 
               onClick={() => {setSearchKeyword(''); setSelectedCategory('General'); onRefresh('General', '');}}
               className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
             >
               Reset filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingFeed;

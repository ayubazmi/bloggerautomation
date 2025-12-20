
import React, { useState } from 'react';
import { GeneratedBlog, BlogImage } from '../types';

interface DiscoverPreviewProps {
  blog: GeneratedBlog;
}

const DiscoverPreview: React.FC<DiscoverPreviewProps> = ({ blog }) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Safety fallback for images
  const headerImage = blog.images?.[0]?.url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000';
  const midImage = blog.images?.[1]?.url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1000';
  const isHeaderAi = blog.images?.[0]?.isAiGenerated;
  const isMidAi = blog.images?.[1]?.isAiGenerated;

  const AiLabel = () => (
    <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[7px] font-black text-white uppercase tracking-widest border border-white/20">
      Representational Image (AI)
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full animate-fadeIn">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Content Preview</h2>
        <p className="text-gray-500 mt-1">Visualize how your content adapts across different surfaces</p>
        
        {/* Toggle Switch */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl mt-6 inline-flex border border-gray-200">
          <button 
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Mobile Discover
          </button>
          <button 
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Desktop Browser
          </button>
        </div>
      </div>

      {viewMode === 'mobile' ? (
        /* Mobile Discovery View */
        <div className="w-[375px] h-[700px] bg-white border-[10px] border-gray-900 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto discover-feed bg-gray-50 pt-10">
            <div className="px-4 py-2">
               <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6 active:scale-[0.98] transition-all relative">
                  <img src={headerImage} alt="Header" className="w-full h-48 object-cover" />
                  {isHeaderAi && <AiLabel />}
                  <div className="p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white">TS</div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">TrendSetter AI • 2h</span>
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 leading-tight">
                       {blog.title}
                     </h3>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h1 className="text-2xl font-black mb-4 leading-tight">{blog.title}</h1>
                  <div className="text-sm text-gray-600 space-y-4 font-serif leading-relaxed">
                    {blog.content.split('\n\n').slice(0, 3).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    <div className="relative">
                      <img src={midImage} className="w-full rounded-xl my-4" alt="Content" />
                      {isMidAi && <AiLabel />}
                    </div>
                     {blog.content.split('\n\n').slice(3).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="h-1.5 w-32 bg-gray-300 rounded-full mx-auto my-3 shrink-0"></div>
        </div>
      ) : (
        /* Desktop Browser View */
        <div className="w-full max-w-5xl h-[700px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500">
          {/* Browser Header */}
          <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-4">
            <div className="flex gap-1.5 ml-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-white border border-gray-300 rounded-lg py-1 px-4 flex items-center gap-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002-2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-xs text-gray-500 font-mono">https://yourblog.com/{blog.seoData.slug}</span>
            </div>
            <div className="w-10"></div> {/* Spacing */}
          </div>

          {/* Webpage Content */}
          <div className="flex-1 overflow-y-auto bg-white p-12">
            <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12">
              {/* Main Column */}
              <div className="flex-1">
                <nav className="mb-12 border-b border-gray-100 pb-4 flex justify-between items-center">
                  <span className="font-black text-xl text-indigo-600 tracking-tighter">TS. BLOG</span>
                  <div className="flex gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Tech</span>
                    <span>Lifestyle</span>
                    <span>Trends</span>
                  </div>
                </nav>

                <div className="space-y-8">
                  <header className="space-y-4">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded tracking-widest">Featured Post</span>
                    <h1 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">{blog.title}</h1>
                    <div className="flex items-center gap-3 py-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">A</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">TrendSetter AI</p>
                        <p className="text-xs text-gray-400">Published on May 15, 2025 • 8 min read</p>
                      </div>
                    </div>
                  </header>

                  <div className="relative group">
                    <img src={headerImage} className="w-full h-[400px] object-cover rounded-3xl shadow-lg" alt="Header" />
                    {isHeaderAi && <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 uppercase">Representational Image (AI)</div>}
                  </div>

                  <div className="text-lg text-gray-700 space-y-6 font-serif leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600">
                    {blog.content.split('\n\n').map((p, i) => (
                      <React.Fragment key={i}>
                        {i === 2 && (
                          <div className="relative group my-12">
                            <img src={midImage} className="w-full h-[350px] object-cover rounded-3xl shadow-lg" alt="Content" />
                            {isMidAi && <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 uppercase">Representational Image (AI)</div>}
                          </div>
                        )}
                        <p>{p}</p>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Sidebar Mock */}
              <aside className="hidden lg:block w-64 shrink-0 space-y-12">
                 <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Newsletter</h4>
                    <p className="text-sm text-gray-600 mb-4 font-bold">Get the latest trends directly in your inbox.</p>
                    <input type="email" placeholder="email@example.com" className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs mb-2 outline-none" />
                    <button className="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg">Subscribe</button>
                 </div>

                 <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Popular Posts</h4>
                    <div className="space-y-4">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="group cursor-pointer">
                            <div className="bg-gray-200 w-full h-24 rounded-xl mb-2 overflow-hidden">
                               <img src={`https://picsum.photos/300/200?random=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <p className="text-xs font-bold text-gray-900 leading-tight group-hover:text-indigo-600">The Future of AI Content Generation in 2025</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 pb-20">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center min-w-[160px] shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Discover Score</p>
          <p className="text-3xl font-black text-green-600">High</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center min-w-[160px] shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">CTR Est.</p>
          <p className="text-3xl font-black text-indigo-600">4.2%</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center min-w-[160px] shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bounce Est.</p>
          <p className="text-3xl font-black text-amber-500">22%</p>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPreview;


import React from 'react';
import { GeneratedBlog } from '../types';

interface DiscoverPreviewProps {
  blog: GeneratedBlog;
}

const DiscoverPreview: React.FC<DiscoverPreviewProps> = ({ blog }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Discover Preview</h2>
        <p className="text-gray-500">How your blog appears in Google Discover feeds</p>
      </div>

      <div className="w-[375px] h-[700px] bg-white border-[8px] border-gray-900 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto discover-feed bg-gray-50 pt-10">
          <div className="px-4 py-2">
             <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6 group active:scale-[0.98] transition-all">
                <img src={blog.images[0]} alt="Header" className="w-full h-48 object-cover" />
                <div className="p-4">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white">T</div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Your Blog Name • 2h</span>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 leading-tight">
                     {blog.title}
                   </h3>
                </div>
             </div>

             {/* Post Body Start */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-black mb-4 leading-tight">{blog.title}</h1>
                <div className="text-sm text-gray-600 space-y-4 font-serif leading-relaxed">
                  {blog.content.split('\n\n').slice(0, 3).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  <img src={blog.images[1]} className="w-full rounded-xl my-4" alt="Content" />
                   {blog.content.split('\n\n').slice(3, 6).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="h-1.5 w-32 bg-gray-300 rounded-full mx-auto my-3 shrink-0"></div>
      </div>

      <div className="mt-8 flex gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase">Discover Score</p>
          <p className="text-2xl font-black text-green-600">High</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase">CTR Est.</p>
          <p className="text-2xl font-black text-indigo-600">4.2%</p>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPreview;


import React, { useState } from 'react';
import { GeneratedBlog } from '../types';

interface BlogEditorProps {
  blog: GeneratedBlog;
  onUpdate: (updated: GeneratedBlog) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onUpdate }) => {
  const [activeSection, setActiveSection] = useState<'content' | 'settings'>('content');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...blog,
      content: e.target.value
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...blog,
      title: e.target.value
    });
  };

  const contentParagraphs = blog.content.split('\n\n');
  const midPoint = Math.ceil(contentParagraphs.length / 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveSection('content')}
          className={`px-6 py-4 font-bold text-sm ${activeSection === 'content' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Blog Content
        </button>
        <button 
          onClick={() => setActiveSection('settings')}
          className={`px-6 py-4 font-bold text-sm ${activeSection === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          SEO Settings
        </button>
      </div>

      <div className="p-8">
        {activeSection === 'content' ? (
          <div className="space-y-6">
            <input 
              type="text" 
              value={blog.title}
              onChange={handleTitleChange}
              className="w-full text-3xl font-black text-gray-900 outline-none border-b-2 border-transparent focus:border-indigo-100 transition-colors py-2"
              placeholder="Post Title"
            />

            <div className="relative group">
              <img 
                src={blog.images[0] || 'https://picsum.photos/1200/600'} 
                alt="Header" 
                className="w-full h-64 md:h-96 object-cover rounded-xl shadow-inner"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">Header Image</div>
            </div>

            <textarea 
              value={blog.content}
              onChange={handleTextChange}
              rows={25}
              className="w-full text-lg leading-relaxed text-gray-700 outline-none border-none resize-none bg-transparent font-serif"
              placeholder="Post content starts here..."
            />

            <div className="relative group mt-8">
              <img 
                src={blog.images[1] || 'https://picsum.photos/1200/601'} 
                alt="Mid-post" 
                className="w-full h-64 md:h-96 object-cover rounded-xl shadow-inner"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">Mid-Article Image</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Meta Title</label>
              <input 
                type="text" 
                value={blog.seoData.metaTitle}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Meta Description</label>
              <textarea 
                value={blog.seoData.metaDescription}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">URL Slug</label>
              <input 
                type="text" 
                value={blog.seoData.slug}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">JSON Schema Markup</label>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">
                {JSON.stringify(JSON.parse(blog.seoData.schema || '{}'), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;

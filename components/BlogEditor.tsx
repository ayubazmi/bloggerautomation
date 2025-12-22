
import React, { useState, useRef, useMemo } from 'react';
import { GeneratedBlog, BlogStyle, BlogImage } from '../types';
import { convertBlogToFullHtml } from '../services/bloggerService';

interface BlogEditorProps {
  blog: GeneratedBlog;
  onUpdate: (updated: GeneratedBlog) => void;
  onRewrite: (style: BlogStyle) => void;
  onRefine: (instruction: string) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onUpdate, onRewrite, onRefine }) => {
  const [activeSection, setActiveSection] = useState<'content' | 'settings' | 'references'>('content');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  
  const headerFileRef = useRef<HTMLInputElement>(null);
  const midFileRef = useRef<HTMLInputElement>(null);

  const wordCount = useMemo(() => {
    return blog.content.trim().split(/\s+/).length;
  }, [blog.content]);

  const handleCopyFullArticle = async () => {
    const htmlContent = convertBlogToFullHtml(blog);
    const plainText = `${blog.title}\n\n${blog.content}`;

    try {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      const data = [
        new ClipboardItem({
          ['text/html']: htmlBlob,
          ['text/plain']: textBlob,
        })
      ];

      await navigator.clipboard.write(data);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch (err) {
      console.warn("ClipboardItem failed, falling back to selection method", err);
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      try {
        document.execCommand('copy');
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2500);
      } catch (e) {
        alert("Clipboard error. Please try a different browser or the Direct API Post.");
      }
      
      selection?.removeAllRanges();
      document.body.removeChild(container);
    }
  };

  const handleManualUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImages = [...blog.images];
          newImages[index] = {
            url: event.target.result as string,
            isAiGenerated: false
          };
          onUpdate({ ...blog, images: newImages });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefineSubmit = () => {
    if (refinementPrompt.trim()) {
      onRefine(refinementPrompt);
      setRefinementPrompt('');
    }
  };

  const ImageBox = ({ image, index, label }: { image: BlogImage; index: number; label: string }) => {
    const fileRef = index === 0 ? headerFileRef : midFileRef;
    return (
      <div className="relative group overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
        <img src={image?.url} alt={label} className="w-full h-64 md:h-96 object-cover rounded-xl shadow-inner transition-transform duration-500 group-hover:scale-[1.02]" />
        {image?.isAiGenerated && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">✨ AI Generated</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => handleManualUpload(index, e)} />
          <button onClick={() => fileRef.current?.click()} className="bg-white text-gray-900 px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl">
            Upload Original
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-200 justify-between items-center pr-4">
        <div className="flex">
          <button onClick={() => setActiveSection('content')} className={`px-6 py-4 font-bold text-sm ${activeSection === 'content' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Content</button>
          <button onClick={() => setActiveSection('settings')} className={`px-6 py-4 font-bold text-sm ${activeSection === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>SEO Settings</button>
          <button onClick={() => setActiveSection('references')} className={`px-6 py-4 font-bold text-sm ${activeSection === 'references' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Authenticity</button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyFullArticle}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${copyStatus === 'copied' ? 'bg-green-600 border-green-700 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            {copyStatus === 'copied' ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Article Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy for Blogger
              </>
            )}
          </button>

          <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${wordCount >= 420 && wordCount <= 550 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {wordCount} Words
          </div>
        </div>
      </div>

      <div className="p-8">
        {activeSection === 'content' && (
          <div className="space-y-6">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center mb-4">
              <div className="flex-1 w-full">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Refine Content with AI</p>
                <input 
                  type="text" 
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                  placeholder="e.g. 'Add more detail about pricing', 'Make the tone more professional'..."
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <button 
                disabled={!refinementPrompt.trim()}
                onClick={handleRefineSubmit}
                className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30"
              >
                Refine Post
              </button>
            </div>

            <input type="text" value={blog.title} onChange={(e) => onUpdate({...blog, title: e.target.value})} className="w-full text-3xl font-black text-gray-900 outline-none border-b-2 border-transparent focus:border-indigo-100 transition-colors py-2" placeholder="Post Title" />
            <ImageBox image={blog.images?.[0]} index={0} label="Header Image" />
            <textarea value={blog.content} onChange={(e) => onUpdate({...blog, content: e.target.value})} rows={25} className="w-full text-lg leading-relaxed text-gray-700 outline-none border-none resize-none bg-transparent font-serif" placeholder="Start writing..." />
            <ImageBox image={blog.images?.[1]} index={1} label="Mid Image" />
          </div>
        )}
        
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Slug (URL)</label>
              <p className="text-sm font-mono text-gray-600">{blog.seoData.slug}</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Meta Description</label>
              <textarea value={blog.seoData.metaDescription} readOnly className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-white text-sm text-gray-600 outline-none" rows={4} />
            </div>
          </div>
        )}

        {activeSection === 'references' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-lg font-black text-indigo-900 mb-2">Sources & References</h3>
              <p className="text-sm text-indigo-700 mb-6">These are the live web sources verified and used to generate this article, ensuring factual accuracy and authenticity.</p>
              
              <div className="space-y-3">
                {blog.references && blog.references.length > 0 ? (
                  blog.references.map((ref, idx) => (
                    <a 
                      key={idx} 
                      href={ref} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-indigo-200 hover:border-indigo-500 hover:shadow-md transition-all group"
                    >
                      <div className="bg-indigo-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Verified Source</p>
                        <p className="text-sm text-gray-600 truncate font-mono">{ref}</p>
                      </div>
                      <svg className="w-4 h-4 text-indigo-300 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-indigo-200">
                    <p className="text-sm text-gray-400 italic">No direct web references found for this variation. Authenticity verified through general knowledge base.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;

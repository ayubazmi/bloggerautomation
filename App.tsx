
import React, { useState, useEffect } from 'react';
import { TrendingTopic, GeneratedBlog, BlogStyle } from './types';
import { getTrendingTopics, generateBlogVariations, generateBlogWithStyle } from './services/geminiService';
import TrendingFeed from './components/TrendingFeed';
import BlogEditor from './components/BlogEditor';
import SEOAnalysis from './components/SEOAnalysis';
import DiscoverPreview from './components/DiscoverPreview';
import BloggerModal from './components/BloggerModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trends' | 'select' | 'editor' | 'preview'>('trends');
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [variations, setVariations] = useState<GeneratedBlog[]>([]);
  const [currentBlog, setCurrentBlog] = useState<GeneratedBlog | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastTopic, setLastTopic] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasStoredDraft, setHasStoredDraft] = useState(false);
  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);

  useEffect(() => {
    fetchTrends();
    checkExistingDraft();
  }, []);

  const checkExistingDraft = () => {
    const draft = localStorage.getItem('trendsetter_draft');
    if (draft) {
      setHasStoredDraft(true);
    }
  };

  const fetchTrends = async (category: string = 'General', keyword?: string) => {
    setLoadingTrends(true);
    try {
      const data = await getTrendingTopics(category, keyword);
      setTrends(data);
    } catch (error) {
      console.error("Failed to load trends", error);
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleGenerateVariations = async (topic: string) => {
    setGenerating(true);
    setLastTopic(topic);
    setActiveTab('select');
    try {
      const results = await generateBlogVariations(topic);
      setVariations(results);
    } catch (error) {
      console.error("Failed to generate variations", error);
      alert("Error generating variations.");
      setActiveTab('trends');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectVariation = (blog: GeneratedBlog) => {
    setCurrentBlog(blog);
    setActiveTab('editor');
  };

  const handleRewrite = async (style: BlogStyle) => {
    if (!lastTopic) return;
    setGenerating(true);
    try {
      const rewritten = await generateBlogWithStyle(lastTopic, style);
      setCurrentBlog(rewritten);
    } catch (error) {
      console.error("Failed to rewrite", error);
      alert("Rewrite failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    if (!currentBlog) return;
    setSaveStatus('saving');
    
    // Simulate a small delay for better UX feel
    setTimeout(() => {
      localStorage.setItem('trendsetter_draft', JSON.stringify(currentBlog));
      localStorage.setItem('trendsetter_last_topic', lastTopic);
      setSaveStatus('saved');
      setHasStoredDraft(true);
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 600);
  };

  const handleRestoreDraft = () => {
    const draft = localStorage.getItem('trendsetter_draft');
    const topic = localStorage.getItem('trendsetter_last_topic');
    if (draft) {
      setCurrentBlog(JSON.parse(draft));
      if (topic) setLastTopic(topic);
      setActiveTab('editor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <nav className="w-full md:w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-row md:flex-col items-center py-4 px-2 sticky top-0 z-50 overflow-x-auto md:overflow-x-visible">
        <div className="hidden lg:block mb-8 px-4 w-full text-center lg:text-left">
          <h1 className="text-xl font-black text-indigo-600 tracking-tight">TrendSetter AI</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">SEO Automation Engine</p>
        </div>
        
        <div className="flex flex-row md:flex-col w-full gap-2 px-2">
          <NavItem active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<TrendIcon />} label="Trends" />
          <NavItem 
            active={activeTab === 'select'} 
            onClick={() => setActiveTab('select')} 
            icon={<SelectionIcon />} 
            label="Variations" 
            disabled={variations.length === 0}
          />
          <NavItem 
            active={activeTab === 'editor'} 
            onClick={() => setActiveTab('editor')} 
            icon={<EditIcon />} 
            label="Editor" 
            disabled={!currentBlog}
          />
          <NavItem active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} icon={<EyeIcon />} label="Discover" disabled={!currentBlog} />
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {activeTab === 'trends' && (
            <>
              {hasStoredDraft && !currentBlog && (
                <div className="mb-6 bg-indigo-600 p-4 rounded-2xl text-white flex items-center justify-between animate-fadeIn shadow-xl shadow-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm">You have an unfinished draft</p>
                      <p className="text-xs text-indigo-100">Continue where you left off?</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRestoreDraft}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              )}
              <TrendingFeed trends={trends} loading={loadingTrends} onGenerate={handleGenerateVariations} onRefresh={fetchTrends} />
            </>
          )}

          {activeTab === 'select' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">Select Your Content Strategy</h2>
                <p className="text-gray-500">We've drafted 4 unique perspectives for: <span className="text-indigo-600 font-bold">"{lastTopic}"</span></p>
              </div>

              {generating ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array(4).fill(0).map((_, i) => (
                       <div key={i} className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
                    ))}
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {variations.map((v, i) => (
                    <div 
                      key={i} 
                      className="bg-white p-6 rounded-3xl border border-gray-200 hover:border-indigo-400 transition-all hover:shadow-xl group flex flex-col"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full tracking-widest">{v.style}</span>
                        <span className="text-xs font-bold text-green-600">{v.metrics.seoScore}% SEO</span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors mb-3">{v.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3 mb-6 font-serif italic">"{v.seoData.metaDescription}"</p>
                      <button 
                        onClick={() => handleSelectVariation(v)}
                        className="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all active:scale-95"
                      >
                        Select & Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'editor' && currentBlog && (
            <div className="space-y-8 animate-fadeIn">
              {generating && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                   <div className="text-center">
                     <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="font-bold text-gray-900">Regenerating magic...</p>
                   </div>
                </div>
              )}
              <SEOAnalysis metrics={currentBlog.metrics} seoData={currentBlog.seoData} />
              <BlogEditor 
                blog={currentBlog} 
                onUpdate={setCurrentBlog} 
                onRewrite={handleRewrite}
              />
              <div className="mt-8 flex justify-end gap-4 pb-12">
                <button 
                  onClick={handleSaveDraft}
                  disabled={saveStatus !== 'idle'}
                  className={`px-6 py-2 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 border ${
                    saveStatus === 'saved' 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>}
                  {saveStatus === 'saved' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Draft'}
                </button>
                <button 
                  onClick={() => setIsBloggerModalOpen(true)}
                  className="bg-orange-600 text-white px-8 py-2 rounded-xl hover:bg-orange-700 font-bold shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2M8 18H6v-2h2v2m0-4H6v-2h2v2m0-4H6V8h2v2m10 8h-8v-2h8v2m0-4h-8v-2h8v2m0-4h-8V8h8v2z"/></svg>
                  Publish to Blogger
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && currentBlog && (
            <DiscoverPreview blog={currentBlog} />
          )}
        </div>
      </main>

      {/* Blogger Integration Modal */}
      {currentBlog && (
        <BloggerModal 
          isOpen={isBloggerModalOpen} 
          onClose={() => setIsBloggerModalOpen(false)} 
          blog={currentBlog} 
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean }> = ({ active, onClick, icon, label, disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="hidden lg:block font-bold text-sm">{label}</span>
  </button>
);

const TrendIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const SelectionIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const EditIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const EyeIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

export default App;

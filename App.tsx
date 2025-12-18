
import React, { useState, useEffect } from 'react';
import { TrendingTopic, GeneratedBlog } from './types';
import { getTrendingTopics, generateBlogContent } from './services/geminiService';
import TrendingFeed from './components/TrendingFeed';
import BlogGenerator from './components/BlogGenerator';
import BlogEditor from './components/BlogEditor';
import SEOAnalysis from './components/SEOAnalysis';
import DiscoverPreview from './components/DiscoverPreview';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trends' | 'editor' | 'preview'>('trends');
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<GeneratedBlog | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async (category: string = 'General') => {
    setLoadingTrends(true);
    try {
      const data = await getTrendingTopics(category);
      setTrends(data);
    } catch (error) {
      console.error("Failed to load trends", error);
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleGenerateBlog = async (topic: string) => {
    setGenerating(true);
    setActiveTab('editor');
    try {
      const blog = await generateBlogContent(topic);
      setCurrentBlog(blog);
    } catch (error) {
      console.error("Failed to generate blog", error);
      alert("Error generating content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-row md:flex-col items-center py-4 px-2 sticky top-0 z-50 overflow-x-auto md:overflow-x-visible">
        <div className="hidden lg:block mb-8 px-4 w-full">
          <h1 className="text-xl font-black text-indigo-600 tracking-tight">TrendSetter AI</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">SEO Automation Engine</p>
        </div>
        
        <div className="flex flex-row md:flex-col w-full gap-2 px-2">
          <NavItem 
            active={activeTab === 'trends'} 
            onClick={() => setActiveTab('trends')}
            icon={<TrendIcon />}
            label="Trends"
          />
          <NavItem 
            active={activeTab === 'editor'} 
            onClick={() => setActiveTab('editor')}
            icon={<EditIcon />}
            label="Editor"
            disabled={!currentBlog && !generating}
          />
          <NavItem 
            active={activeTab === 'preview'} 
            onClick={() => setActiveTab('preview')}
            icon={<EyeIcon />}
            label="Discover"
            disabled={!currentBlog}
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {activeTab === 'trends' && (
            <TrendingFeed 
              trends={trends} 
              loading={loadingTrends} 
              onGenerate={handleGenerateBlog} 
              onRefresh={fetchTrends}
            />
          )}

          {activeTab === 'editor' && (
            <div className="space-y-8 animate-fadeIn">
              {generating ? (
                <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Crafting your SEO-friendly humanized blog...</h2>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Researching keywords, generating realistic images, and optimizing structure for maximum Discover visibility.</p>
                  </div>
                </div>
              ) : currentBlog ? (
                <>
                  <SEOAnalysis metrics={currentBlog.metrics} seoData={currentBlog.seoData} />
                  <BlogEditor 
                    blog={currentBlog} 
                    onUpdate={(updated) => setCurrentBlog(updated)}
                  />
                  <div className="mt-8 flex justify-end gap-4 pb-12">
                     <button className="bg-white border border-gray-300 px-6 py-2 rounded-xl text-gray-700 hover:bg-gray-50 font-bold transition-all shadow-sm">
                      Save Draft
                    </button>
                    <button 
                      onClick={() => window.open(`https://www.blogger.com/blog-post.g?blogID=YOUR_BLOG_ID&postBody=${encodeURIComponent(currentBlog.content)}`, '_blank')}
                      className="bg-indigo-600 text-white px-8 py-2 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg active:scale-95"
                    >
                      Publish to Blogger
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">Pick a trending topic from the "Trends" tab to start.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && currentBlog && (
            <DiscoverPreview blog={currentBlog} />
          )}
        </div>
      </main>
    </div>
  );
};

// --- Icons & Helper Components ---

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean }> = ({ active, onClick, icon, label, disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-100'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="hidden lg:block font-bold text-sm tracking-wide">{label}</span>
  </button>
);

const TrendIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const EditIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const EyeIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

export default App;


import React, { useState, useEffect } from 'react';
import { GeneratedBlog } from '../types';
import { publishToBlogger, convertBlogToFullHtml } from '../services/bloggerService';

interface BloggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: GeneratedBlog;
}

const BloggerModal: React.FC<BloggerModalProps> = ({ isOpen, onClose, blog }) => {
  const [blogId, setBlogId] = useState('');
  const [clientId, setClientId] = useState('');
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBlogId(localStorage.getItem('trendsetter_blog_id') || '');
      setClientId(localStorage.getItem('trendsetter_client_id') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyForManualPaste = async () => {
    const htmlContent = convertBlogToFullHtml(blog);
    const plainText = `${blog.title}\n\n${blog.content}`;

    try {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const data = [new ClipboardItem({ ['text/html']: htmlBlob, ['text/plain']: textBlob })];
      await navigator.clipboard.write(data);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 3000);
    } catch (e) {
      // Fallback
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      document.body.appendChild(container);
      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('copy');
      selection?.removeAllRanges();
      document.body.removeChild(container);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 3000);
    }
  };

  const handleManualRedirect = () => {
    handleCopyForManualPaste();
    const url = blogId ? `https://www.blogger.com/blog/posts/${blogId}` : `https://www.blogger.com/go/newpost`;
    window.open(url, "_blank");
  };

  const handleAuthAndPublish = () => {
    if (!clientId) {
      setError("OAuth Client ID is required for API mode. Use Manual Mode instead.");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      // @ts-ignore
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/blogger',
        callback: async (response: any) => {
          if (response.error !== undefined) {
            setError(`${response.error}: ${response.error_description || "Check your Authorized Origins."}`);
            setShowTroubleshoot(true);
            setIsPublishing(false);
            return;
          }

          try {
            await publishToBlogger(blog, blogId, response.access_token);
            alert("Published successfully!");
            onClose();
          } catch (err: any) {
            setError(err.message);
          } finally {
            setIsPublishing(false);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err: any) {
      setError("Google Login failed. Use 'Manual Mode' if you see an error.");
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20">
        {/* Sidebar */}
        <div className="bg-orange-600 p-10 md:w-80 text-white flex flex-col">
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2M8 18H6v-2h2v2m0-4H6v-2h2v2m0-4H6V8h2v2m10 8h-8v-2h8v2m0-4h-8v-2h8v2m0-4h-8V8h8v2z"/></svg>
          </div>
          <h2 className="text-2xl font-black mb-4 leading-tight">Publish</h2>
          <p className="text-orange-100 text-sm leading-relaxed mb-8">Move your AI-optimized content to Blogger in seconds.</p>
          
          <div className="mt-auto space-y-4">
             <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-1">Status</p>
                <p className="text-xs font-bold">{blogId ? `Target: ${blogId}` : 'ID missing'}</p>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 relative bg-white overflow-y-auto max-h-[90vh]">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" /></svg>
          </button>

          {step === 1 ? (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-black text-gray-900 mb-6">Settings</h3>
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Google Blog ID</label>
                  <input type="text" value={blogId} onChange={(e) => setBlogId(e.target.value)} placeholder="e.g. 7328912..." className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-orange-500/30 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">OAuth Client ID</label>
                  <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="...apps.googleusercontent.com" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-orange-500/30 font-mono text-sm" />
                </div>
              </div>
              <button onClick={() => { localStorage.setItem('trendsetter_blog_id', blogId); localStorage.setItem('trendsetter_client_id', clientId); setStep(2); }} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
                Continue
              </button>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-black text-gray-900 mb-2">Choose Method</h3>
              <p className="text-gray-500 text-sm mb-8">Manual mode is recommended for first-time setup.</p>

              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="p-6 border-2 border-orange-100 rounded-[2rem] bg-orange-50/50 hover:border-orange-300 transition-all cursor-pointer" onClick={handleManualRedirect}>
                  <h4 className="font-black text-gray-900 mb-1">Manual: Copy & Redirect</h4>
                  <p className="text-xs text-gray-500 mb-3">Copies title, images, and text. Then opens Blogger for you.</p>
                  <div className="text-orange-600 font-bold text-xs flex items-center gap-2">
                    {copyStatus ? 'Copied! Redirecting...' : 'Open Blogger Editor'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                </div>

                <div className={`p-6 border-2 rounded-[2rem] transition-all ${clientId ? 'border-indigo-100 bg-indigo-50/50 hover:border-indigo-300 cursor-pointer' : 'opacity-40 grayscale'}`} onClick={clientId ? handleAuthAndPublish : undefined}>
                  <h4 className="font-black text-gray-900 mb-1">Auto: Direct API Post</h4>
                  <p className="text-xs text-gray-500">Requires a correctly configured Google Cloud project.</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-2xl border border-red-100">
                  {error}
                  {showTroubleshoot && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="mb-1 text-red-800">Fixing "storagerelay" error:</p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>Ensure current URL <code className="bg-red-100 px-1">{window.location.origin}</code> is in your "Authorized JavaScript origins".</li>
                        <li>Check for mismatched <code className="bg-red-100 px-1">http</code> vs <code className="bg-red-100 px-1">https</code>.</li>
                        <li>Ensure there is NO trailing slash in the origin URL.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setStep(1)} className="w-full text-gray-400 text-[10px] font-black py-2 uppercase tracking-widest">
                Edit Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloggerModal;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Sparkles, ImagePlus, Paperclip, X, MessageSquareText } from 'lucide-react';
import { useRef } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import ReactMarkdown from 'react-markdown';
import { getProjectById, ProfileProject } from '../services/profilesAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ProjectUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProfileProject | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<Editor>(null);

  // AI Assistant State
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [isMobileAiOpen, setIsMobileAiOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getProjectById(id)
        .then(setProject)
        .catch(err => {
          console.error(err);
          navigate('/projects');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handlePostUpdate = async () => {
    if (!updateTitle || !updateDescription) {
      alert("Title and content are required.");
      return;
    }

    const email = localStorage.getItem('user_email');
    if (!email) {
      alert("You must be logged in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/public/projects/${project?.id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({
          title: updateTitle,
          description: updateDescription
        })
      });

      if (!res.ok) {
        throw new Error("Failed to post update");
      }
      
      // Redirect back to project details
      navigate(`/projects/${project?.id}`);
    } catch (err) {
      console.error(err);
      alert("An error occurred while posting the update.");
      setIsSubmitting(false);
    }
  };

  const handleAskAI = async () => {
    if (!chatInput.trim()) return;
    
    const email = localStorage.getItem('user_email');
    if (!email) {
      alert("You must be logged in to use the AI Assistant.");
      return;
    }

    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiLoading(true);
    setAiResponse('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/public/projects/${id}/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({
          messages: newHistory,
          currentContent: updateDescription
        })
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, Agnes AI encountered an error. Please try again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiText = (text: string) => {
    if (editorRef.current) {
      const currentMd = editorRef.current.getInstance().getMarkdown();
      editorRef.current.getInstance().setMarkdown(currentMd + (currentMd ? '\n\n' : '') + text);
      setUpdateDescription(editorRef.current.getInstance().getMarkdown());
      setIsMobileAiOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setChatInput(prev => prev + (prev ? '\n\n' : '') + text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // handleImageUpload is now handled by the Toast UI Editor hook
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${project?.id}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">Post Project Update</h1>
              <p className="text-xs text-gray-500 truncate max-w-[300px]">{project?.title}</p>
            </div>
          </div>
          <Button 
            onClick={handlePostUpdate} 
            disabled={isSubmitting || !updateTitle || !updateDescription}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Update'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col lg:flex-row gap-6">
        
        {/* Editor Section */}
        <div className="flex-1 flex flex-col gap-4 bg-white p-6 rounded-xl border shadow-sm h-[calc(100vh-8rem)]">
          <Input 
            placeholder="Update Title (e.g. Reached MVP Stage!)" 
            value={updateTitle}
            onChange={e => setUpdateTitle(e.target.value)}
            className="text-xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0"
          />
          
          <div className="flex justify-between items-center text-sm text-gray-500 mt-2 mb-2">
            <span>WYSIWYG Editor (Select image icon from toolbar to upload)</span>
          </div>

          <div className="flex-1 h-full flex flex-col">
            <Editor
              ref={editorRef}
              initialValue={updateDescription}
              previewStyle="vertical"
              height="100%"
              initialEditType="wysiwyg"
              hideModeSwitch={true}
              useCommandShortcut={true}
              onChange={() => {
                if (editorRef.current) {
                  setUpdateDescription(editorRef.current.getInstance().getMarkdown());
                }
              }}
              hooks={{
                addImageBlobHook: async (blob: File | Blob, callback: (url: string, altText: string) => void) => {
                  try {
                    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const email = localStorage.getItem('user_email');
                    
                    const formData = new FormData();
                    formData.append('image', blob);

                    const uploadRes = await fetch(`${API_BASE}/messages/direct-upload`, {
                      method: 'POST',
                      headers: {
                        'x-user-email': email || ''
                      },
                      body: formData
                    });

                    if (uploadRes.ok) {
                      const data = await uploadRes.json();
                      callback(data.url, 'Image');
                    } else {
                      const errorData = await uploadRes.text();
                      console.error("Backend upload failed:", errorData);
                      alert("Failed to upload image: " + errorData);
                    }
                  } catch (err) {
                    console.error("Image upload failed:", err);
                    alert("An error occurred during image upload.");
                  }
                }
              }}
            />
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:w-96 lg:rounded-xl lg:border lg:shadow-sm lg:h-[calc(100vh-8rem)]
          ${isMobileAiOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-4 border-b bg-blue-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Agnes AI Assistant</h2>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileAiOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {chatHistory.length === 0 ? (
              <div className="text-center text-sm text-gray-500 mt-10">
                Hi! I'm Agnes. Need help drafting your update for <b>{project?.title}</b>? <br/><br/>
                Try asking me to <i>"write an update announcing our new feature"</i>.
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`text-xs text-gray-500 mb-1 px-1`}>{msg.role === 'user' ? 'You' : 'Agnes AI'}</div>
                  <div className={`p-3 rounded-2xl text-sm max-w-[85%] overflow-hidden ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border rounded-tl-sm text-gray-800 prose prose-sm prose-blue'
                  }`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.role === 'assistant' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 px-2"
                      onClick={() => handleApplyAiText(msg.content)}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Insert
                    </Button>
                  )}
                </div>
              ))
            )}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Agnes is thinking...
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex items-end gap-2 relative">
              <div className="relative flex-1">
                <Textarea 
                  value={chatInput}
                  onChange={e => {
                    setChatInput(e.target.value);
                    e.target.style.height = 'inherit';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                  placeholder="Ask Agnes... (Shift+Enter for new line)"
                  className="w-full min-h-[40px] max-h-[200px] resize-none pr-10 py-2.5 text-sm leading-relaxed"
                  disabled={isAiLoading}
                  rows={1}
                />
                <div className="absolute right-2 bottom-2.5">
                  <input
                    type="file"
                    accept=".txt,.md"
                    id="chat-file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isAiLoading}
                  />
                  <label 
                    htmlFor="chat-file-upload" 
                    className={`cursor-pointer text-gray-400 hover:text-blue-600 transition-colors ${isAiLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    title="Attach text file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </label>
                </div>
              </div>
              <Button 
                size="icon" 
                onClick={handleAskAI} 
                disabled={!chatInput.trim() || isAiLoading} 
                className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 mb-0.5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Action Button for Mobile AI Assistant */}
      {!isMobileAiOpen && (
        <Button
          onClick={() => setIsMobileAiOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden rounded-full h-14 px-6 shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 z-40"
        >
          <Sparkles className="w-5 h-5" />
          Ask Agnes AI
        </Button>
      )}

      {/* Mobile Backdrop */}
      {isMobileAiOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileAiOpen(false)}
        />
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { MP, CampaignData, ViewMode } from './types';
import { Button } from './components/Button';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Share2, 
  Users, 
  ChevronRight, 
  CheckCircle, 
  Zap,
  Settings,
  ArrowLeft,
  Copy,
  Sparkles,
  Type,
  FileText
} from 'lucide-react';
import { optimizeCampaignContent } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('follower');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Feedback states for individual copy actions
  const [copyEmailId, setCopyEmailId] = useState<string | null>(null);
  const [copySubjectId, setCopySubjectId] = useState<string | null>(null);
  const [copyBodyId, setCopyBodyId] = useState<string | null>(null);
  
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  
  const [campaign, setCampaign] = useState<CampaignData>({
    title: 'Campaign For a Free Iran',
    globalSubject: 'Urgent Action Required',
    globalBody: 'Dear MP, I am writing to you regarding...',
    mps: [
      { 
        id: 'ex-1', 
        name: 'Representative Arash', 
        email: 'jimmie.akesson@riksdagen.se',  
    
      },
            { 
        id: 'ex-2', 
        name: 'Representative Aras22h', 
        email: 'arash2@example2.com', 
        subject: 'Urgent Appeal Under Responsibility to Protect (R2P): Iran', 
        body: 'Dear MP, I am writing to you.' 
      },
            { 
        id: 'ex-3', 
        name: 'Representative Arash3', 
        email: 'arash3@example.com', 
        subject: 'Urgent Appeal Under Responsibility to Protect (R2P): Iran', 
        body: 'Dear MP, I am writing to you regarding...' 
      }
    ]
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      try {
        const encodedData = hash.substring(1);
        const decodedData = JSON.parse(decodeURIComponent(atob(encodedData)));
        setCampaign(decodedData);
        setView('follower');
      } catch (e) {
        console.error("Link parsing error", e);
      }
    }
  }, []);

  const handleCopyLink = () => {
    const dataString = btoa(encodeURIComponent(JSON.stringify(campaign)));
    const link = `${window.location.origin}${window.location.pathname}#${dataString}`;
    navigator.clipboard.writeText(link);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleCopyText = (text: string, id: string, type: 'email' | 'subject' | 'body') => {
    navigator.clipboard.writeText(text.trim());
    if (type === 'email') {
      setCopyEmailId(id);
      setTimeout(() => setCopyEmailId(null), 2000);
    } else if (type === 'subject') {
      setCopySubjectId(id);
      setTimeout(() => setCopySubjectId(null), 2000);
    } else if (type === 'body') {
      setCopyBodyId(id);
      setTimeout(() => setCopyBodyId(null), 2000);
    }
  };

  const handleOptimize = async (mpId: string, currentBody: string) => {
    setIsOptimizing(mpId);
    try {
      const optimized = await optimizeCampaignContent(currentBody || campaign.globalBody, 'professional');
      const updatedMps = campaign.mps.map(m => m.id === mpId ? { ...m, body: optimized } : m);
      setCampaign({ ...campaign, mps: updatedMps });
    } catch (error) {
      console.error("Optimization failed", error);
    } finally {
      setIsOptimizing(null);
    }
  };

  const generateMailto = (mp: MP) => {
    const recipient = mp.email.trim();
    const subject = (mp.subject || campaign.globalSubject).trim();
    const body = (mp.body || campaign.globalBody).trim();
    
    const params = new URLSearchParams();
    params.append('subject', subject);
    params.append('body', body);
    
    return `mailto:${recipient}?${params.toString().replace(/\+/g, '%20')}`;
  };

  const FollowerView = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-xl w-full space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {campaign.title}
          </h1>
          <p className="text-gray-500 font-medium">
            Send an email directly or copy details for manual entry.
          </p>
        </header>

        <div className="space-y-4">
          {campaign.mps.map((mp) => (
            <div key={mp.id} className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-gray-200">
              <a 
                href={generateMailto(mp)}
                className="flex items-center justify-between p-6 hover:bg-blue-50/30 transition-colors group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
                    <Users className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 leading-tight">
                      {mp.name || 'Representative'}
                    </h4>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">
                      {mp.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest shrink-0">
                  Send Email <ChevronRight className="w-4 h-4" />
                </div>
              </a>

              {/* Quick Copy Toolbar */}
              <div className="px-6 pb-6 pt-2 flex items-center gap-2 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter mr-2">Manual Copy:</span>
                
                <button 
                  onClick={() => handleCopyText(mp.email, mp.id, 'email')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${copyEmailId === mp.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                >
                  {copyEmailId === mp.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                  Email
                </button>

                <button 
                  onClick={() => handleCopyText(mp.subject || campaign.globalSubject, mp.id, 'subject')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${copySubjectId === mp.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                >
                  {copySubjectId === mp.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                  Subject
                </button>

                <button 
                  onClick={() => handleCopyText(mp.body || campaign.globalBody, mp.id, 'body')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${copyBodyId === mp.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                >
                  {copyBodyId === mp.id ? <CheckCircle className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  Body
                </button>
              </div>
            </div>
          ))}

          {campaign.mps.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400">Campaign has no targets.</p>
              <Button variant="ghost" className="mt-4" onClick={() => setView('builder')}>Configure Campaign</Button>
            </div>
          )}
        </div>

        <div className="pt-8 flex justify-center">
          <button 
            onClick={() => setView('builder')}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <Settings className="w-4 h-4" /> Edit Campaign Settings
          </button>
        </div>
      </div>
    </div>
  );

  const BuilderUI = () => (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('follower')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Campaign Editor</h1>
              <p className="text-gray-500 text-sm">Design the experience for your followers.</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleCopyLink} className="shadow-lg shadow-blue-100">
            {copyFeedback ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copyFeedback ? 'Link Copied' : 'Share Campaign Link'}
          </Button>
        </header>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Public Campaign Title</label>
            <input 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={campaign.title}
              onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
            />
          </div>

          <section className="bg-white border-2 border-gray-50 p-8 rounded-[32px] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <Users className="w-5 h-5 text-blue-500" /> Target List
              </h2>
            </div>
            
            <div className="space-y-4">
              {campaign.mps.map((mp) => (
                <div key={mp.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 relative">
                   <button 
                    onClick={() => {
                      const updated = campaign.mps.filter(m => m.id !== mp.id);
                      setCampaign({ ...campaign, mps: updated });
                    }}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Name / Title</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={mp.name}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, name: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Target Email</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={mp.email}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, email: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Subject Line</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={campaign.globalSubject}
                        value={mp.subject || ''}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, subject: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Message Body</label>
                        <button 
                          onClick={() => handleOptimize(mp.id, mp.body || '')}
                          disabled={!!isOptimizing}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
                        >
                          {isOptimizing === mp.id ? <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600"></div> : <Sparkles className="w-3 h-3" />}
                          AI Optimize
                        </button>
                      </div>
                      <textarea 
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={campaign.globalBody}
                        value={mp.body || ''}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, body: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="secondary" className="w-full border-dashed py-4 rounded-2xl bg-white hover:bg-blue-50 hover:border-blue-200 transition-all" onClick={() => {
                const newMP: MP = { id: Date.now().toString(), name: '', email: '', subject: '', body: '' };
                setCampaign({ ...campaign, mps: [...campaign.mps, newMP] });
              }}>
                <Plus className="w-4 h-4" /> Add Another MP / Target
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      {view === 'follower' ? <FollowerView /> : <BuilderUI />}
    </main>
  );
};

export default App;

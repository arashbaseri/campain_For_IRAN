
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
  Sparkles
} from 'lucide-react';
import { optimizeCampaignContent } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('follower');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copyEmailId, setCopyEmailId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  
  const [campaign, setCampaign] = useState<CampaignData>({
    title: 'MP Campaign Action',
    globalSubject: 'Urgent Action Required',
    globalBody: 'Dear MP, I am writing to you regarding...',
    mps: [
      { 
        id: 'ex-1', 
        name: 'Representative Arash', 
        email: 'arash@example.com', 
        subject: 'Campaign Support', 
        body: 'Please support our cause for better infrastructure.' 
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

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email.trim());
    setCopyEmailId(id);
    setTimeout(() => setCopyEmailId(null), 2000);
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
            Send an email to your representative in one click.
          </p>
        </header>

        <div className="space-y-3">
          {campaign.mps.map((mp) => (
            <div key={mp.id} className="relative group">
              <a 
                href={generateMailto(mp)}
                className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 group-hover:bg-blue-50 rounded-xl flex items-center justify-center transition-colors">
                    <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <div className="pr-12">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 leading-tight">
                      {mp.name || 'Representative'}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium truncate max-w-[180px]">
                      {mp.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest shrink-0">
                  Email <ChevronRight className="w-4 h-4" />
                </div>
              </a>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyEmail(mp.email, mp.id);
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                title="Copy email address"
              >
                {copyEmailId === mp.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
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

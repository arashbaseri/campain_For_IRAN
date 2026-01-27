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
  FileText,
  ExternalLink
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
    globalSubject: 'Urgent Appeal Under Responsibility to Protect (R2P): Iran',
    globalBody: `Hi dear Member of the European Parliament!

The Islamic Republic of Iran is carrying out systematic crimes against humanity against unarmed civilians protesting peacefully for basic human rights. Protesters, including children, are being killed in the streets, deliberately targeted with military-grade and chemical weapons, and in some cases executed at close range. Victims’ bodies are confiscated to conceal evidence.

The regime has also deployed foreign terrorist militias, including Hashd al-Shaabi, Zeynabiyoun, and Fatemiyoun forces, to suppress its own population—an explicit violation of international law and the Geneva Conventions.

Iran has completely failed to protect its people and is actively committing mass atrocities. This clearly meets the legal threshold for the Responsibility to Protect (R2P).

We therefore call for the following immediate actions:
 1. The IRGC must be designated as a terrorist organization by the European Union.
 2. The Responsibility to Protect (R2P) must be activated for Iran.
 3. Prince Reza Pahlavi should be formally recognized as the leader of the democratic transition and invited to the European Parliament.
 4. Abr Arvan/ArvanCloud, a company actively assisting the regime’s repression, must be designated as a terrorist entity.

Governments committed to human dignity, international law, and accountability must act now to prevent further atrocities.

With best regards`,
    mps: [
      { id: 'ex-1', name: 'All Primary Targets', email: 'roberta.metsola@europarl.europa.eu;michael.gahler@europarl.europa.eu;charlie.weimers@europarl.europa.eu;raphael.glucksmann@europarl.europa.eu;hannah.neumann@europarl.europa.eu;petras.austrevicius@europarl.europa.eu' }
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
    // Standardize the email separator to comma (,) which is the RFC standard for multiple recipients.
    // We replace semicolons and remove extra spaces.
    const recipient = mp.email.replace(/;/g, ',').replace(/\s+/g, '').trim();
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
            {campaign.title}
          </h1>
          <p className="text-gray-500 font-medium px-4">
            Take action now. Click the buttons below to send or copy your message.
          </p>
        </header>

        <div className="space-y-6">
          {campaign.mps.map((mp) => {
            const isGroup = mp.email.includes(';') || mp.email.includes(',');
            return (
              <div key={mp.id} className="bg-white rounded-3xl border-2 border-gray-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col">
                {/* Card Content Top */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-lg leading-tight truncate">
                          {mp.name || 'Representative'}
                        </h4>
                        {isGroup && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">
                            Group
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 font-medium truncate mt-1">
                        {mp.email.split(/[;,]/)[0]}{mp.email.split(/[;,]/).length > 1 ? ` + ${mp.email.split(/[;,]/).length - 1} more` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Manual Copy Toolbar */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Manual Copy Options:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleCopyText(mp.email, mp.id, 'email')}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-[10px] font-bold transition-all border ${copyEmailId === mp.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                        title="Copy all email addresses"
                      >
                        {copyEmailId === mp.id ? <CheckCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        Emails
                      </button>

                      <button 
                        onClick={() => handleCopyText(mp.subject || campaign.globalSubject, mp.id, 'subject')}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-[10px] font-bold transition-all border ${copySubjectId === mp.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                        title="Copy subject line"
                      >
                        {copySubjectId === mp.id ? <CheckCircle className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                        Subject
                      </button>

                      <button 
                        onClick={() => handleCopyText(mp.body || campaign.globalBody, mp.id, 'body')}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-[10px] font-bold transition-all border ${copyBodyId === mp.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                        title="Copy email body"
                      >
                        {copyBodyId === mp.id ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        Body
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button (The "Send Email" footer) */}
                <a 
                  href={generateMailto(mp)}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-colors active:scale-[0.98]"
                >
                  {isGroup ? 'Send Group Action' : 'Send Individual Action'} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            );
          })}

          {campaign.mps.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-medium">No campaign targets found.</p>
              <Button variant="ghost" className="mt-4" onClick={() => setView('builder')}>Configure Campaign</Button>
            </div>
          )}
        </div>

        <div className="pt-10 flex justify-center">
          <button 
            onClick={() => setView('builder')}
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <Settings className="w-4 h-4" /> Campaign Dashboard
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
              <h1 className="text-2xl font-black text-gray-900 leading-none">Campaign Builder</h1>
              <p className="text-gray-500 text-sm mt-1">Design the experience for your followers.</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleCopyLink} className="shadow-lg shadow-blue-100 py-3 px-6">
            {copyFeedback ? <CheckCircle className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            {copyFeedback ? 'Link Copied' : 'Share Campaign Link'}
          </Button>
        </header>

        <div className="space-y-8">
          <div className="bg-gray-50 p-6 md:p-8 rounded-[32px] border border-gray-100 space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Public Campaign Title</label>
            <input 
              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              value={campaign.title}
              onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
            />
          </div>

          <section className="bg-white border-2 border-gray-50 p-6 md:p-10 rounded-[40px] space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-3 text-gray-900">
                <Users className="w-6 h-6 text-blue-500" /> Targets & Messages
              </h2>
            </div>
            
            <div className="space-y-6">
              {campaign.mps.map((mp) => (
                <div key={mp.id} className="bg-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-100 space-y-6 relative transition-all hover:bg-white hover:shadow-md">
                   <button 
                    onClick={() => {
                      const updated = campaign.mps.filter(m => m.id !== mp.id);
                      setCampaign({ ...campaign, mps: updated });
                    }}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Representative Name</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={mp.name}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, name: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Email Addresses (separte with ; or ,)</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={mp.email}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, email: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Custom Subject Line</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={campaign.globalSubject}
                        value={mp.subject || ''}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, subject: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5 ml-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Custom Email Body</label>
                        <button 
                          onClick={() => handleOptimize(mp.id, mp.body || '')}
                          disabled={!!isOptimizing}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isOptimizing === mp.id ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div> : <Sparkles className="w-3.5 h-3.5" />}
                          AI Optimize
                        </button>
                      </div>
                      <textarea 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
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
              <Button variant="secondary" className="w-full border-dashed py-6 rounded-3xl bg-white hover:bg-blue-50 hover:border-blue-200 transition-all font-black text-xs uppercase tracking-[0.2em]" onClick={() => {
                const newMP: MP = { id: Date.now().toString(), name: '', email: '', subject: '', body: '' };
                setCampaign({ ...campaign, mps: [...campaign.mps, newMP] });
              }}>
                <Plus className="w-5 h-5" /> Add Target Representative
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
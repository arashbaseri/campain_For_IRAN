
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
  ArrowLeft
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('follower');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Seeding with your provided examples
  const [campaign, setCampaign] = useState<CampaignData>({
    title: 'MP Campaign Action',
    globalSubject: 'Action Required',
    globalBody: 'Please support our cause.',
    mps: [
      { 
        id: 'ex-1', 
        name: 'Representative Arash', 
        email: 'arash@b.com', 
        subject: 'campion', 
        body: 'this is text bofy gor send in preview' 
      },
      { 
        id: 'ex-2', 
        name: 'Representative reza', 
        email: 'reza@bdsds.com', 
        subject: 'campion', 
        body: 'this is text bofy dsfsdfsdfsdfsdfsdfsdfsdf' 
      },
            { 
        id: 'ex-2', 
        name: 'Representative Arasdh', 
        email: 'arasdh@bdsds.com', 
        subject: 'campion', 
        body: 'this reza' 
      }
    ]
  });

  // Share Logic: Encodes campaign into URL hash
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

  const generateMailto = (mp: MP) => {
    const subject = encodeURIComponent(mp.subject || campaign.globalSubject);
    const body = encodeURIComponent(mp.body || campaign.globalBody);
    return `mailto:${mp.email}?subject=${subject}&body=${body}`;
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
            Click a name below to open your email app with the pre-filled message.
          </p>
        </header>

        <div className="space-y-3">
          {campaign.mps.map((mp, i) => (
            <a 
              key={mp.id}
              href={generateMailto(mp)}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 group-hover:bg-blue-50 rounded-xl flex items-center justify-center transition-colors">
                  <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600">{mp.name || 'MP Name'}</h4>
                  <p className="text-xs text-gray-400 font-medium">{mp.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest">
                Send <ChevronRight className="w-4 h-4" />
              </div>
            </a>
          ))}

          {campaign.mps.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400">No Magic Links found.</p>
              <Button variant="ghost" className="mt-4" onClick={() => setView('builder')}>Create One</Button>
            </div>
          )}
        </div>

        <div className="pt-8 flex justify-center">
          <button 
            onClick={() => setView('builder')}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <Settings className="w-4 h-4" /> Campaign Settings
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
              <h1 className="text-2xl font-black text-gray-900">Configure Campaign</h1>
              <p className="text-gray-500 text-sm">Update names, emails, and message text.</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleCopyLink}>
            {copyFeedback ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copyFeedback ? 'Link Copied!' : 'Copy Shareable Link'}
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <section className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <Mail className="w-5 h-5 text-blue-500" /> Target List
            </h2>
            
            <div className="space-y-4">
              {campaign.mps.map((mp, idx) => (
                <div key={mp.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 relative group">
                   <button 
                    onClick={() => {
                      const updated = campaign.mps.filter(m => m.id !== mp.id);
                      setCampaign({ ...campaign, mps: updated });
                    }}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Name</label>
                      <input 
                        className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={mp.name}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, name: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email</label>
                      <input 
                        className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Unique Subject</label>
                      <input 
                        className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={mp.subject || ''}
                        onChange={(e) => {
                          const updated = campaign.mps.map(m => m.id === mp.id ? { ...m, subject: e.target.value } : m);
                          setCampaign({ ...campaign, mps: updated });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Unique Body Text</label>
                      <textarea 
                        className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
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
              <Button variant="secondary" className="w-full border-dashed py-4 rounded-2xl" onClick={() => {
                const newMP: MP = { id: Date.now().toString(), name: '', email: '', subject: '', body: '' };
                setCampaign({ ...campaign, mps: [...campaign.mps, newMP] });
              }}>
                <Plus className="w-4 h-4" /> Add New Magic Link Target
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

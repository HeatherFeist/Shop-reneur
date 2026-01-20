
import React, { useState, useEffect } from 'react';
import { CreatorStats, ContentPrompt, ChallengeCategory } from '../types';
import { scanTrendsAndGenerateChallenges } from '../services/geminiService';
import BusinessTip from './BusinessTip';
import { 
  Trophy, TrendingUp, Users, Flame, Zap, CheckCircle, Loader2, 
  Globe, ExternalLink, ShieldCheck, Target, ArrowRight, 
  ThumbsUp, Heart, Play, Home, Youtube, Instagram, 
  Facebook, Smartphone, Award, BookOpen, Megaphone, 
  Sparkles, PlusCircle, Link2
} from 'lucide-react';

interface CommunityLobbyProps {
  creatorStats: CreatorStats;
  onVote: (postId: string) => void;
  onBackToStore: () => void;
}

interface Submission {
  id: string;
  userName: string;
  avatar: string;
  contentUrl: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook';
  title: string;
  votes: number;
  timestamp: number;
}

const CommunityLobby: React.FC<CommunityLobbyProps> = ({ creatorStats, onVote, onBackToStore }) => {
  const [challenges, setChallenges] = useState<ContentPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'voting' | 'leaderboard' | 'socials'>('challenges');
  const [submissions, setSubmissions] = useState<Submission[]>([
    { id: '1', userName: 'Alexia', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexia', contentUrl: 'https://tiktok.com', platform: 'TikTok', title: 'Why I started my brand! #EntrepreneurLife', votes: 24, timestamp: Date.now() - 100000 },
    { id: '2', userName: 'Maya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya', contentUrl: 'https://instagram.com', platform: 'Instagram', title: 'Viral Glow-Up Kit Ad ✨', votes: 19, timestamp: Date.now() - 500000 }
  ]);

  const fetchChallenges = async () => {
    setLoading(true);
    const results = await scanTrendsAndGenerateChallenges();
    setChallenges(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleVoteSubmission = (id: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s));
  };

  const getCategoryIcon = (cat: ChallengeCategory) => {
    switch(cat) {
      case 'Education': return <BookOpen size={16} />;
      case 'Advertising': return <Megaphone size={16} />;
      case 'Branding': return <Sparkles size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <div className="animate-fadeIn space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-6">
          <button onClick={onBackToStore} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
             <Home size={20} />
          </button>
          <div className="space-y-1">
            <h2 className="text-4xl font-display font-bold text-white tracking-tight">Expansion Hub</h2>
            <p className="text-slate-500 text-sm font-light">The strategic network for viral entrepreneurs.</p>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('challenges')} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'challenges' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Daily Missions</button>
           <button onClick={() => setActiveTab('socials')} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'socials' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Social Command</button>
           <button onClick={() => setActiveTab('voting')} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'voting' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Trend Feed</button>
           <button onClick={() => setActiveTab('leaderboard')} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Ranking</button>
        </div>
      </div>

      {activeTab === 'socials' && (
        <div className="animate-fadeIn space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a href="https://studio.youtube.com/channel/create" target="_blank" className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-red-500/30 transition-all flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform"><Youtube size={32} /></div>
                 <div><h4 className="font-bold text-white">YouTube</h4><p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Video Empire</p></div>
                 <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-2 pt-4">Create Channel <PlusCircle size={14}/></span>
              </a>
              <button className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-pink-500/30 transition-all flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-pink-600/10 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform"><Instagram size={32} /></div>
                 <div><h4 className="font-bold text-white">Instagram</h4><p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Aesthetic Branding</p></div>
                 <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 pt-4">Connect Account <Link2 size={14}/></span>
              </button>
              <button className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-indigo-500/30 transition-all flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Smartphone size={32} /></div>
                 <div><h4 className="font-bold text-white">TikTok</h4><p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Viral Growth</p></div>
                 <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 pt-4">Connect Account <Link2 size={14}/></span>
              </button>
              <button className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-blue-500/30 transition-all flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Facebook size={32} /></div>
                 <div><h4 className="font-bold text-white">Facebook</h4><p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Community Reach</p></div>
                 <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 pt-4">Connect Account <Link2 size={14}/></span>
              </button>
           </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-12 animate-fadeIn">
          <div className="relative glass-card rounded-[3.5rem] p-12 overflow-hidden border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
             <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="space-y-4 max-w-2xl text-center lg:text-left">
                   <div className="flex items-center justify-center lg:justify-start gap-3">
                      <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Trend Intelligence v3</span>
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">● Scanning Social Networks</span>
                   </div>
                   <h3 className="text-5xl font-display font-bold text-white leading-tight">Daily Expansion Tasks</h3>
                   <p className="text-lg text-slate-400 font-light leading-relaxed">Gemini has analyzed the current viral trends. Choose a challenge to educate your audience or advertise your best assets.</p>
                </div>
                <button onClick={fetchChallenges} disabled={loading} className="w-full lg:w-auto bg-white text-black px-10 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-4 shadow-3xl disabled:opacity-50 group">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="text-indigo-600 group-hover:scale-125 transition-transform" />} Optimize Missions
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {challenges.length > 0 ? challenges.map((challenge) => (
              <div key={challenge.id} className="glass-card p-10 rounded-[2.5rem] border border-white/5 group hover:border-indigo-500/40 transition-all flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 -mr-10 -mt-10 group-hover:scale-110 transition-transform">
                   {getCategoryIcon(challenge.category)}
                </div>

                <div className="flex justify-between items-start mb-8">
                   <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${challenge.platform === 'TikTok' ? 'bg-black text-white' : challenge.platform === 'Instagram' ? 'bg-pink-600 text-white' : 'bg-red-600 text-white'}`}>
                        {challenge.platform === 'YouTube' ? <Youtube size={20} /> : challenge.platform === 'Instagram' ? <Instagram size={20} /> : <Play size={20} />}
                      </div>
                      <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">{challenge.category}</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-emerald-400 font-black text-xs">+{challenge.xpReward} XP</span>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{challenge.difficulty}</span>
                   </div>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Trend: {challenge.trendingTopic}</p>
                  <h4 className="text-2xl font-display font-bold text-white">{challenge.title}</h4>
                  <p className="text-slate-500 text-sm font-light leading-relaxed">{challenge.description}</p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-4">
                    {challenge.sources?.slice(0, 1).map((s, i) => (
                      <a key={i} href={s} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"><Globe size={10}/> Research Data</a>
                    ))}
                  </div>
                  <button onClick={() => alert("Submission Active: Drop your link below!")} className="bg-white text-black px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Start Task</button>
                </div>
              </div>
            )) : Array.from({length: 4}).map((_, i) => (
              <div key={i} className="glass-card h-64 rounded-[2.5rem] border border-white/5 animate-pulse bg-white/[0.01]"></div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'voting' && (
        <div className="space-y-12 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <h3 className="text-4xl font-display font-bold text-white">The Trend Feed</h3>
              <p className="text-slate-500 font-light">Vote on the best submissions. The winner of each challenge gets 2x XP!</p>
            </div>
            <BusinessTip title="Peer Review" content="Constructive feedback from your business partners (siblings/mom) is how you build a better brand. Vote for the content that is clearest!" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {submissions.map((sub) => (
              <div key={sub.id} className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] flex flex-col group">
                <div className="h-56 bg-slate-900 flex items-center justify-center relative group-hover:bg-slate-800 transition-colors">
                   {sub.platform === 'TikTok' ? <Play size={48} className="text-white opacity-20" /> : <Instagram size={48} className="text-white opacity-20" />}
                   <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {sub.platform} Session
                   </div>
                </div>
                <div className="p-8 space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4">
                    <img src={sub.avatar} className="w-14 h-14 rounded-2xl border border-white/10 shadow-lg" alt="" />
                    <div className="min-w-0">
                       <p className="font-bold text-white truncate">{sub.userName}</p>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Founder @ Expansion Hub</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-slate-200 line-clamp-2">{sub.title}</h4>
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl">
                       <ThumbsUp size={14} className="text-indigo-400" />
                       <span className="text-white font-black text-xs">{sub.votes} Votes</span>
                    </div>
                    <button onClick={() => handleVoteSubmission(sub.id)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all bg-indigo-600/20 px-6 py-3 rounded-xl border border-indigo-500/20">
                       Verify Content
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="glass-card rounded-[3.5rem] p-12 border border-white/5 relative overflow-hidden bg-gradient-to-tr from-indigo-500/5 to-transparent">
             <div className="flex items-center gap-4 mb-12">
                <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-600/30">
                   <Trophy size={32} />
                </div>
                <div>
                   <h3 className="text-4xl font-display font-bold text-white">Boardroom Rankings</h3>
                   <p className="text-slate-500 font-light">The top expansion partners of the week.</p>
                </div>
             </div>

             <div className="space-y-4 max-w-4xl">
               {[
                 { name: "Maya", xp: 4850, level: "Viral Icon", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya" },
                 { name: "Alexia", xp: 4200, level: "Growth Partner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexia" },
                 { name: "Heather (CEO)", xp: 3900, level: "Empire Builder", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom" }
               ].map((user, idx) => (
                 <div key={idx} className={`flex items-center justify-between p-8 rounded-[2rem] transition-all border ${idx === 0 ? 'bg-indigo-600/10 border-indigo-500/40 shadow-2xl scale-105' : 'bg-white/[0.02] border-white/5'}`}>
                   <div className="flex items-center gap-8">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                         {idx + 1}
                      </div>
                      <img src={user.avatar} className="w-16 h-16 rounded-2xl border-2 border-white/10" alt="" />
                      <div>
                         <h4 className="text-xl font-display font-bold text-white">{user.name}</h4>
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{user.level}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-3xl font-display font-bold text-white">{user.xp.toLocaleString()}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Capital XP</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityLobby;

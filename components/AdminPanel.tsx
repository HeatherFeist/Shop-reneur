
import React, { useState, useEffect } from 'react';
import { ProductCategory, Product, CreatorStats, ShopSettings } from '../types';
import { generateProductDescription, generateProductImage } from '../services/geminiService';
import BusinessTip from './BusinessTip';
import BusinessMentor from './BusinessMentor';
import { Sparkles, Loader2, Image as ImageIcon, Save, Bot, Cloud, Rocket, Palette, ArrowUpCircle, Globe, CheckCircle, Boxes, Database, ShieldCheck, Tag, LayoutGrid } from 'lucide-react';

interface AdminPanelProps {
  onAddProduct: (product: Product | Product[]) => void;
  creatorStats: CreatorStats;
  onCompleteChallenge: (points: number) => void;
  shopSettings: ShopSettings;
  onUpdateShopSettings: (settings: ShopSettings) => void;
  products: Product[];
  dbConnected?: boolean;
  onSyncMarketplace?: (productId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onAddProduct, 
  creatorStats,
  shopSettings,
  onUpdateShopSettings,
  products,
  dbConnected = false,
  onSyncMarketplace
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'brand' | 'marketplace'>('inventory');
  const [settingsForm, setSettingsForm] = useState<ShopSettings>(shopSettings);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);

  useEffect(() => { setSettingsForm(shopSettings); }, [shopSettings]);

  const [formData, setFormData] = useState({
    name: '', price: '', costPrice: '', category: ProductCategory.FASHION, keywords: '', affiliateLink: 'https://amazon.com', platform: 'Amazon' as 'Amazon' | 'Shein', description: '', imageUrl: '', additionalImages: [] as string[], videoUrl: '', isReceived: false, asin: ''
  });

  const handleMagicWrite = async () => {
    if (!formData.name) return;
    setLoading(true);
    const desc = await generateProductDescription(formData.name, formData.category, formData.keywords || 'high-end professional');
    setFormData(prev => ({ ...prev, description: desc }));
    setLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!formData.name) return;
    setImageLoading(true);
    const img = await generateProductImage(formData.name, formData.category, formData.description || 'Professional Enterprise Product');
    if (img) setFormData(prev => ({ ...prev, imageUrl: img }));
    setImageLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      category: formData.category as ProductCategory,
      description: formData.description,
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name}/400/500`,
      affiliateLink: formData.affiliateLink,
      platform: formData.platform,
      isWishlist: true,
      isReceived: false,
      asin: formData.asin
    });
    setFormData({ name: '', price: '', costPrice: '', category: ProductCategory.FASHION, keywords: '', affiliateLink: 'https://amazon.com', platform: 'Amazon', description: '', imageUrl: '', additionalImages: [], videoUrl: '', isReceived: false, asin: '' });
  };

  const canPushToMarketplace = creatorStats.level === 'Influencer' || creatorStats.level === 'Viral Icon' || creatorStats.level === 'Empire Builder';

  return (
    <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative bg-white/[0.01]">
      <BusinessMentor isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} onAddChallenge={() => {}} />
      
      <button onClick={() => setIsMentorOpen(true)} className="fixed bottom-10 right-10 z-50 bg-white text-black p-5 rounded-3xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform group border border-white/10">
        <Bot size={24} className="text-indigo-600" />
        <span className="text-xs font-black uppercase tracking-widest pr-2">Strategic Advisor</span>
      </button>

      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-10 min-w-max">
          <button onClick={() => setActiveAdminTab('inventory')} className={`pb-6 px-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${activeAdminTab === 'inventory' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Inventory Ops</button>
          <button onClick={() => setActiveAdminTab('marketplace')} className={`pb-6 px-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${activeAdminTab === 'marketplace' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Marketplace Sync</button>
          <button onClick={() => setActiveAdminTab('brand')} className={`pb-6 px-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${activeAdminTab === 'brand' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Settings</button>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${dbConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
           <Cloud size={12} className={dbConnected ? 'animate-pulse' : ''} />
           {dbConnected ? 'Sync Active' : 'Disconnected'}
        </div>
      </div>

      {activeAdminTab === 'inventory' && (
        <form onSubmit={handleSubmit} className="animate-fadeIn space-y-12">
           <div className="flex justify-between items-center">
             <div className="space-y-1">
               <h3 className="text-4xl font-display font-bold text-white tracking-tight">Asset Onboarding</h3>
               <p className="text-slate-500 text-sm font-light">Populate the hub with curated strategic inventory.</p>
             </div>
             <BusinessTip title="ASIN Strategic Value" content="Providing the Amazon ASIN ensures that board members can precisely batch-buy these items for organization founders." />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Asset Name</label>
                 <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Professional Digital Slate" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors text-white font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">MSRP ($)</label>
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Amazon ASIN</label>
                    <input type="text" value={formData.asin} onChange={e => setFormData({...formData, asin: e.target.value})} placeholder="B0..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white font-mono" />
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Strategic Overview</label>
                 <div className="relative">
                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 outline-none focus:border-indigo-500 h-40 text-slate-300 font-light leading-relaxed" placeholder="Market positioning and product details..." />
                    <button type="button" onClick={handleMagicWrite} className="absolute bottom-4 right-4 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-xl">
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Compose
                    </button>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Master Image URL</label>
                 <div className="flex gap-4">
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://source.com/image.jpg" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white" />
                    <button type="button" onClick={handleGenerateImage} className="bg-white/10 text-white px-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                      {imageLoading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                    </button>
                 </div>
              </div>
           </div>

           <button type="submit" className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-3xl hover:bg-slate-200 transition-all flex items-center justify-center gap-4 group">
             <Database size={24} className="text-indigo-600" /> Commit to Organization Ledger
           </button>
        </form>
      )}

      {activeAdminTab === 'brand' && (
        <div className="animate-fadeIn space-y-12">
           <div className="glass-card p-12 rounded-[3rem] border border-white/10 space-y-12">
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-bold text-white flex items-center gap-4">
                   <Tag className="text-indigo-400" /> Enterprise Integration
                </h3>
                <p className="text-slate-500 text-sm font-light">Configure affiliate tracking and visual organization identity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Incubator Title</label>
                   <input 
                     type="text" 
                     value={settingsForm.storeName}
                     onChange={e => setSettingsForm({...settingsForm, storeName: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white font-bold"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Amazon Affiliate Tag</label>
                   <div className="relative">
                     <input 
                       type="text" 
                       value={settingsForm.amazonAffiliateTag || ''}
                       onChange={e => setSettingsForm({...settingsForm, amazonAffiliateTag: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 font-mono"
                       placeholder="e.g. yourbiz-20"
                     />
                     <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Brand Identity Palette</h4>
                 <div className="flex gap-6">
                    <input 
                      type="color" 
                      value={settingsForm.primaryColor}
                      onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})}
                      className="w-24 h-14 rounded-2xl bg-white/5 p-1 border border-white/10 cursor-pointer overflow-hidden"
                    />
                    <div className="flex-1 flex items-center px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-mono text-sm">
                       {settingsForm.primaryColor}
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => onUpdateShopSettings(settingsForm)}
                className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-3xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-4"
              >
                <Save size={24} /> Deploy Platform Updates
              </button>
           </div>
        </div>
      )}

      {activeAdminTab === 'marketplace' && (
        <div className="animate-fadeIn space-y-12">
           <div className="relative bg-gradient-to-br from-indigo-950 to-slate-950 rounded-[3rem] p-16 text-white border border-indigo-500/20 overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
                      <Globe size={32} />
                   </div>
                   <h3 className="text-4xl font-display font-bold tracking-tight">Marketplace Promotion</h3>
                </div>
                <p className="text-slate-400 max-w-2xl text-lg font-light leading-relaxed">
                  Bridge the internal incubator with your organization's external marketplace. Scale validated assets to the global tier.
                </p>
                {!canPushToMarketplace && (
                  <div className="inline-flex items-center gap-3 bg-red-500/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 text-red-400 shadow-xl shadow-red-500/5">
                     <ShieldCheck size={16} /> Influencer Tier Required for Promotion
                  </div>
                )}
              </div>
              <ArrowUpCircle size={300} className="absolute -right-20 -bottom-20 opacity-5 text-indigo-500" />
           </div>

           <div className="grid grid-cols-1 gap-6">
              {products.filter(p => p.isReceived).map(p => (
                <div key={p.id} className="flex items-center justify-between p-8 glass-card rounded-[2rem] border border-white/5 group hover:bg-white/[0.03] transition-all">
                   <div className="flex items-center gap-6">
                      <img src={p.imageUrl} className="w-24 h-24 rounded-[1.5rem] object-cover border border-white/10 bg-slate-800" alt="" />
                      <div>
                        <h4 className="text-xl font-display font-bold text-white mb-1">{p.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-light">
                           <span className="flex items-center gap-1"><Boxes size={14} /> {p.stockCount} Assets In Hub</span>
                           <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                           <span className="text-indigo-400 font-bold uppercase tracking-widest text-[9px]">{p.category}</span>
                        </div>
                      </div>
                   </div>
                   
                   {p.isMarketplaceSynced ? (
                      <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                        <CheckCircle size={16} /> Synchronized
                      </span>
                   ) : (
                      <button 
                        disabled={!canPushToMarketplace}
                        onClick={() => onSyncMarketplace?.(p.id)}
                        className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-20 shadow-2xl"
                      >
                        <Rocket size={18} className="text-indigo-600" /> Promote to Market
                      </button>
                   )}
                </div>
              ))}
              {products.filter(p => p.isReceived).length === 0 && (
                <div className="p-20 text-center text-slate-600 font-light border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center gap-4">
                   <LayoutGrid size={48} className="opacity-20" />
                   <p>Acquire and fulfill assets to enable marketplace promotion.</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

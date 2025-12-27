
import React, { useState, useEffect } from 'react';
import { ProductCategory, Product, CreatorStats, ShopSettings } from '../types';
import { generateProductDescription, generateProductImage } from '../services/geminiService';
import BusinessTip from './BusinessTip';
import BusinessMentor from './BusinessMentor';
import { Sparkles, Loader2, Image as ImageIcon, Save, Bot, Cloud, Rocket, Palette, ArrowUpCircle, Globe, CheckCircle, Boxes, Database, ShieldCheck, Tag, LayoutGrid, Info, Layers, Filter } from 'lucide-react';

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
    name: '', price: '', costPrice: '', category: ProductCategory.FASHION, keywords: '', affiliateLink: '', platform: 'Amazon' as 'Amazon' | 'Shein' | 'eBay', description: '', imageUrl: '', additionalImages: [] as string[], videoUrl: '', isReceived: false, marketplaceId: ''
  });

  const handleMagicWrite = async () => {
    if (!formData.name) return;
    setLoading(true);
    const desc = await generateProductDescription(formData.name, formData.category, formData.keywords || 'professional high-end');
    setFormData(prev => ({ ...prev, description: desc }));
    setLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!formData.name) return;
    setImageLoading(true);
    const img = await generateProductImage(formData.name, formData.category, formData.description || 'Professional Product');
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
      asin: formData.platform === 'Amazon' ? formData.marketplaceId : undefined,
      marketplaceId: formData.marketplaceId
    });
    setFormData({ name: '', price: '', costPrice: '', category: ProductCategory.FASHION, keywords: '', affiliateLink: '', platform: 'Amazon', description: '', imageUrl: '', additionalImages: [], videoUrl: '', isReceived: false, marketplaceId: '' });
  };

  const getMarketplaceLabel = () => {
    switch(formData.platform) {
      case 'Amazon': return 'Amazon ASIN';
      case 'eBay': return 'eBay Item ID';
      case 'Shein': return 'Shein Product Code';
      default: return 'Product ID';
    }
  };

  return (
    <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative bg-white/[0.01]">
      <BusinessMentor isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} onAddChallenge={() => {}} />
      
      <button onClick={() => setIsMentorOpen(true)} className="fixed bottom-10 right-10 z-50 bg-white text-black p-5 rounded-3xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform group border border-white/10">
        <Bot size={24} className="text-indigo-600" />
        <span className="text-xs font-black uppercase tracking-widest pr-2">Executive Advisor</span>
      </button>

      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-10 min-w-max">
          <button onClick={() => setActiveAdminTab('inventory')} className={`pb-6 px-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${activeAdminTab === 'inventory' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Inventory Ops</button>
          <button onClick={() => setActiveAdminTab('marketplace')} className={`pb-6 px-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${activeAdminTab === 'marketplace' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Marketplace Sync</button>
          <button onClick={() => setActiveAdminTab('brand')} className={`pb-6 px-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${activeAdminTab === 'brand' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Org Settings</button>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${dbConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
           <Cloud size={12} className={dbConnected ? 'animate-pulse' : ''} />
           {dbConnected ? 'System Online' : 'Cloud Offline'}
        </div>
      </div>

      {activeAdminTab === 'inventory' && (
        <form onSubmit={handleSubmit} className="animate-fadeIn space-y-12">
           <div className="flex justify-between items-center">
             <div className="space-y-1">
               <h3 className="text-4xl font-display font-bold text-white tracking-tight">Asset Onboarding</h3>
               <p className="text-slate-500 text-sm">Define strategic inventory across verified global marketplaces.</p>
             </div>
             <BusinessTip title="Market Categorization" content="Assigning categories ensures products appear in the correct 'Aisles' on the public storefront." />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Marketplace</label>
                    <select 
                      value={formData.platform} 
                      onChange={e => setFormData({...formData, platform: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white appearance-none"
                    >
                      <option value="Amazon">Amazon</option>
                      <option value="Shein">Shein</option>
                      <option value="eBay">eBay</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Department</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white appearance-none"
                    >
                      {Object.values(ProductCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Asset Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Product Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white font-medium" />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Retail Target ($)</label>
                 <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{getMarketplaceLabel()}</label>
                 <input type="text" value={formData.marketplaceId} onChange={e => setFormData({...formData, marketplaceId: e.target.value})} placeholder="ID / SKU" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white font-mono" />
              </div>
           </div>

           <div className="space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Affiliate Landing URL</label>
                 <input type="url" value={formData.affiliateLink} onChange={e => setFormData({...formData, affiliateLink: e.target.value})} placeholder="Paste your affiliate link here..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 text-sm" />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Market Positioning (Bio)</label>
                 <div className="relative">
                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 outline-none focus:border-indigo-500 h-40 text-slate-300 font-light leading-relaxed" placeholder="Detailed marketing copy..." />
                    <button type="button" onClick={handleMagicWrite} className="absolute bottom-4 right-4 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-xl">
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Generate Pitch
                    </button>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Asset Imagery</label>
                 <div className="flex gap-4">
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="Image Source URL" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white" />
                    <button type="button" onClick={handleGenerateImage} className="bg-white/10 text-white px-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                      {imageLoading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                    </button>
                 </div>
              </div>
           </div>

           <button type="submit" className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-3xl hover:bg-slate-200 transition-all flex items-center justify-center gap-4 group">
             <Database size={24} className="text-indigo-600" /> Commit to Ledger
           </button>
        </form>
      )}

      {activeAdminTab === 'brand' && (
        <div className="animate-fadeIn space-y-12">
           <div className="glass-card p-12 rounded-[3rem] border border-white/10 space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-3xl font-display font-bold text-white flex items-center gap-4 mb-2">
                     <Layers className="text-indigo-400" /> Global Integration Hub
                  </h3>
                  <p className="text-slate-500 text-sm">Configure your family organization's affiliate signatures.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Enterprise Title</label>
                   <input 
                     type="text" 
                     value={settingsForm.storeName}
                     onChange={e => setSettingsForm({...settingsForm, storeName: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-white font-bold"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Amazon Associate Tag</label>
                   <input 
                     type="text" 
                     value={settingsForm.amazonAffiliateTag || ''}
                     onChange={e => setSettingsForm({...settingsForm, amazonAffiliateTag: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 font-mono"
                     placeholder="e.g. enterprise-20"
                   />
                </div>
              </div>

              <button 
                onClick={() => onUpdateShopSettings(settingsForm)}
                className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-3xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-4"
              >
                <Save size={24} /> Deploy Enterprise Updates
              </button>
           </div>
        </div>
      )}

      {activeAdminTab === 'marketplace' && (
        <div className="animate-fadeIn space-y-12 text-center py-20">
           <Rocket size={64} className="mx-auto text-slate-700 mb-6" />
           <h3 className="text-3xl font-display font-bold text-white">Marketplace Promotion</h3>
           <p className="text-slate-500 max-w-xl mx-auto">Promote fulfilled incubator assets to the public storefront to generate external revenue.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

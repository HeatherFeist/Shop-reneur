
import React, { useState, useEffect } from 'react';
import { ProductCategory, Product, CreatorStats, ShopSettings, SaleRecord } from '../types';
import { generateProductDescription, generateProductImage } from '../services/geminiService';
import BusinessTip from './BusinessTip';
import BusinessMentor from './BusinessMentor';
import { Sparkles, Plus, Loader2, Image as ImageIcon, Save, Bot, Cloud, Rocket, Layout, Palette, ArrowUpCircle, ShoppingBag, CheckCircle, Globe } from 'lucide-react';

interface AdminPanelProps {
  onAddProduct: (product: Product | Product[]) => void;
  productToEdit?: Product | null;
  onUpdateProduct?: (product: Product) => void;
  onCancelEdit?: () => void;
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
  productToEdit, 
  onUpdateProduct, 
  onCancelEdit,
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
    name: '', price: '', costPrice: '', category: ProductCategory.FASHION, keywords: '', affiliateLink: 'https://amazon.com', platform: 'Amazon' as 'Amazon' | 'Shein', description: '', imageUrl: '', additionalImages: [] as string[], videoUrl: '', isReceived: false
  });

  const handleMagicWrite = async () => {
    if (!formData.name) return;
    setLoading(true);
    const desc = await generateProductDescription(formData.name, formData.category, formData.keywords || 'trendy');
    setFormData(prev => ({ ...prev, description: desc }));
    setLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!formData.name) return;
    setImageLoading(true);
    const img = await generateProductImage(formData.name, formData.category, formData.description || 'Product');
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
      isReceived: false
    });
    setFormData({ name: '', price: '', costPrice: '', category: ProductCategory.FASHION, keywords: '', affiliateLink: 'https://amazon.com', platform: 'Amazon', description: '', imageUrl: '', additionalImages: [], videoUrl: '', isReceived: false });
  };

  const canPushToMarketplace = creatorStats.level === 'Influencer' || creatorStats.level === 'Viral Icon' || creatorStats.level === 'Empire Builder';

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative">
      <BusinessMentor isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} onAddChallenge={() => {}} />
      
      <button onClick={() => setIsMentorOpen(true)} className="fixed bottom-10 right-10 z-50 bg-indigo-950 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform group">
        <Bot size={24} className="text-indigo-400" />
        <span className="text-sm font-bold pr-2">Org Mentor</span>
      </button>

      <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-8">
          <button onClick={() => setActiveAdminTab('inventory')} className={`pb-4 px-2 font-bold text-sm transition-all ${activeAdminTab === 'inventory' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Incubator Stock</button>
          <button onClick={() => setActiveAdminTab('marketplace')} className={`pb-4 px-2 font-bold text-sm transition-all ${activeAdminTab === 'marketplace' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Marketplace Sync</button>
          <button onClick={() => setActiveAdminTab('brand')} className={`pb-4 px-2 font-bold text-sm transition-all ${activeAdminTab === 'brand' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Branding</button>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${dbConnected ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
           <Cloud size={12} className={dbConnected ? 'animate-pulse' : ''} />
           {dbConnected ? 'Connected' : 'Offline'}
        </div>
      </div>

      {activeAdminTab === 'inventory' && (
        <form onSubmit={handleSubmit} className="animate-fadeIn space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-2xl font-display font-bold text-slate-900">Add New Assets</h3>
             <BusinessTip title="Marketplace Tip" content="Items that perform well in the incubator are eligible for the main Constructive Designs Marketplace once you hit Level 3!" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Product Name" className="px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-medium" />
              <div className="flex gap-4">
                 <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Target Sell Price" className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                 <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} placeholder="Acquisition Cost" className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex gap-4">
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none h-32" placeholder="Professional product description..." />
                <button type="button" onClick={handleMagicWrite} className="bg-indigo-50 text-indigo-600 px-6 rounded-2xl font-bold hover:bg-indigo-100 transition-colors shadow-sm">{loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}</button>
              </div>
              <div className="flex gap-4">
                <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="Master Image URL" className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                <button type="button" onClick={handleGenerateImage} className="bg-slate-50 text-slate-600 px-6 rounded-2xl font-bold hover:bg-slate-100 transition-colors shadow-sm">{imageLoading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}</button>
              </div>
           </div>

           <button type="submit" className="w-full bg-indigo-950 text-white py-5 rounded-[2rem] font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-900 transition-all active:scale-95">
             <Plus size={24} />
             Save to Org Wishlist
           </button>
        </form>
      )}

      {activeAdminTab === 'marketplace' && (
        <div className="animate-fadeIn space-y-8">
           <div className="bg-indigo-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold mb-4 flex items-center gap-3">
                  <Globe className="text-indigo-400" /> Constructive Marketplace
                </h3>
                <p className="opacity-80 max-w-lg mb-6 leading-relaxed">
                  Promote your successful incubator products to our organization's global marketplace and auction platform.
                </p>
                {!canPushToMarketplace && (
                  <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/20">
                     <Rocket size={14} className="text-indigo-400" /> Level 3 (Influencer) Required to Sync
                  </div>
                )}
              </div>
              <ArrowUpCircle size={200} className="absolute -right-10 -bottom-10 opacity-10" />
           </div>

           <div className="space-y-4">
              {products.filter(p => p.stockCount && p.stockCount > 0).map(p => (
                <div key={p.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                   <div className="flex items-center gap-4">
                      <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover bg-white shadow-sm" alt="" />
                      <div>
                        <h4 className="font-bold text-slate-900">{p.name}</h4>
                        <p className="text-xs text-slate-500">{p.stockCount} Units in Incubator</p>
                      </div>
                   </div>
                   
                   {p.isMarketplaceSynced ? (
                      <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold">
                        <CheckCircle size={14} /> Synced to Marketplace
                      </span>
                   ) : (
                      <button 
                        disabled={!canPushToMarketplace}
                        onClick={() => onSyncMarketplace?.(p.id)}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-indigo-600 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:border-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
                      >
                        <Rocket size={16} /> Promote to Platform
                      </button>
                   )}
                </div>
              ))}
              {products.filter(p => p.stockCount && p.stockCount > 0).length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold italic">Stock some inventory to begin promotions.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeAdminTab === 'brand' && (
        <div className="animate-fadeIn space-y-10">
           <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
                 <Palette className="text-indigo-600" /> Branding Config
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase tracking-widest text-slate-400">Portal Name</label>
                   <input 
                     type="text" 
                     value={settingsForm.storeName}
                     onChange={e => setSettingsForm({...settingsForm, storeName: e.target.value})}
                     className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase tracking-widest text-slate-400">Platform Primary Color</label>
                   <div className="flex gap-4">
                      <input 
                        type="color" 
                        value={settingsForm.primaryColor}
                        onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})}
                        className="h-14 w-20 rounded-xl bg-white p-1 border border-slate-200"
                      />
                      <input 
                        type="text" 
                        value={settingsForm.primaryColor}
                        onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})}
                        className="flex-1 px-6 rounded-2xl bg-white border border-slate-200 font-mono text-sm"
                      />
                   </div>
                </div>
              </div>

              <button 
                onClick={() => onUpdateShopSettings(settingsForm)}
                className="mt-10 w-full bg-black text-white py-5 rounded-[2rem] font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all"
              >
                <Save size={24} /> Update Global Platform Theme
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

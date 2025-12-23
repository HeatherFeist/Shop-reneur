
import React, { useState, useRef, useEffect } from 'react';
import { ProductCategory, Product, DailyContent, CreatorStats, ContentPrompt, ShopSettings, SaleRecord, SocialPlatform } from '../types';
import { generateProductDescription, generateProductImage, searchTrendingProducts } from '../services/geminiService';
import BusinessTip from './BusinessTip';
import BusinessMentor from './BusinessMentor';
import { Sparkles, Plus, Loader2, Link as LinkIcon, Upload, Image as ImageIcon, Wand2, Save, X, Lightbulb, ChevronDown, ChevronUp, Megaphone, ShieldCheck, TrendingUp, Video, Tv, Edit2, Trophy, Target, Zap, Palette, Type, Layout, Instagram, Facebook, Smartphone, CheckCircle, DollarSign, Crown, Code, AtSign, Share2, ExternalLink, Check, Calendar, Flame, ShoppingBag, Bot, Lock, Package, ArrowUpCircle, Rocket, FileText, PieChart, Youtube, Link2, BarChart2, Search as SearchIcon, Send, RefreshCcw, Cloud } from 'lucide-react';

interface AdminPanelProps {
  onAddProduct: (product: Product | Product[]) => void;
  productToEdit?: Product | null;
  onUpdateProduct?: (product: Product) => void;
  onCancelEdit?: () => void;
  dailyContent?: DailyContent | null;
  onUpdateDailyContent?: (content: DailyContent) => void;
  creatorStats: CreatorStats;
  onCompleteChallenge: (points: number) => void;
  shopSettings: ShopSettings;
  onUpdateShopSettings: (settings: ShopSettings) => void;
  onUpgradeTier?: () => void;
  products: Product[];
  onRecordSale?: (productName: string, price: number) => void;
  onSellProduct?: (productId: string, price: number) => void;
  salesHistory?: SaleRecord[];
  dbConnected?: boolean;
}

const THEME_PRESETS = [
  { name: 'Coquette Dream', primary: '#ec4899', secondary: '#fbcfe8', bg: '#fff1f2', heading: 'Playfair Display', body: 'Quicksand' },
  { name: 'Y2K Cyber', primary: '#d946ef', secondary: '#06b6d4', bg: '#0f172a', heading: 'Orbitron', body: 'Inter' },
  { name: 'Clean Girl', primary: '#78716c', secondary: '#a8a29e', bg: '#fafaf9', heading: 'Montserrat', body: 'Lato' },
  { name: 'Dark Academia', primary: '#713f12', secondary: '#a16207', bg: '#fffbeb', heading: 'Merriweather', body: 'Open Sans' }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onAddProduct, 
  productToEdit, 
  onUpdateProduct, 
  onCancelEdit,
  dailyContent,
  onUpdateDailyContent,
  creatorStats,
  onCompleteChallenge,
  shopSettings,
  onUpdateShopSettings,
  onUpgradeTier,
  products,
  onRecordSale,
  onSellProduct,
  salesHistory = [],
  dbConnected = false
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'brand' | 'finance'>('inventory');
  const [settingsForm, setSettingsForm] = useState<ShopSettings>(shopSettings);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isScouting, setIsScouting] = useState(false);
  const [scoutQuery, setScoutQuery] = useState('');
  const [scoutResults, setScoutResults] = useState<any[]>([]);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);

  useEffect(() => { setSettingsForm(shopSettings); }, [shopSettings]);

  useEffect(() => {
    if (productToEdit) {
      setActiveAdminTab('inventory');
      setFormData({
        name: productToEdit.name,
        price: productToEdit.price.toString(),
        costPrice: productToEdit.costPrice?.toString() || '',
        category: productToEdit.category,
        keywords: '', 
        affiliateLink: productToEdit.affiliateLink,
        platform: productToEdit.platform,
        description: productToEdit.description,
        imageUrl: productToEdit.imageUrl,
        additionalImages: productToEdit.additionalImages || [],
        videoUrl: productToEdit.videoUrl || '',
        isReceived: productToEdit.isReceived || false
      });
    }
  }, [productToEdit]);

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
    if (productToEdit && onUpdateProduct) {
      onUpdateProduct({
        ...productToEdit,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        category: formData.category as ProductCategory,
        description: formData.description,
        imageUrl: formData.imageUrl,
        additionalImages: formData.additionalImages,
        videoUrl: formData.videoUrl,
        affiliateLink: formData.affiliateLink,
        platform: formData.platform,
        isReceived: formData.isReceived
      });
      onCancelEdit?.();
    } else {
      onAddProduct({
        id: Date.now().toString(),
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        category: formData.category as ProductCategory,
        description: formData.description,
        imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name}/400/500`,
        additionalImages: formData.additionalImages,
        videoUrl: formData.videoUrl,
        affiliateLink: formData.affiliateLink,
        platform: formData.platform,
        isWishlist: true,
        isReceived: false
      });
    }
    setFormData({ name: '', price: '', costPrice: '', category: ProductCategory.FASHION, keywords: '', affiliateLink: 'https://amazon.com', platform: 'Amazon', description: '', imageUrl: '', additionalImages: [], videoUrl: '', isReceived: false });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-purple-100 relative">
      <BusinessMentor isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} onAddChallenge={() => {}} />
      
      <button onClick={() => setIsMentorOpen(true)} className="fixed bottom-6 right-6 z-40 bg-black text-white p-3 rounded-full shadow-lg flex items-center gap-2 group">
        <Bot size={20} className="text-green-400" />
        <span className="hidden group-hover:inline pr-2 text-sm font-bold">Ask Mentor</span>
      </button>

      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          <button onClick={() => setActiveAdminTab('inventory')} className={`pb-3 px-2 font-bold text-sm ${activeAdminTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Inventory</button>
          <button onClick={() => setActiveAdminTab('finance')} className={`pb-3 px-2 font-bold text-sm ${activeAdminTab === 'finance' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Finance</button>
          <button onClick={() => setActiveAdminTab('brand')} className={`pb-3 px-2 font-bold text-sm ${activeAdminTab === 'brand' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Brand Design</button>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${dbConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
           <Cloud size={12} className={dbConnected ? 'animate-pulse' : ''} />
           {dbConnected ? 'Cloud Sync Active' : 'Offline Mode'}
        </div>
      </div>

      {activeAdminTab === 'inventory' && (
        <form onSubmit={handleSubmit} className="animate-fadeIn space-y-6">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-800">{productToEdit ? 'Edit Item' : 'Add to Wishlist'}</h3>
             <BusinessTip title="Inventory Tip" content="Always add items to your Wishlist first! Once a sponsor (like Mom) gifts it, you can move it to 'Stock' and start making profit." />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Product Name" className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
              <div className="flex gap-2">
                 <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Sell Price" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                 <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} placeholder="Amazon Cost" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex gap-2">
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="Description..." />
                <button type="button" onClick={handleMagicWrite} className="bg-purple-100 text-purple-700 px-4 rounded-xl font-bold">{loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}</button>
              </div>
              <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="Image URL" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
              <div className="flex gap-2">
                <input type="url" value={formData.affiliateLink} onChange={e => setFormData({...formData, affiliateLink: e.target.value})} placeholder="Amazon Link" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" />
                <button type="button" onClick={handleGenerateImage} className="bg-blue-100 text-blue-700 px-4 rounded-xl font-bold">{imageLoading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}</button>
              </div>
           </div>

           <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2">
             {productToEdit ? <Save size={20} /> : <Plus size={20} />}
             {productToEdit ? 'Update Item' : 'Add to Wishlist'}
           </button>
           {productToEdit && <button type="button" onClick={onCancelEdit} className="w-full py-2 text-gray-400 font-bold">Cancel Edit</button>}
        </form>
      )}

      {/* Brand Tab Placeholder */}
      {activeAdminTab === 'brand' && (
        <div className="animate-fadeIn p-4 text-center text-gray-400 font-medium">Brand Customization active once Cloud Sync is live! ✨</div>
      )}

      {/* Finance Tab Placeholder */}
      {activeAdminTab === 'finance' && (
        <div className="animate-fadeIn p-4 text-center text-gray-400 font-medium">Finance tracking requires an active database connection. 💰</div>
      )}
    </div>
  );
};

export default AdminPanel;

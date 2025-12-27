
import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, CreatorStats, ShopSettings, UserProfile, Message } from './types';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';
import CartDrawer from './components/CartDrawer';
import VirtualTryOn from './components/VirtualTryOn';
import CommunityLobby from './components/CommunityLobby';
import DirectMessages from './components/DirectMessages';
import { dbService } from './services/dbService';
import { supabaseUrl } from './services/supabaseClient';
import { 
  ShoppingBag, 
  LayoutGrid, 
  MessageCircle, 
  UserPlus, 
  Users, 
  Box, 
  Lock, 
  Store, 
  ChevronRight, 
  ArrowLeft, 
  UserCheck, 
  ArrowRight,
  ShieldCheck,
  User,
  Settings,
  Monitor,
  Search,
  CheckCircle2,
  X,
  CreditCard
} from 'lucide-react';

const INITIAL_SETTINGS: ShopSettings = {
  storeName: "Enterprise Hub",
  tagline: "Curated Professional Assets",
  heroHeadline: "Professional Infrastructure",
  heroSubtext: "Building generational wealth through curated affiliate storefronts and strategic asset management.",
  primaryColor: "#6366f1", 
  secondaryColor: "#8b5cf6", 
  backgroundColor: "#020617", 
  fontHeading: 'Playfair Display',
  fontBody: 'Inter',
  amazonAffiliateTag: 'family-biz-20'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Portal Interaction State
  const [searchStoreName, setSearchStoreName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Owner' | 'Shopper'>('Shopper');
  const [foundProfile, setFoundProfile] = useState<UserProfile | null>(null);

  // General UI State
  const [activeTab, setActiveTab] = useState<'shop' | 'tryon' | 'admin' | 'community' | 'messages'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Amazon' | 'Shein' | 'eBay'>('All');

  const isConfigured = !supabaseUrl.includes("your-project-id");

  useEffect(() => {
    if (!isConfigured) return;
    const productsChannel = dbService.subscribeToProducts(setProducts);
    const settingsChannel = dbService.subscribeToSettings(setShopSettings);
    const messagesChannel = dbService.subscribeToMessages(setAllMessages);
    const profilesChannel = dbService.subscribeToProfiles((p) => {
      setProfiles(p);
      setIsDbConnected(true);
      setIsInitialized(true);
    });
    return () => {
      productsChannel.unsubscribe();
      settingsChannel.unsubscribe();
      messagesChannel.unsubscribe();
      profilesChannel.unsubscribe();
    };
  }, [isConfigured]);

  // Real-time Store Search Engine
  useEffect(() => {
    if (searchStoreName.trim().length > 1) {
      const match = profiles.find(p => 
        p.name.toLowerCase().includes(searchStoreName.toLowerCase()) || 
        p.handle.toLowerCase().includes(searchStoreName.toLowerCase())
      );
      setFoundProfile(match || null);
    } else {
      setFoundProfile(null);
    }
  }, [searchStoreName, profiles]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', shopSettings.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', shopSettings.secondaryColor);
    document.documentElement.style.setProperty('--color-background', shopSettings.backgroundColor);
    document.documentElement.style.setProperty('--font-heading', shopSettings.fontHeading);
    document.documentElement.style.setProperty('--font-body', shopSettings.fontBody);
    document.title = `${shopSettings.storeName}`;
  }, [shopSettings]);

  const handleAccessHub = () => {
    if (!foundProfile) {
      alert("Verification Error: Please search for and select a valid Enterprise first.");
      return;
    }

    if (selectedRole === 'Owner') {
      const pass = prompt(`Management Authentication Required for: ${foundProfile.name}. Please enter your access key:`);
      if (pass === foundProfile.password) {
        setCurrentUser(foundProfile);
      } else {
        alert("Authentication Failed: Invalid management credentials.");
      }
    } else {
      // Direct Shopper Access
      setCurrentUser({ 
        ...foundProfile, 
        role: 'Shopper', 
        id: 'customer_' + Date.now(), 
        name: 'Public Customer' 
      });
    }
  };

  const handleBuildProfile = async () => {
    const name = prompt("Enter the name for this Enterprise Identity (e.g. Heather Feist):");
    if (!name) return;
    const password = prompt("Establish a management password for this Owner identity:") || "";
    const handle = name.toLowerCase().replace(/\s/g, '_') + Math.floor(Math.random() * 100);
    
    const newProfile: Partial<UserProfile> = {
      name,
      handle,
      role: 'Owner',
      password,
      bio: `Executive Identity Hub for ${name}'s Enterprise storefront.`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    try {
      await dbService.upsertProfile(newProfile);
      alert("Profile Successfully Built! You can now access your storefront by searching for this name.");
      setSearchStoreName(name); // Auto-populate search to show success
    } catch (e) {
      alert("System Error: Profile creation failed. Please check your cloud connection.");
    }
  };

  const handleUpdateShopSettings = async (settings: ShopSettings) => {
    await dbService.updateSettings(settings);
  };

  const handleAddProduct = async (productOrProducts: Product | Product[]) => {
    const items = Array.isArray(productOrProducts) ? productOrProducts : [productOrProducts];
    for (const item of items) { await dbService.saveProduct(item); }
  };

  const handleSyncToMarketplace = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      await dbService.saveProduct({ ...product, isMarketplaceSynced: true });
    }
  };

  const handlePurchaseComplete = async (itemIds: string[]) => {
    for (const id of itemIds) {
      const product = products.find(p => p.id === id);
      if (product) {
        await dbService.saveProduct({ ...product, isReceived: true, isWishlist: false });
      }
    }
    setCart([]);
  };

  const filteredProducts = platformFilter === 'All' ? products : products.filter(p => p.platform === platformFilter);
  const categorizedProducts = Object.values(ProductCategory).map(cat => ({
    category: cat,
    items: filteredProducts.filter(p => p.category === cat)
  })).filter(group => group.items.length > 0);

  // PORTAL UI: STORE SEARCH & ROLE SELECTION
  if (!currentUser && isInitialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-violet-600/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>

        <div className="max-w-7xl w-full glass-card rounded-[5rem] p-10 md:p-24 space-y-16 relative z-10 border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
          
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter leading-none">Enterprise Portal</h1>
            <p className="text-slate-500 text-xl font-light max-w-2xl mx-auto italic">Strategic access for business owners and valued customers.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            
            {/* LEFT COLUMN: THE ENTERPRISE (SEARCH) */}
            <div className="flex flex-col space-y-10 bg-white/[0.03] p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg shadow-indigo-600/20">
                      <Search size={28} />
                   </div>
                   <div>
                     <h3 className="text-3xl font-display font-bold text-white">Find Enterprise</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Search Verification Hub</p>
                   </div>
                </div>

                <div className="relative group">
                  <input 
                    type="text" 
                    value={searchStoreName}
                    onChange={(e) => setSearchStoreName(e.target.value)}
                    placeholder="Search Store (e.g. Heather Feist)..." 
                    className="w-full bg-slate-900/50 border-2 border-white/5 rounded-3xl pl-8 pr-8 py-8 outline-none focus:border-indigo-500 text-white text-2xl font-display tracking-wide transition-all shadow-inner placeholder:text-slate-700"
                  />
                </div>

                {foundProfile ? (
                  <div className="flex items-center gap-8 p-8 bg-indigo-600/10 border-2 border-indigo-500/30 rounded-[3rem] animate-fadeIn transition-all shadow-2xl">
                    <img src={foundProfile.avatarUrl} className="w-24 h-24 rounded-[2rem] border-4 border-indigo-500/50 shadow-xl" alt="" />
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <CheckCircle2 size={12} /> Identity Verified
                      </p>
                      <h4 className="text-3xl font-display font-bold text-white leading-none">{foundProfile.name}</h4>
                      <p className="text-xs text-slate-500 mt-2 font-mono">ID: {foundProfile.handle}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-600 border-2 border-dashed border-white/5 rounded-[3rem] space-y-4">
                    <Monitor size={48} className="mx-auto opacity-10" />
                    <p className="text-sm font-light italic max-w-[200px] mx-auto">Awaiting store identification to proceed with access.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: THE IDENTITY (ROLE) */}
            <div className="flex flex-col justify-center space-y-10">
               <div className="flex items-center gap-4 mb-2">
                  <div className="bg-slate-800 p-4 rounded-3xl text-slate-400">
                    <Users size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-display font-bold text-white">Select Identity</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Privilege & Role Assignment</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-8">
                  <button 
                    onClick={() => setSelectedRole('Owner')}
                    className={`group flex items-center gap-8 p-10 rounded-[3.5rem] transition-all text-left border-2 ${selectedRole === 'Owner' ? 'bg-indigo-600 border-indigo-500 shadow-[0_20px_60px_rgba(79,70,229,0.3)] scale-105' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'}`}
                  >
                    <div className={`p-5 rounded-[2rem] transition-all ${selectedRole === 'Owner' ? 'bg-white/20 text-white rotate-6' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                      <Lock size={32} />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">Enterprise Owner</p>
                      <p className={`text-[10px] uppercase font-black tracking-widest mt-1.5 ${selectedRole === 'Owner' ? 'text-indigo-200' : 'text-slate-500'}`}>Full Admin Privileges</p>
                    </div>
                    {selectedRole === 'Owner' && <ArrowRight className="ml-auto text-white/50" size={24} />}
                  </button>

                  <button 
                    onClick={() => setSelectedRole('Shopper')}
                    className={`group flex items-center gap-8 p-10 rounded-[3.5rem] transition-all text-left border-2 ${selectedRole === 'Shopper' ? 'bg-indigo-600 border-indigo-500 shadow-[0_20px_60px_rgba(79,70,229,0.3)] scale-105' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'}`}
                  >
                    <div className={`p-5 rounded-[2rem] transition-all ${selectedRole === 'Shopper' ? 'bg-white/20 text-white rotate-6' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                      <ShoppingBag size={32} />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">Public Customer</p>
                      <p className={`text-[10px] uppercase font-black tracking-widest mt-1.5 ${selectedRole === 'Shopper' ? 'text-indigo-200' : 'text-slate-500'}`}>General Market Access</p>
                    </div>
                    {selectedRole === 'Shopper' && <ArrowRight className="ml-auto text-white/50" size={24} />}
                  </button>
               </div>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-col items-center gap-12">
            <button 
              onClick={handleAccessHub}
              disabled={!foundProfile}
              className="w-full max-w-2xl bg-white text-black py-8 rounded-[3rem] text-xl font-black uppercase tracking-[0.3em] shadow-3xl hover:bg-slate-200 transition-all flex items-center justify-center gap-6 disabled:opacity-10 active:scale-95 group"
            >
              Enter Hub Infrastructure <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
            </button>

             <div className="flex items-center gap-12">
               <button 
                 onClick={handleBuildProfile}
                 className="flex items-center gap-3 text-slate-500 hover:text-indigo-400 transition-all text-xs font-black uppercase tracking-[0.3em] group"
               >
                 <UserPlus size={18} className="group-hover:scale-125 transition-transform" /> Build Your Profile
               </button>
               <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
               <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em]">Secure Session: V2.5.4</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.role === 'Owner';

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-50 glass-nav px-8 h-20 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('shop')}>
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl transition-transform group-hover:scale-110 shadow-lg shadow-indigo-600/20">
            <LayoutGrid size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white leading-none tracking-tight">{shopSettings.storeName}</h1>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5">{shopSettings.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-10 mr-4">
            <button onClick={() => setActiveTab('shop')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'shop' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Storefront</button>
            <button onClick={() => setActiveTab('tryon')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'tryon' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Studio</button>
            {isOwner && <button onClick={() => setActiveTab('community')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'community' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Network</button>}
          </div>
          
          <div className="h-6 w-px bg-white/10"></div>

          {isOwner && (
            <button onClick={() => setActiveTab('messages')} className="relative p-2.5 text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 rounded-xl border border-white/5">
              <MessageCircle size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617]"></span>
            </button>
          )}
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 rounded-xl border border-white/5">
            <ShoppingBag size={20} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">{cart.length}</span>}
          </button>
          
          {isOwner && <button onClick={() => setActiveTab('admin')} className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/10">Dashboard</button>}
          
          <button onClick={() => { setCurrentUser(null); setSearchStoreName(''); }} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
            <Monitor size={18} />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {activeTab === 'shop' && (
          <div className="animate-fadeIn space-y-16">
            <div className="relative glass-card rounded-[4rem] p-16 md:p-24 overflow-hidden border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
               <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-3 mb-8">
                     <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Verified Collection</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 leading-tight tracking-tighter">{shopSettings.heroHeadline}</h2>
                  <p className="text-xl text-slate-400 font-light leading-relaxed mb-12 max-w-2xl">{shopSettings.heroSubtext}</p>
               </div>
            </div>

            <div className="space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                  <div>
                    <h3 className="text-4xl font-display font-bold text-white mb-2">Curated Assets</h3>
                    <p className="text-slate-500 text-sm font-light">Explore validated products by category.</p>
                  </div>
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                     {['All', 'Amazon', 'eBay', 'Shein'].map((p) => (
                       <button key={p} onClick={() => setPlatformFilter(p as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${platformFilter === p ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>{p}</button>
                     ))}
                  </div>
               </div>
               
               {categorizedProducts.map((group) => (
                 <section key={group.category} className="space-y-8 pb-12">
                   <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/5"></div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{group.category}</h4>
                      <div className="h-px flex-1 bg-white/5"></div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {group.items.map(p => (
                      <ProductCard key={p.id} product={p} userRole={isOwner ? 'admin' : 'shopper'} onDelete={dbService.deleteProduct} onAddToCart={(p, type) => { setCart([...cart, { ...p, quantity: 1, orderType: type }]); setIsCartOpen(true); }} />
                    ))}
                   </div>
                 </section>
               ))}
            </div>
          </div>
        )}
        
        {activeTab === 'messages' && currentUser && isOwner && <DirectMessages currentUser={currentUser} allMessages={allMessages} onSendMessage={(text, recipientId) => dbService.sendMessage({ senderId: currentUser.id, recipientId, text, timestamp: Date.now() })} onDeleteMessage={dbService.deleteMessage} otherProfiles={profiles.filter(p => p.id !== currentUser.id)} />}
        {activeTab === 'admin' && isOwner && <AdminPanel shopSettings={shopSettings} onUpdateShopSettings={handleUpdateShopSettings} onAddProduct={handleAddProduct} products={products} creatorStats={{tier: 'Entrepreneur', streak: 1, points: 500, level: 'Influencer', inventoryCount: products.length, subscriptionPlan: 'Elite'}} onCompleteChallenge={() => {}} dbConnected={isDbConnected} onSyncMarketplace={handleSyncToMarketplace} />}
        {activeTab === 'community' && isOwner && <CommunityLobby creatorStats={{tier: 'Entrepreneur', streak: 1, points: 500, level: 'Influencer', inventoryCount: products.length, subscriptionPlan: 'Elite'}} onVote={() => {}} />}
        {activeTab === 'tryon' && <VirtualTryOn products={products} />}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onRemoveItem={(id) => setCart(cart.filter(i => i.id !== id))} shopSettings={shopSettings} userProfile={currentUser || undefined} onPurchaseComplete={handlePurchaseComplete} />

      <footer className="bg-white/[0.02] border-t border-white/5 py-16 px-8 flex flex-col items-center gap-6">
        <div className="bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{isDbConnected ? 'Secure Cloud Hub' : 'Local Archive'}</span>
        </div>
        <p className="text-slate-600 text-sm font-light">Infrastructure v2.5 | Constructive Designs Inc.</p>
      </footer>
    </div>
  );
};

export default App;

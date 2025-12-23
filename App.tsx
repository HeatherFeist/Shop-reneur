
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
import { ShoppingBag, LayoutGrid, MessageCircle, UserPlus, Database, CheckCircle, Briefcase, Users, Rocket, Target, Box, Sparkles } from 'lucide-react';

const INITIAL_SETTINGS: ShopSettings = {
  storeName: "Family Incubator",
  tagline: "A Collective Enterprise Initiative",
  heroHeadline: "Modern Entrepreneurship",
  heroSubtext: "The professional springboard for the next generation of digital leaders and founders.",
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

  // UI State
  const [activeTab, setActiveTab] = useState<'shop' | 'tryon' | 'admin' | 'community' | 'messages'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

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

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', shopSettings.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', shopSettings.secondaryColor);
    document.documentElement.style.setProperty('--color-background', shopSettings.backgroundColor);
    document.documentElement.style.setProperty('--font-heading', shopSettings.fontHeading);
    document.documentElement.style.setProperty('--font-body', shopSettings.fontBody);
    document.title = `${shopSettings.storeName}`;
  }, [shopSettings]);

  const handleCreateProfile = async (name: string, role: any) => {
    const handle = name.toLowerCase().replace(/\s/g, '_') + Math.floor(Math.random() * 100);
    const newProfile: Partial<UserProfile> = {
      name,
      handle,
      role,
      bio: `Lead Partner at ${shopSettings.storeName}.`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    await dbService.upsertProfile(newProfile);
    const updated = await dbService.getProfiles();
    const created = updated.find(p => p.handle === handle);
    if (created) setCurrentUser(created);
  };

  const handleSendMessage = async (text: string, recipientId: string) => {
    if (!currentUser) return;
    await dbService.sendMessage({ senderId: currentUser.id, recipientId: recipientId, text, timestamp: Date.now() });
  };

  const handleSyncToMarketplace = async (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (p) {
      await dbService.saveProduct({ ...p, isMarketplaceSynced: true });
    }
  };

  const handleUpdateShopSettings = async (settings: ShopSettings) => {
    await dbService.updateSettings(settings);
    setShopSettings(settings);
  };

  const handleAddProduct = async (product: Product | Product[]) => {
    const prods = Array.isArray(product) ? product : [product];
    for (const p of prods) {
      await dbService.saveProduct(p);
    }
  };

  const handlePurchaseComplete = (itemIds: string[]) => {
    itemIds.forEach(async id => {
        const p = products.find(prod => prod.id === id);
        if(p) {
          // Marking as received moves it from "Wishlist" to "Acquired Asset"
          await dbService.saveProduct({ ...p, isReceived: true, stockCount: (p.stockCount || 0) + 1 });
        }
    });
    setCart([]);
  };

  if (!currentUser && isInitialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

        <div className="max-w-3xl w-full glass-card rounded-[3rem] p-12 text-center space-y-12 relative z-10 border border-white/5 shadow-2xl">
          <div className="space-y-4">
             <div className="bg-indigo-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto text-white shadow-2xl shadow-indigo-600/20 rotate-3">
                <Briefcase size={44} />
             </div>
             <h1 className="text-5xl font-display font-bold text-white tracking-tight">Enterprise Portal</h1>
             <p className="text-slate-400 text-xl font-light">Select an organizational identity to proceed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {profiles.map(p => (
              <button 
                key={p.id} 
                onClick={() => setCurrentUser(p)}
                className="flex items-center gap-4 p-6 rounded-[2rem] glass-card hover:bg-white/10 transition-all group border border-white/5"
              >
                <img src={p.avatarUrl} className="w-14 h-14 rounded-2xl border border-white/10 bg-slate-800" alt="" />
                <div className="flex-1">
                   <p className="font-bold text-slate-100 text-lg group-hover:text-indigo-400 transition-colors">{p.name}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{p.role}</p>
                </div>
              </button>
            ))}
            
            <button 
              onClick={() => {
                const name = prompt("Full Name:");
                const role = prompt("Organization Role (Mother, Daughter, Board Member, Family):", "Partner");
                if (name) handleCreateProfile(name, role);
              }}
              className="flex items-center justify-center gap-2 p-6 rounded-[2rem] border-2 border-dashed border-white/10 text-slate-500 font-bold hover:text-white hover:border-indigo-500/50 transition-all"
            >
              <UserPlus size={24} />
              Add Identity
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <button onClick={() => setActiveTab('shop')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'shop' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Stock</button>
            <button onClick={() => setActiveTab('community')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'community' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Challenges</button>
            <button onClick={() => setActiveTab('tryon')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'tryon' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Studio</button>
          </div>
          
          <div className="h-6 w-px bg-white/10"></div>

          <button onClick={() => setActiveTab('messages')} className="relative p-2.5 text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 rounded-xl border border-white/5">
            <MessageCircle size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617]"></span>
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 rounded-xl border border-white/5">
            <ShoppingBag size={20} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">{cart.length}</span>}
          </button>
          
          <button onClick={() => setActiveTab('admin')} className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/10">Admin</button>
          
          <button onClick={() => setCurrentUser(null)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
            <Users size={18} />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {activeTab === 'shop' && (
          <div className="animate-fadeIn space-y-16">
            <div className="relative glass-card rounded-[4rem] p-16 md:p-24 overflow-hidden border border-white/5">
               <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-3 mb-8">
                     <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Active Operation</span>
                     <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Real-Time Sync</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 leading-tight tracking-tighter">
                    {shopSettings.heroHeadline}
                  </h2>
                  <p className="text-xl text-slate-400 font-light leading-relaxed mb-12 max-w-2xl">
                    {shopSettings.heroSubtext}
                  </p>
                  <div className="flex gap-4">
                     <button onClick={() => setActiveTab('admin')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-indigo-600/20">
                        Strategic Command <Rocket size={20} />
                     </button>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute -bottom-20 -right-20 opacity-5 rotate-12">
                  <LayoutGrid size={600} />
               </div>
            </div>

            <div className="space-y-8">
               <div className="flex justify-between items-end">
                  <h3 className="text-3xl font-display font-bold text-white">Vetted Inventory</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">{products.length} Assets Tracked</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {products.map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    userRole={currentUser?.role === 'Daughter' || currentUser?.role === 'Mother' ? 'admin' : 'shopper'} 
                    onDelete={dbService.deleteProduct}
                    onAddToCart={(p, type) => {
                      setCart([...cart, { ...p, quantity: 1, orderType: type }]);
                      setIsCartOpen(true);
                    }} 
                  />
                ))}
               </div>
            </div>
          </div>
        )}
        
        {activeTab === 'messages' && currentUser && (
          <DirectMessages 
            currentUser={currentUser} 
            allMessages={allMessages} 
            onSendMessage={handleSendMessage} 
            onDeleteMessage={dbService.deleteMessage}
            otherProfiles={profiles.filter(p => p.id !== currentUser.id)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            shopSettings={shopSettings} 
            onUpdateShopSettings={handleUpdateShopSettings} 
            onAddProduct={handleAddProduct} 
            products={products}
            creatorStats={{tier: 'Entrepreneur', streak: 1, points: 500, level: 'Influencer', inventoryCount: products.length, subscriptionPlan: 'Elite'}}
            onCompleteChallenge={() => {}}
            dbConnected={isDbConnected}
            onSyncMarketplace={handleSyncToMarketplace}
          />
        )}

        {activeTab === 'community' && <CommunityLobby creatorStats={{tier: 'Entrepreneur', streak: 1, points: 500, level: 'Influencer', inventoryCount: products.length, subscriptionPlan: 'Elite'}} onVote={() => {}} />}
        {activeTab === 'tryon' && <VirtualTryOn products={products} />}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        onRemoveItem={(id) => setCart(cart.filter(i => i.id !== id))} 
        shopSettings={shopSettings} 
        userProfile={currentUser || undefined} 
        onPurchaseComplete={handlePurchaseComplete} 
      />

      <footer className="bg-white/[0.02] border-t border-white/5 py-16 px-8 flex flex-col items-center gap-6">
        <div className="bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
             {isDbConnected ? 'Secure Cloud Link Active' : 'Offline Mode'}
           </span>
        </div>
        <p className="text-slate-600 text-sm font-light">Incubator Series Powered by Constructive Designs Inc.</p>
      </footer>
    </div>
  );
};

export default App;

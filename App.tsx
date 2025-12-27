
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
import { ShoppingBag, LayoutGrid, MessageCircle, UserPlus, Database, CheckCircle, Briefcase, Users, Rocket, Target, Box, Sparkles, Filter, Lock, Store, ChevronRight, ArrowLeft } from 'lucide-react';

const INITIAL_SETTINGS: ShopSettings = {
  storeName: "Entrepreneurial Hub",
  tagline: "Curated Professional Assets",
  heroHeadline: "The Future of Commerce",
  heroSubtext: "Building generational wealth through curated affiliate boutiques and strategic asset management.",
  primaryColor: "#6366f1", 
  secondaryColor: "#8b5cf6", 
  backgroundColor: "#020617", 
  fontHeading: 'Playfair Display',
  fontBody: 'Inter',
  amazonAffiliateTag: 'family-biz-20'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile | null>(null);
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

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', shopSettings.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', shopSettings.secondaryColor);
    document.documentElement.style.setProperty('--color-background', shopSettings.backgroundColor);
    document.documentElement.style.setProperty('--font-heading', shopSettings.fontHeading);
    document.documentElement.style.setProperty('--font-body', shopSettings.fontBody);
    document.title = `${shopSettings.storeName}`;
  }, [shopSettings]);

  const handleCreateProfile = async () => {
    const name = prompt("Full Name:");
    if (!name) return;
    const roleChoice = confirm("Is this an Owner account? (Cancel for Shopper/Customer)") ? "Owner" : "Shopper";
    let password = "";
    if (roleChoice === "Owner") {
      password = prompt("Set a password for your Dashboard:") || "";
    }
    
    const handle = name.toLowerCase().replace(/\s/g, '_') + Math.floor(Math.random() * 100);
    const newProfile: Partial<UserProfile> = {
      name,
      handle,
      role: roleChoice as any,
      password: password,
      bio: `${roleChoice} at the Boutique.`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    await dbService.upsertProfile(newProfile);
  };

  const handleLoginAsOwner = (profile: UserProfile) => {
    const pass = prompt(`Enter password for ${profile.name}:`);
    if (pass === profile.password) {
      setCurrentUser(profile);
      setSelectedAdmin(profile);
    } else {
      alert("Invalid password.");
    }
  };

  const filteredProducts = platformFilter === 'All' 
    ? products 
    : products.filter(p => p.platform === platformFilter);

  // Group products by category for the categorized view
  const categorizedProducts = Object.values(ProductCategory).map(cat => ({
    category: cat,
    items: filteredProducts.filter(p => p.category === cat)
  })).filter(group => group.items.length > 0);

  // Fix: Added handleUpdateShopSettings to update organization settings in Supabase.
  const handleUpdateShopSettings = async (settings: ShopSettings) => {
    try {
      await dbService.updateSettings(settings);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  // Fix: Added handleAddProduct to save new product assets to the organization ledger.
  const handleAddProduct = async (productOrProducts: Product | Product[]) => {
    try {
      const items = Array.isArray(productOrProducts) ? productOrProducts : [productOrProducts];
      for (const item of items) {
        await dbService.saveProduct(item);
      }
    } catch (error) {
      console.error("Failed to save products:", error);
    }
  };

  // Fix: Added handleSyncToMarketplace to mark products as synced with external platforms.
  const handleSyncToMarketplace = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        await dbService.saveProduct({ ...product, isMarketplaceSynced: true });
      }
    } catch (error) {
      console.error("Failed to sync marketplace:", error);
    }
  };

  // Fix: Added handlePurchaseComplete to finalize acquisition and update local inventory status.
  const handlePurchaseComplete = async (itemIds: string[]) => {
    try {
      for (const id of itemIds) {
        const product = products.find(p => p.id === id);
        if (product) {
          // Mark as received and no longer just on wishlist
          await dbService.saveProduct({ ...product, isReceived: true, isWishlist: false });
        }
      }
      setCart([]);
    } catch (error) {
      console.error("Failed to complete purchase:", error);
    }
  };

  // PORTAL VIEW (Step 1: Pick Admin, Step 2: Pick Role)
  if (!currentUser && isInitialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

        <div className="max-w-4xl w-full glass-card rounded-[4rem] p-12 md:p-16 text-center space-y-12 relative z-10 border border-white/5 shadow-3xl">
          {!selectedAdmin ? (
            <div className="animate-fadeIn space-y-12">
              <div className="space-y-4">
                 <div className="bg-indigo-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto text-white shadow-2xl shadow-indigo-600/20 rotate-3">
                    <Store size={44} />
                 </div>
                 <h1 className="text-5xl font-display font-bold text-white tracking-tight">Boutique Directory</h1>
                 <p className="text-slate-400 text-xl font-light">Whose store are you visiting today?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {profiles.filter(p => p.role === 'Owner').map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setSelectedAdmin(p)}
                    className="flex items-center gap-4 p-6 rounded-[2.5rem] glass-card hover:bg-white/10 transition-all group border border-white/5"
                  >
                    <img src={p.avatarUrl} className="w-16 h-16 rounded-2xl border border-white/10 bg-slate-800" alt="" />
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-slate-100 text-lg group-hover:text-indigo-400 transition-colors truncate">{p.name}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Boutique</p>
                    </div>
                    <ChevronRight className="text-slate-700 group-hover:text-indigo-400 transition-colors" size={20} />
                  </button>
                ))}
                
                <button 
                  onClick={handleCreateProfile}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-[2.5rem] border-2 border-dashed border-white/10 text-slate-500 font-bold hover:text-white hover:border-indigo-500/50 transition-all bg-white/[0.01]"
                >
                  <UserPlus size={32} />
                  <span className="text-xs uppercase tracking-widest">Register Store</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-12">
               <button onClick={() => setSelectedAdmin(null)} className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                  <ArrowLeft size={16} /> Back to Directory
               </button>

               <div className="space-y-6">
                  <img src={selectedAdmin.avatarUrl} className="w-24 h-24 rounded-3xl mx-auto border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20" alt="" />
                  <div>
                    <h2 className="text-4xl font-display font-bold text-white">{selectedAdmin.name}'s Boutique</h2>
                    <p className="text-slate-400 mt-2">Identify your role to proceed</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <button 
                    onClick={() => handleLoginAsOwner(selectedAdmin)}
                    className="group relative p-10 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all text-center space-y-4"
                  >
                     <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                        <Lock size={28} />
                     </div>
                     <div>
                        <p className="text-xl font-display font-bold text-white">Boutique Owner</p>
                        <p className="text-xs text-indigo-400 uppercase tracking-widest mt-1">Strategic Dashboard</p>
                     </div>
                  </button>

                  <button 
                    onClick={() => {
                      // Shoppers enter freely
                      setCurrentUser({ ...selectedAdmin, role: 'Shopper', name: 'Guest Shopper', id: 'guest' });
                    }}
                    className="group relative p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center space-y-4"
                  >
                     <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-slate-400 shadow-xl group-hover:scale-110 transition-transform">
                        <Users size={28} />
                     </div>
                     <div>
                        <p className="text-xl font-display font-bold text-white">Customer Entry</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Unrestricted Access</p>
                     </div>
                  </button>
               </div>
            </div>
          )}
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
            <button onClick={() => setActiveTab('tryon')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'tryon' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Mirror Studio</button>
            {isOwner && (
              <button onClick={() => setActiveTab('community')} className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'community' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Executive Network</button>
            )}
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
          
          {isOwner && (
            <button onClick={() => setActiveTab('admin')} className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/10">Dashboard</button>
          )}
          
          <button onClick={() => { setCurrentUser(null); setSelectedAdmin(null); }} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
            <Users size={18} />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {activeTab === 'shop' && (
          <div className="animate-fadeIn space-y-16">
            <div className="relative glass-card rounded-[4rem] p-16 md:p-24 overflow-hidden border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
               <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-3 mb-8">
                     <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Official Boutique</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 leading-tight tracking-tighter">
                    {shopSettings.heroHeadline}
                  </h2>
                  <p className="text-xl text-slate-400 font-light leading-relaxed mb-12 max-w-2xl">
                    {shopSettings.heroSubtext}
                  </p>
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
                       <button 
                         key={p} 
                         onClick={() => setPlatformFilter(p as any)}
                         className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${platformFilter === p ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                       >
                         {p}
                       </button>
                     ))}
                  </div>
               </div>
               
               {/* Categorized Product Display */}
               {categorizedProducts.map((group) => (
                 <section key={group.category} className="space-y-8 pb-12">
                   <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/5"></div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{group.category}</h4>
                      <div className="h-px flex-1 bg-white/5"></div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {group.items.map(p => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        userRole={isOwner ? 'admin' : 'shopper'} 
                        onDelete={dbService.deleteProduct}
                        onAddToCart={(p, type) => {
                          setCart([...cart, { ...p, quantity: 1, orderType: type }]);
                          setIsCartOpen(true);
                        }} 
                      />
                    ))}
                   </div>
                 </section>
               ))}

               {filteredProducts.length === 0 && (
                 <div className="col-span-full py-40 text-center glass-card rounded-[3rem] border-dashed border-white/10">
                   <Box size={48} className="mx-auto text-slate-800 mb-6" />
                   <p className="text-slate-600 font-light italic text-xl">The directory is currently being updated with new assets.</p>
                 </div>
               )}
            </div>
          </div>
        )}
        
        {activeTab === 'messages' && currentUser && isOwner && (
          <DirectMessages 
            currentUser={currentUser} 
            allMessages={allMessages} 
            onSendMessage={(text, recipientId) => dbService.sendMessage({ senderId: currentUser.id, recipientId, text, timestamp: Date.now() })} 
            onDeleteMessage={dbService.deleteMessage}
            otherProfiles={profiles.filter(p => p.id !== currentUser.id)}
          />
        )}

        {activeTab === 'admin' && isOwner && (
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

        {activeTab === 'community' && isOwner && <CommunityLobby creatorStats={{tier: 'Entrepreneur', streak: 1, points: 500, level: 'Influencer', inventoryCount: products.length, subscriptionPlan: 'Elite'}} onVote={() => {}} />}
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
             {isDbConnected ? 'Secure Cloud Connection' : 'Local Archive Mode'}
           </span>
        </div>
        <p className="text-slate-600 text-sm font-light">Incubator Infrastructure v2.5 | Constructive Designs Inc.</p>
      </footer>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, CreatorStats, ShopSettings, UserProfile, Message } from './types';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';
import CartDrawer from './components/CartDrawer';
import VirtualTryOn from './components/VirtualTryOn';
import CommunityLobby from './components/CommunityLobby';
import DirectMessages from './components/DirectMessages';
import { dbService } from './services/dbService';
import { supabase, supabaseUrl } from './services/supabaseClient';
import { ShoppingBag, Store, MessageCircle, UserPlus, Database, Key, CheckCircle, ExternalLink, Sparkles, Wifi, WifiOff, Users, Briefcase, Heart } from 'lucide-react';

const INITIAL_SETTINGS: ShopSettings = {
  storeName: "Shop'reneur Incubator",
  tagline: "Constructive Designs Inc. Platform",
  heroHeadline: "Build Your Digital Empire",
  heroSubtext: "From wishlist to boutique, and then to the global marketplace.",
  primaryColor: "#0f172a", 
  secondaryColor: "#6366f1", 
  backgroundColor: "#f8fafc", 
  fontHeading: 'Playfair Display',
  fontBody: 'Inter'
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
      bio: `Member of the ${shopSettings.storeName} community.`,
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
      alert("Promoted to Constructive Marketplace! 🚀");
    }
  };

  // Fix: Added handleUpdateShopSettings to resolve compilation error
  const handleUpdateShopSettings = async (settings: ShopSettings) => {
    try {
      await dbService.updateSettings(settings);
      setShopSettings(settings);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  // Fix: Added handleAddProduct to resolve compilation error
  const handleAddProduct = async (product: Product | Product[]) => {
    try {
      const prods = Array.isArray(product) ? product : [product];
      for (const p of prods) {
        await dbService.saveProduct(p);
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center space-y-8">
          <Database size={40} className="mx-auto text-indigo-600" />
          <h1 className="text-3xl font-display font-bold">Connect to Organization Cloud</h1>
          <p className="text-slate-500">Please provide your Supabase keys in <code>supabaseClient.ts</code> to begin.</p>
        </div>
      </div>
    );
  }

  if (!currentUser && isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center space-y-10 border border-slate-100">
          <div className="space-y-4">
             <div className="bg-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-200">
                <Briefcase size={40} />
             </div>
             <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Welcome to the Org Portal</h1>
             <p className="text-slate-500 text-lg">Who is accessing the platform today?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {profiles.map(p => (
              <button 
                key={p.id} 
                onClick={() => setCurrentUser(p)}
                className="flex items-center gap-4 p-5 rounded-3xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <img src={p.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                <div className="flex-1">
                   <p className="font-bold text-slate-900 group-hover:text-indigo-600">{p.name}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.role}</p>
                </div>
              </button>
            ))}
            
            <button 
              onClick={() => {
                const name = prompt("Enter your Name:");
                const role = prompt("Your Role (Board Member, Daughter, Family Member, Sponsor):", "Member");
                if (name) handleCreateProfile(name, role);
              }}
              className="flex items-center justify-center gap-2 p-5 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:bg-slate-50 hover:text-indigo-500 hover:border-indigo-200 transition-all"
            >
              <UserPlus size={20} />
              Add New Member
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-all duration-500 bg-background font-sans">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 h-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('shop')}>
          <div className="bg-indigo-900 text-white p-2.5 rounded-xl">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-slate-900 leading-none">{shopSettings.storeName}</h1>
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Org Platform v3.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex items-center gap-8 mr-6">
            <button onClick={() => setActiveTab('shop')} className={`text-sm font-bold ${activeTab === 'shop' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>The Hub</button>
            <button onClick={() => setActiveTab('community')} className={`text-sm font-bold ${activeTab === 'community' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Org Network</button>
          </div>
          
          <div className="h-8 w-px bg-slate-100 mx-2"></div>

          <button onClick={() => setActiveTab('messages')} className="relative p-2 text-slate-400 hover:text-indigo-600">
            <MessageCircle size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
          </button>
          
          <button onClick={() => setActiveTab('admin')} className="bg-indigo-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-900 shadow-lg shadow-indigo-100">Portal</button>
          
          <button onClick={() => setCurrentUser(null)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
            <Users size={18} />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {activeTab === 'shop' && (
          <div className="animate-fadeIn">
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl mb-16 relative overflow-hidden">
               <div className="relative z-10">
                  <span className="inline-block bg-white/10 backdrop-blur-lg px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border border-white/10 text-indigo-300">Incubator Active</span>
                  <h2 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight leading-tight">{shopSettings.heroHeadline}</h2>
                  <p className="text-xl opacity-70 max-w-2xl font-light leading-relaxed">{shopSettings.heroSubtext}</p>
               </div>
               <div className="absolute -right-20 -bottom-20 opacity-10">
                  <Store size={500} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {products.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  userRole={currentUser?.role === 'Daughter' ? 'admin' : 'shopper'} 
                  onDelete={dbService.deleteProduct}
                  onAddToCart={(p, type) => setCart([...cart, { ...p, quantity: 1, orderType: type }])} 
                />
              ))}
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
            // Fix: Added subscriptionPlan to CreatorStats to resolve type error
            creatorStats={{tier: 'Starter', streak: 1, points: 500, level: 'Influencer', inventoryCount: products.length, subscriptionPlan: 'Elite'}}
            onCompleteChallenge={() => {}}
            dbConnected={isDbConnected}
            onSyncMarketplace={handleSyncToMarketplace}
          />
        )}

        {/* Fix: Added subscriptionPlan to CreatorStats to resolve type error */}
        {activeTab === 'community' && <CommunityLobby creatorStats={{tier: 'Starter', streak: 1, points: 500, level: 'Influencer', inventoryCount: products.length, subscriptionPlan: 'Elite'}} onVote={() => {}} />}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        onRemoveItem={(id) => setCart(cart.filter(i => i.id !== id))} 
        shopSettings={shopSettings} 
        userProfile={currentUser || undefined} 
        onPurchaseComplete={(ids) => {
            ids.forEach(async id => {
                const p = products.find(prod => prod.id === id);
                if(p) await dbService.saveProduct({...p, isReceived: true, stockCount: (p.stockCount || 0) + 1});
            });
            setCart([]);
        }} 
      />

      <footer className="bg-white border-t border-slate-100 py-16 px-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <div className={` px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isDbConnected ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
             {isDbConnected ? '🟢 Platform Sync Active' : '🔴 Sync Interrupted'}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 font-medium tracking-tight">© 2025 Constructive Designs Inc. Professional Incubator Series.</p>
      </footer>
    </div>
  );
};

export default App;

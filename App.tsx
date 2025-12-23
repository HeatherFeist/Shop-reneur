
import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, DailyContent, CreatorStats, ShopSettings, UserProfile, Message } from './types';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';
import CartDrawer from './components/CartDrawer';
import VirtualTryOn from './components/VirtualTryOn';
import CommunityLobby from './components/CommunityLobby';
import DirectMessages from './components/DirectMessages';
import { dbService } from './services/dbService';
import { supabase, supabaseUrl } from './services/supabaseClient';
import { ShoppingBag, Store, MessageCircle, UserPlus, Database, Key, CheckCircle, ExternalLink, Sparkles, Wifi, WifiOff } from 'lucide-react';

const SIM_PROFILES: UserProfile[] = [
  {
    id: 'u1',
    name: "Trin",
    handle: "trinstreasures",
    bio: "Aspiring Teen Boss! 💖",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Trin",
    role: 'Daughter'
  },
  {
    id: 'u2',
    name: "Mom",
    handle: "bossmom",
    bio: "Supporting the hustle! 👑",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mom",
    role: 'Mother'
  }
];

const INITIAL_SETTINGS: ShopSettings = {
  storeName: "Shop'reneur",
  tagline: "Powered by Constructive Designs Inc.",
  heroHeadline: "Launch Your Dream Shop!",
  heroSubtext: "Curate your favorite items, build your brand, and turn your wishlist into a business.",
  primaryColor: "#ec4899", 
  secondaryColor: "#8b5cf6", 
  backgroundColor: "#fdf2f8", 
  fontHeading: 'Playfair Display',
  fontBody: 'Inter',
  amazonAffiliateTag: 'cdi-nonprofit-20'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(SIM_PROFILES[0]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [showLaunchBanner, setShowLaunchBanner] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState<'shop' | 'tryon' | 'admin' | 'community' | 'messages'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const isConfigured = !supabaseUrl.includes("your-project-id");

  useEffect(() => {
    if (!isConfigured) return;

    const productsChannel = dbService.subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setIsDbConnected(true);
    });

    const settingsChannel = dbService.subscribeToSettings((updatedSettings) => {
      setShopSettings(updatedSettings);
    });

    const messagesChannel = dbService.subscribeToMessages((updatedMessages) => {
      setAllMessages(updatedMessages);
    });

    return () => {
      productsChannel.unsubscribe();
      settingsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [isConfigured]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', shopSettings.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', shopSettings.secondaryColor);
    document.documentElement.style.setProperty('--color-background', shopSettings.backgroundColor);
    document.documentElement.style.setProperty('--font-heading', shopSettings.fontHeading);
    document.documentElement.style.setProperty('--font-body', shopSettings.fontBody);
    document.title = `${shopSettings.storeName} | Shop'reneur`;
  }, [shopSettings]);

  const handleSwitchUser = () => {
    const nextIndex = (SIM_PROFILES.findIndex(p => p.id === currentUser.id) + 1) % SIM_PROFILES.length;
    setCurrentUser(SIM_PROFILES[nextIndex]);
  };

  const handleSendMessage = async (text: string, recipientId: string) => {
    await dbService.sendMessage({ senderId: currentUser.id, recipientId: recipientId, text, timestamp: Date.now() });
  };

  const handleDeleteMessage = async (messageId: string) => {
    await dbService.deleteMessage(messageId);
  };

  const handleUpdateShopSettings = async (newSettings: ShopSettings) => {
    await dbService.updateSettings(newSettings);
  };

  const handleAddProduct = async (newProducts: Product | Product[]) => {
    const productsToAdd = Array.isArray(newProducts) ? newProducts : [newProducts];
    for (const p of productsToAdd) {
      await dbService.saveProduct(p);
    }
  };

  const handlePurchaseComplete = async (itemIds: string[]) => {
    for (const id of itemIds) {
      const product = products.find(p => p.id === id);
      if (product) {
        await dbService.saveProduct({
          ...product,
          isReceived: true,
          stockCount: (product.stockCount || 0) + 1
        });
      }
    }
    setCart([]);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-pink-100 text-center space-y-8 animate-fadeIn">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
            <Database size={40} className="text-pink-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-gray-900">Final Step: Connection 🔌</h1>
            <p className="text-gray-500 text-sm">You are so close! We just need to connect the app to your database keys.</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="bg-green-100 text-green-600 p-2 rounded-lg mt-1"><CheckCircle size={18} /></div>
               <div>
                  <h3 className="font-bold text-gray-800 text-sm">Step 1: SQL Setup</h3>
                  <p className="text-[11px] text-gray-500">Success! The database tables were created.</p>
               </div>
            </div>

            <div className="flex gap-4 items-start p-4 bg-pink-50 rounded-2xl border border-pink-100 ring-2 ring-pink-200">
               <div className="bg-pink-100 text-pink-600 p-2 rounded-lg mt-1"><Key size={18} /></div>
               <div className="flex-1">
                  <h3 className="font-bold text-pink-900 text-sm">Step 2: Save the Keys</h3>
                  <p className="text-[11px] text-pink-700 leading-relaxed mb-3">
                    Paste your **Project URL** and **Anon Key** into `services/supabaseClient.ts` in the file list on the left.
                  </p>
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-pink-600 text-white px-3 py-1.5 rounded-full hover:bg-pink-700 transition-colors"
                  >
                    Open Supabase Dashboard <ExternalLink size={10} />
                  </a>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-all duration-500 bg-background font-sans">
      {showLaunchBanner && (
        <div className="bg-black text-white text-[10px] font-bold py-2 text-center flex items-center justify-center gap-2 tracking-widest uppercase">
          <Sparkles size={12} className="text-yellow-400" /> 
          Grand Opening: Welcome to your new Empire!
          <button onClick={() => setShowLaunchBanner(false)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('shop')}>
          <div className="bg-gradient-to-tr from-primary to-secondary text-white p-2 rounded-full shadow-lg shadow-primary/20">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-gray-900 leading-none tracking-tight">{shopSettings.storeName}</h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">{shopSettings.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:flex items-center gap-6 mr-4 border-r border-gray-100 pr-6">
            <button onClick={() => setActiveTab('shop')} className={`text-sm font-bold transition-colors ${activeTab === 'shop' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>Shop</button>
            <button onClick={() => setActiveTab('tryon')} className={`text-sm font-bold transition-colors ${activeTab === 'tryon' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>Try-On</button>
            <button onClick={() => setActiveTab('community')} className={`text-sm font-bold transition-colors ${activeTab === 'community' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>Community</button>
          </div>
          
          <button onClick={handleSwitchUser} className="text-[10px] bg-gray-50 border border-gray-100 px-3 py-2 rounded-full flex items-center gap-2 hover:bg-white transition-all shadow-sm">
            <img src={currentUser.avatarUrl} className="w-5 h-5 rounded-full" alt="" />
            <span className="font-bold text-gray-700 hidden sm:inline">{currentUser.name}</span>
          </button>
          
          <button onClick={() => setActiveTab('messages')} className="relative p-2 text-gray-400 hover:text-primary transition-colors">
            <MessageCircle size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-700 hover:text-primary">
            <ShoppingBag size={22} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white">{cart.length}</span>}
          </button>
          
          <button onClick={() => setActiveTab('admin')} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10">Admin</button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 w-full">
        {activeTab === 'shop' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-primary via-primary to-secondary rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl mb-12 relative overflow-hidden">
               <div className="relative z-10">
                  <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">New Collection Live</span>
                  <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight leading-tight">{shopSettings.heroHeadline}</h2>
                  <p className="text-base md:text-lg opacity-90 max-w-xl font-medium leading-relaxed">{shopSettings.heroSubtext}</p>
               </div>
               <div className="absolute top-0 right-0 p-20 opacity-20 transform translate-x-20 -translate-y-10">
                  <Store size={300} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  userRole={currentUser.role === 'Daughter' ? 'admin' : 'shopper'} 
                  onDelete={dbService.deleteProduct}
                  onAddToCart={(p, type) => setCart([...cart, { ...p, quantity: 1, orderType: type }])} 
                />
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-32 text-center space-y-4 bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <ShoppingBag size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-bold text-lg">Your boutique is empty!</p>
                    <p className="text-gray-400 text-sm">Head to the Admin panel to stock your first item.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'messages' && (
          <DirectMessages 
            currentUser={currentUser} 
            allMessages={allMessages} 
            onSendMessage={handleSendMessage} 
            onDeleteMessage={handleDeleteMessage}
            otherProfiles={SIM_PROFILES.filter(p => p.id !== currentUser.id)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            shopSettings={shopSettings} 
            onUpdateShopSettings={handleUpdateShopSettings} 
            onAddProduct={handleAddProduct} 
            products={products}
            creatorStats={{tier: 'Starter', streak: 1, points: 100, level: 'Rising Star', videosPostedThisWeek: 0, weeklyGoal: 1, nextLevelPoints: 500, subscriptionPlan: 'Free', inventoryCount: products.length}}
            onCompleteChallenge={() => {}}
            dbConnected={isDbConnected}
          />
        )}

        {activeTab === 'tryon' && <VirtualTryOn products={products} />}
        {activeTab === 'community' && <CommunityLobby creatorStats={{tier: 'Starter', streak: 1, points: 100, level: 'Rising Star', videosPostedThisWeek: 0, weeklyGoal: 1, nextLevelPoints: 500, subscriptionPlan: 'Free', inventoryCount: products.length}} onVote={() => {}} />}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        onRemoveItem={(id) => setCart(cart.filter(i => i.id !== id))} 
        shopSettings={shopSettings} 
        userProfile={currentUser} 
        onPurchaseComplete={handlePurchaseComplete} 
      />

      <footer className="bg-white/40 border-t border-gray-100 py-12 px-8 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
           <div className="h-px w-12 bg-gray-200"></div>
           <h2 className="text-sm font-bold text-gray-400 font-display italic tracking-widest">{shopSettings.storeName}</h2>
           <div className="h-px w-12 bg-gray-200"></div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${isDbConnected ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
             {isDbConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
             {isDbConnected ? 'Live System Online' : 'Cloud Offline'}
          </div>
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">v2.0 PROD</span>
        </div>
        
        <p className="text-[10px] text-gray-400 max-w-xs font-medium">
          The ultimate platform for teen entrepreneurs to build their empire. Launching hearts and minds since 2025.
        </p>
      </footer>
    </div>
  );
};

export default App;

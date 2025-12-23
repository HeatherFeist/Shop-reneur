
import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, DailyContent, CreatorStats, ShopSettings, UserProfile, Message } from './types';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';
import CartDrawer from './components/CartDrawer';
import VirtualTryOn from './components/VirtualTryOn';
import CommunityLobby from './components/CommunityLobby';
import DirectMessages from './components/DirectMessages';
import { dbService } from './services/dbService';
import { ShoppingBag, Store, LogOut, MessageCircle, UserPlus, Smartphone } from 'lucide-react';

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

  // UI State
  const [activeTab, setActiveTab] = useState<'shop' | 'tryon' | 'admin' | 'community' | 'messages'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- Real-time Supabase Subscriptions ---
  useEffect(() => {
    // 1. Listen for Product changes
    const productsChannel = dbService.subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });

    // 2. Listen for Shop Settings changes
    const settingsChannel = dbService.subscribeToSettings((updatedSettings) => {
      setShopSettings(updatedSettings);
    });

    // 3. Listen for Messages
    const messagesChannel = dbService.subscribeToMessages((updatedMessages) => {
      setAllMessages(updatedMessages);
    });

    return () => {
      // In Supabase client, we unsubscribe from the channels
      productsChannel.unsubscribe();
      settingsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, []);

  // CSS Variable Sync
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', shopSettings.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', shopSettings.secondaryColor);
    document.documentElement.style.setProperty('--color-background', shopSettings.backgroundColor);
    document.documentElement.style.setProperty('--font-heading', shopSettings.fontHeading);
    document.documentElement.style.setProperty('--font-body', shopSettings.fontBody);
    document.title = `${shopSettings.storeName} | Shop'reneur`;
  }, [shopSettings]);

  // --- Handlers ---
  const handleSwitchUser = () => {
    const nextIndex = (SIM_PROFILES.findIndex(p => p.id === currentUser.id) + 1) % SIM_PROFILES.length;
    setCurrentUser(SIM_PROFILES[nextIndex]);
  };

  const handleSendMessage = async (text: string, recipientId: string) => {
    await dbService.sendMessage({
      senderId: currentUser.id,
      recipientId: recipientId,
      text: text,
      timestamp: Date.now()
    });
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

  return (
    <div className="min-h-screen flex flex-col transition-all duration-500 bg-background">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('shop')}>
          <div className="bg-gradient-to-tr from-primary to-secondary text-white p-2 rounded-full">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-gray-900 leading-none">{shopSettings.storeName}</h1>
            <p className="text-[10px] text-gray-500 font-sans">{shopSettings.tagline}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => setActiveTab('shop')} className={`text-sm font-bold ${activeTab === 'shop' ? 'text-primary' : 'text-gray-500'}`}>Shop</button>
          <button onClick={() => setActiveTab('tryon')} className={`text-sm font-bold ${activeTab === 'tryon' ? 'text-primary' : 'text-gray-500'}`}>Try-On</button>
          <button onClick={() => setActiveTab('community')} className={`text-sm font-bold ${activeTab === 'community' ? 'text-primary' : 'text-gray-500'}`}>Community</button>
          <div className="h-8 w-px bg-gray-200"></div>
          <button onClick={handleSwitchUser} className="text-xs bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-colors">
            <UserPlus size={14} className="text-primary" />
            <span className="font-bold">{currentUser.name} ({currentUser.role})</span>
          </button>
          <button onClick={() => setActiveTab('messages')} className="relative p-2 text-gray-500 hover:text-primary transition-colors">
            <MessageCircle size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-700 hover:text-primary">
            <ShoppingBag size={22} />
            {cart.length > 0 && <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
          </button>
          <button onClick={() => setActiveTab('admin')} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800">Admin</button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {activeTab === 'shop' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white shadow-xl mb-12 relative overflow-hidden">
               <h2 className="text-5xl font-display font-bold mb-4">{shopSettings.heroHeadline}</h2>
               <p className="text-xl opacity-90 max-w-2xl">{shopSettings.heroSubtext}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  userRole={currentUser.role === 'Daughter' ? 'admin' : 'shopper'} 
                  onDelete={dbService.deleteProduct}
                  onAddToCart={(p, type) => setCart([...cart, { ...p, quantity: 1, orderType: type }])} 
                />
              ))}
              {products.length === 0 && <div className="col-span-full py-20 text-center text-gray-400">Shop is empty. Connect Supabase and run the SQL schema!</div>}
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
            creatorStats={{tier: 'Starter', streak: 0, points: 0, level: 'Newbie', videosPostedThisWeek: 0, weeklyGoal: 1, nextLevelPoints: 500, subscriptionPlan: 'Free', inventoryCount: 0}}
            onCompleteChallenge={() => {}}
          />
        )}

        {activeTab === 'tryon' && <VirtualTryOn products={products} />}
        {activeTab === 'community' && <CommunityLobby creatorStats={{tier: 'Starter', streak: 0, points: 0, level: 'Newbie', videosPostedThisWeek: 0, weeklyGoal: 1, nextLevelPoints: 500, subscriptionPlan: 'Free', inventoryCount: 0}} onVote={() => {}} />}
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

      <footer className="bg-white/50 border-t border-gray-100 p-8 text-center text-sm text-gray-500 font-sans">
        <p>© 2025 {shopSettings.storeName}. Real-time Supabase Sync Active.</p>
      </footer>
    </div>
  );
};

export default App;

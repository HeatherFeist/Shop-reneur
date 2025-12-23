
import React, { useState } from 'react';
import { CartItem, ShopSettings, UserProfile } from '../types';
import { X, ShoppingBag, ExternalLink, Trash2, Gift, ShieldCheck, CheckCircle, Loader2, ArrowRight, ShoppingCart } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  shopSettings: ShopSettings;
  userProfile?: UserProfile;
  onPurchaseComplete?: (itemIds: string[]) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  shopSettings, 
  onPurchaseComplete 
}) => {
  const [view, setView] = useState<'cart' | 'transferring' | 'confirm' | 'success'>('cart');
  
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const giftItems = cartItems.filter(item => item.orderType === 'gift');
  const purchaseItems = cartItems.filter(item => item.orderType === 'purchase');

  const generateAmazonBatchUrl = () => {
    const baseUrl = "https://www.amazon.com/gp/aws/cart/add.html?";
    const params = new URLSearchParams();
    
    cartItems.forEach((item, index) => {
      // Use ASIN for precise batching if available, fallback to name
      const identifier = item.asin || item.name;
      params.append(`ASIN.${index + 1}`, identifier);
      params.append(`Quantity.${index + 1}`, item.quantity.toString());
    });
    
    const tag = shopSettings.amazonAffiliateTag || 'cdi-nonprofit-20';
    params.append('AssociateTag', tag);
    
    return baseUrl + params.toString();
  };

  const handleCheckout = () => {
    setView('transferring');
    setTimeout(() => {
      const amazonUrl = generateAmazonBatchUrl();
      window.open(amazonUrl, '_blank');
      setView('confirm');
    }, 1500);
  };

  const handleFinalConfirmation = () => {
    if (onPurchaseComplete) {
      onPurchaseComplete(cartItems.map(i => i.id));
    }
    setView('success');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed inset-y-0 right-0 max-w-md w-full glass-card border-l border-white/10 shadow-3xl z-50 transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full bg-[#020617]/95">
          
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <ShoppingBag className="text-indigo-400" /> Organizational Bag
            </h2>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                <ShoppingCart size={64} className="text-slate-700" />
                <p className="font-light text-slate-500 italic">Acquisition list is empty.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {giftItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                       <Gift size={12} /> External Sponsorship (Batch)
                    </h3>
                    {giftItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center group">
                        <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-slate-800" alt="" />
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-slate-200 text-sm truncate">{item.name}</h4>
                           <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.platform}</p>
                           <div className="flex justify-between items-center mt-1">
                              <span className="text-indigo-400 font-bold text-xs">${item.price.toFixed(2)}</span>
                              <button onClick={() => onRemoveItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {purchaseItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <ShoppingCart size={12} /> Direct Fulfillment
                    </h3>
                    {purchaseItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center group opacity-80">
                        <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-slate-800" alt="" />
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-slate-200 text-sm truncate">{item.name}</h4>
                           <div className="flex justify-between items-center mt-1">
                              <span className="text-slate-400 font-bold text-xs">${item.price.toFixed(2)}</span>
                              <button onClick={() => onRemoveItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {cartItems.length > 0 && view === 'cart' && (
            <div className="p-8 border-t border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-black tracking-widest">Aggregate Val</span>
                    <span className="text-3xl font-display font-bold text-white">${total.toFixed(2)}</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-black tracking-widest">Fulfillment via</span>
                    <span className="text-sm font-bold text-orange-400">Amazon Business</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl shadow-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                <span>Sync to Amazon</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {view === 'transferring' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
               <div className="w-20 h-20 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-xl"></div>
               <p className="text-xl font-light text-slate-400">Compiling batch cart data...</p>
            </div>
          )}

          {view === 'confirm' && (
            <div className="flex-1 p-8 flex flex-col justify-center space-y-8">
               <div className="glass-card p-8 rounded-3xl border border-indigo-500/20 text-center space-y-6">
                  <ExternalLink size={48} className="mx-auto text-indigo-400" />
                  <h3 className="text-2xl font-display font-bold text-white">Confirm Fulfillment</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Once the transaction is finalized on Amazon, update the incubator status here.
                  </p>
                  <button onClick={handleFinalConfirmation} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                    Verify Purchase
                  </button>
               </div>
            </div>
          )}

          {view === 'success' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20 animate-bounce">
                   <CheckCircle size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-display font-bold text-white">Inventory Locked</h3>
                  <p className="text-slate-400 font-light">The assets have been successfully logged. Founders will be notified once items arrive.</p>
                </div>
                <button onClick={onClose} className="w-full bg-white text-black py-4 rounded-xl font-bold">Return to Hub</button>
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;

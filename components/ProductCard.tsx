
import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Gift, Trash2, Video, X, Edit2, Share2, Facebook, Twitter, Link, ChevronLeft, ChevronRight, Package, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  userRole: 'shopper' | 'admin';
  tier?: string;
  onDelete?: (id: string) => void;
  onEdit?: (product: Product) => void;
  onAddToCart: (product: Product, orderType: 'purchase' | 'gift') => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, userRole, onDelete, onEdit, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = [product.imageUrl, ...(product.additionalImages || [])];
  const totalStock = product.stockCount || 0;
  const sellableStock = Math.max(0, totalStock - 1);
  const hasReviewVideo = !!product.videoUrl;
  const canBuyFromTeen = sellableStock > 0 && hasReviewVideo;

  const getPlatformBadge = () => {
    switch(product.platform) {
      case 'Amazon': return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">Amazon</span>;
      case 'Shein': return <span className="bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">Shein</span>;
      case 'eBay': return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">eBay</span>;
      default: return null;
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden group border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col h-full bg-[#ffffff]/[0.02]">
      <div className="relative h-72 overflow-hidden bg-slate-900">
        <img 
          src={allImages[currentImageIndex]} 
          alt={product.name} 
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Market Badge */}
        <div className="absolute top-4 right-4 z-10">
          {getPlatformBadge()}
        </div>

        {/* Stock Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
           {totalStock === 0 ? (
             <span className="bg-indigo-500/20 backdrop-blur-md text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Incubator Phase</span>
           ) : (
             <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
               <ShieldCheck size={10} /> Fulfilled Asset
             </span>
           )}
        </div>
      </div>
      
      <div className="p-8 flex-1 flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{product.category}</p>
            <h3 className="text-xl font-display font-bold text-white tracking-tight leading-tight">{product.name}</h3>
          </div>
          <span className="text-xl font-display font-bold text-white">${product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-slate-400 text-sm font-light leading-relaxed line-clamp-2">{product.description}</p>
        
        <div className="pt-4 mt-auto space-y-3">
          <div className="flex gap-2">
            {canBuyFromTeen ? (
              <button 
                onClick={() => onAddToCart(product, 'purchase')}
                className="flex-1 bg-white text-black py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group/btn"
              >
                Direct Acquire <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={() => onAddToCart(product, 'gift')}
                className="flex-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Gift size={14} /> Sponsorship Required
              </button>
            )}
          </div>

          {userRole === 'admin' && (
             <div className="flex gap-2">
                <button onClick={() => onDelete?.(product.id)} className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                <button className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">Strategic Edit</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

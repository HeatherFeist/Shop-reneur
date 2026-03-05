
import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, UserProfile, isMarketplaceEligible } from '../types';
import {
  Store, ShoppingBag, ArrowLeft, Search, ChevronRight,
  Package, ShieldCheck, ExternalLink, Users, Sparkles,
  Instagram, Youtube, Facebook, Smartphone, Globe
} from 'lucide-react';

interface MarketplaceProps {
  products: Product[];
  profiles: UserProfile[];
  currentUser: UserProfile | null;
  onAddToCart: (product: Product, orderType: 'purchase' | 'gift') => void;
  onBack: () => void;
}

const PLATFORM_BADGE: Record<string, string> = {
  Amazon: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Shein: 'text-white bg-white/10 border-white/20',
  eBay: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const Marketplace: React.FC<MarketplaceProps> = ({
  products,
  profiles,
  currentUser,
  onAddToCart,
  onBack,
}) => {
  const [viewingSeller, setViewingSeller] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Amazon' | 'Shein' | 'eBay'>('All');

  // Products eligible for the shared marketplace
  const marketplaceProducts = useMemo(
    () => products.filter(isMarketplaceEligible),
    [products]
  );

  const getSellerProfile = (product: Product): UserProfile | undefined =>
    product.ownerId ? profiles.find(p => p.id === product.ownerId) : undefined;

  const sellerProducts = useMemo(
    () => (viewingSeller ? products.filter(p => p.ownerId === viewingSeller.id) : []),
    [viewingSeller, products]
  );

  const displayProducts = useMemo(() => {
    let base = viewingSeller ? sellerProducts : marketplaceProducts;
    if (categoryFilter !== 'All') base = base.filter(p => p.category === categoryFilter);
    if (platformFilter !== 'All') base = base.filter(p => p.platform === platformFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return base;
  }, [viewingSeller, sellerProducts, marketplaceProducts, categoryFilter, platformFilter, searchQuery]);

  const isAvailableForSale = isMarketplaceEligible;

  const handleShopNow = (product: Product) => {
    if (product.affiliateLink) {
      window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
    } else if (currentUser) {
      onAddToCart(product, 'purchase');
    }
  };

  const activeSellers = useMemo(() => {
    const sellerIds = new Set(marketplaceProducts.map(p => p.ownerId).filter(Boolean));
    return profiles.filter(p => sellerIds.has(p.id));
  }, [marketplaceProducts, profiles]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setPlatformFilter('All');
  };

  // ── INDIVIDUAL STORE VIEW ──────────────────────────────────────────────────
  if (viewingSeller) {
    const storeUnlocked = sellerProducts.filter(isAvailableForSale).length;
    return (
      <div className="animate-fadeIn space-y-10">
        <button
          onClick={() => { setViewingSeller(null); resetFilters(); }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Marketplace
        </button>

        {/* Seller profile header */}
        <div className="glass-card rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
            <img
              src={viewingSeller.avatarUrl}
              alt={viewingSeller.name}
              className="w-28 h-28 rounded-[2rem] border-4 border-indigo-500/30 shadow-xl flex-shrink-0 object-cover"
            />
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Verified Seller</p>
                <h2 className="text-4xl font-display font-bold text-white">{viewingSeller.name}</h2>
                <p className="text-slate-500 font-mono text-sm mt-1">@{viewingSeller.handle}</p>
              </div>
              {viewingSeller.bio && (
                <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xl">{viewingSeller.bio}</p>
              )}
              {viewingSeller.socials && (
                <div className="flex flex-wrap items-center gap-4 pt-2 justify-center md:justify-start">
                  {viewingSeller.socials.instagram && (
                    <a href={viewingSeller.socials.instagram} target="_blank" rel="noopener noreferrer"
                       className="text-pink-400 hover:text-pink-300 transition-colors text-xs font-bold flex items-center gap-1.5">
                      <Instagram size={14} /> Instagram
                    </a>
                  )}
                  {viewingSeller.socials.youtube && (
                    <a href={viewingSeller.socials.youtube} target="_blank" rel="noopener noreferrer"
                       className="text-red-400 hover:text-red-300 transition-colors text-xs font-bold flex items-center gap-1.5">
                      <Youtube size={14} /> YouTube
                    </a>
                  )}
                  {viewingSeller.socials.tiktok && (
                    <a href={viewingSeller.socials.tiktok} target="_blank" rel="noopener noreferrer"
                       className="text-white hover:text-slate-300 transition-colors text-xs font-bold flex items-center gap-1.5">
                      <Smartphone size={14} /> TikTok
                    </a>
                  )}
                  {viewingSeller.socials.facebook && (
                    <a href={viewingSeller.socials.facebook} target="_blank" rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold flex items-center gap-1.5">
                      <Facebook size={14} /> Facebook
                    </a>
                  )}
                </div>
              )}
            </div>
            {/* Store stats */}
            <div className="flex gap-4">
              <div className="glass-card px-6 py-4 rounded-2xl border border-white/5 text-center">
                <p className="text-2xl font-display font-bold text-white">{sellerProducts.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Products</p>
              </div>
              <div className="glass-card px-6 py-4 rounded-2xl border border-emerald-500/20 text-center">
                <p className="text-2xl font-display font-bold text-emerald-400">{storeUnlocked}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">For Sale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search this store..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 text-white text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['All', ...Object.values(ProductCategory)] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat as ProductCategory | 'All')}
                className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map(product => {
              const available = isAvailableForSale(product);
              return (
                <div
                  key={product.id}
                  className={`glass-card rounded-[2.5rem] overflow-hidden border transition-all duration-300 flex flex-col group ${available ? 'border-indigo-500/20 hover:border-indigo-500/40' : 'border-white/5 opacity-70'}`}
                >
                  <div className="relative h-56 overflow-hidden bg-slate-900">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${PLATFORM_BADGE[product.platform] || 'text-slate-400 bg-white/5 border-white/10'}`}>
                        {product.platform}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      {available ? (
                        <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck size={9} /> For Sale
                        </span>
                      ) : (
                        <span className="bg-slate-500/20 backdrop-blur-md text-slate-400 border border-slate-500/30 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Package size={9} /> Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col gap-3">
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">{product.category}</p>
                      <h4 className="font-display font-bold text-white text-lg leading-tight">{product.name}</h4>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-2xl font-display font-bold text-white">${product.price.toFixed(2)}</span>
                      {available && (
                        <button
                          onClick={() => handleShopNow(product)}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                        >
                          Shop Now <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center opacity-30 space-y-4">
            <Package size={48} className="mx-auto" />
            <p className="font-display text-2xl text-slate-600">No products found in this store.</p>
          </div>
        )}
      </div>
    );
  }

  // ── MARKETPLACE BROWSE VIEW ────────────────────────────────────────────────
  const categories: (ProductCategory | 'All')[] = ['All', ...Object.values(ProductCategory)];

  return (
    <div className="animate-fadeIn space-y-12">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> {currentUser ? 'Back to My Store' : 'Back to Login'}
      </button>

      {/* Hero banner */}
      <div className="relative glass-card rounded-[4rem] p-16 overflow-hidden border border-white/5 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 flex items-center gap-2">
              <Sparkles size={10} /> Shop'reneur Marketplace
            </span>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              {marketplaceProducts.length} Products &middot; {activeSellers.length} Seller{activeSellers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight tracking-tighter">
            Discover.<br />Shop.<br />Support.
          </h2>
          <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl">
            Browse verified products from independent sellers. Find something you love, then explore their full boutique.
          </p>
        </div>
      </div>

      {/* Active sellers strip */}
      {activeSellers.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
            <Users size={12} /> Active Sellers ({activeSellers.length})
          </p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {activeSellers.map(seller => (
              <button
                key={seller.id}
                onClick={() => setViewingSeller(seller)}
                className="flex items-center gap-3 glass-card px-6 py-3 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all flex-shrink-0 group"
              >
                <img src={seller.avatarUrl} alt={seller.name} className="w-8 h-8 rounded-xl object-cover" />
                <span className="text-sm font-bold text-white whitespace-nowrap">{seller.name}</span>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search all products..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 outline-none focus:border-indigo-500 text-white"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {(['All', 'Amazon', 'Shein', 'eBay'] as const).map(platform => (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform)}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${platformFilter === platform ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map(product => {
            const seller = getSellerProfile(product);
            return (
              <div
                key={product.id}
                className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-slate-900">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${PLATFORM_BADGE[product.platform] || 'text-slate-400 bg-white/5 border-white/10'}`}>
                      {product.platform}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">{product.category}</p>
                    <h4 className="font-display font-bold text-white text-lg leading-tight">{product.name}</h4>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2">{product.description}</p>
                  </div>

                  {/* Seller row */}
                  {seller && (
                    <button
                      onClick={() => setViewingSeller(seller)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group/seller text-left"
                    >
                      <img src={seller.avatarUrl} alt={seller.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Sold by</p>
                        <p className="text-sm font-bold text-white truncate">{seller.name}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 group-hover/seller:text-indigo-300 transition-colors whitespace-nowrap flex items-center gap-1">
                        Visit Store <ChevronRight size={10} />
                      </span>
                    </button>
                  )}

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-2xl font-display font-bold text-white">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleShopNow(product)}
                      className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg"
                    >
                      Shop Now <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center space-y-4">
          <div className="opacity-20">
            <Store size={64} className="mx-auto mb-4" />
            <p className="font-display text-2xl text-slate-400">
              {searchQuery || categoryFilter !== 'All' || platformFilter !== 'All'
                ? 'No products match your search.'
                : 'No products listed in the marketplace yet.'}
            </p>
          </div>
          {!searchQuery && categoryFilter === 'All' && platformFilter === 'All' && (
            <p className="text-slate-600 text-sm">
              Store owners can list products by reaching the 3-unit sales milestone.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;

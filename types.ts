
// Types for the Shop'reneur Platform

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Product {
  id: string; 
  name: string;
  price: number; 
  costPrice?: number;
  category: ProductCategory;
  description: string;
  imageUrl: string;
  additionalImages?: string[]; 
  videoUrl?: string; 
  affiliateLink: string; 
  platform: 'Amazon' | 'Shein'; 
  isWishlist: boolean; 
  isReceived?: boolean; 
  stockCount?: number; 
  isMarketplaceSynced?: boolean; // Track if pushed to the main platform
  asin?: string; // Amazon Standard Identification Number for batch checkout
}

export enum ProductCategory {
  BEAUTY = 'Beauty & Skincare',
  FASHION = 'Fashion & Apparel',
  ACCESSORIES = 'Accessories',
  HAIR = 'Hair Care',
  TECH = 'Tech & Gadgets',
  SHEIN = 'Shein Finds'
}

export interface UserProfile {
  id: string; 
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  role: 'Daughter' | 'Mother' | 'Board Member' | 'Family Member' | 'Sponsor';
  shippingAddress?: ShippingAddress;
}

export interface Message {
  id: string;
  senderId: string; 
  recipientId: string; 
  text: string;
  timestamp: number;
}

export interface ShopSettings {
  storeName: string;
  tagline: string;
  heroHeadline: string;
  heroSubtext: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontHeading: string;
  fontBody: string;
  amazonAffiliateTag?: string; 
}

export interface CreatorStats {
  tier: 'Starter' | 'Entrepreneur' | 'Empire'; 
  streak: number;
  points: number;
  level: 'Newbie' | 'Rising Star' | 'Influencer' | 'Viral Icon' | 'Empire Builder';
  inventoryCount: number; 
  subscriptionPlan: 'Free' | 'Pro' | 'Elite';
}

export interface CartItem extends Product {
  quantity: number;
  orderType: 'purchase' | 'gift';
}

export interface SocialPost {
  id: string;
  authorName: string;
  shopName: string;
  avatarUrl: string;
  caption: string;
  likes: number;
  views: number;
  platform: 'TikTok' | 'Instagram' | 'Facebook';
  isChallengeEntry: boolean;
  hasVoted: boolean;
  taggedUsers?: string[];
}

export interface ContentPrompt {
  title: string;
  description: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  sources?: string[];
}

export interface SaleRecord {
  id: string;
  productId: string;
  amount: number;
  timestamp: number;
}


export interface Product {
  id: string; // UUID from Supabase
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
  asin?: string; 
  affiliateTag?: string; 
  isWishlist: boolean; 
  isReceived?: boolean; 
  stockCount?: number; 
}

export enum ProductCategory {
  BEAUTY = 'Beauty & Skincare',
  FASHION = 'Fashion & Apparel',
  ACCESSORIES = 'Accessories',
  HAIR = 'Hair Care',
  TECH = 'Tech & Gadgets',
  SHEIN = 'Shein Finds'
}

export interface CartItem extends Product {
  quantity: number;
  orderType: 'purchase' | 'gift'; 
}

export interface DailyContent {
  videoUrl: string;
  title: string;
  message: string;
  taggedUsers?: string[]; 
}

export interface CreatorStats {
  tier: 'Starter' | 'Entrepreneur' | 'Empire'; 
  streak: number;
  points: number;
  level: 'Newbie' | 'Rising Star' | 'Influencer' | 'Viral Icon' | 'Empire Builder';
  videosPostedThisWeek: number;
  weeklyGoal: number;
  nextLevelPoints: number;
  subscriptionPlan: 'Free' | 'Pro' | 'Elite'; 
  inventoryCount: number; 
}

export type SocialPlatform = 'TikTok' | 'Instagram' | 'Facebook' | 'YouTube';

export interface SocialPost {
  id: string;
  authorName: string;
  shopName: string;
  avatarUrl: string;
  caption: string;
  likes: number;
  views: number;
  platform: SocialPlatform;
  isChallengeEntry: boolean;
  hasVoted: boolean;
  taggedUsers?: string[];
}

export type ChallengeType = 'Daily' | 'Weekly' | 'Tournament';

export interface ContentPrompt {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  platform: SocialPlatform;
  expiresIn?: string; 
  sources?: string[]; // Added to comply with search grounding rules
}

export interface ShopSettings {
  storeName: string;
  adminEmail?: string; 
  tagline: string;
  heroHeadline: string;
  heroSubtext: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontHeading: 'Playfair Display' | 'Lobster' | 'Oswald' | 'Quicksand' | 'Abril Fatface' | 'Bebas Neue' | 'Dancing Script' | 'Montserrat';
  fontBody: 'Inter' | 'Quicksand' | 'Open Sans' | 'Lato' | 'Merriweather';
  amazonAffiliateTag?: string; 
  amazonStoreId?: string; 
  amazonStorefrontUrl?: string; 
  logoUrl?: string; 
  backgroundImageUrl?: string; 
  customCss?: string; 
  socialHandles?: {
    tiktok?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile {
  id: string; // UUID from Supabase Auth
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  role: 'Daughter' | 'Mother' | 'Sponsor';
  shippingAddress?: Address;
}

export interface SaleRecord {
  id: string;
  productName: string;
  salePrice: number;
  restockCost: number; 
  profit: number; 
  date: string;
}

export interface Message {
  id: string;
  senderId: string; 
  recipientId: string; 
  text: string;
  timestamp: number;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  unreadCount: number;
  messages: Message[];
}

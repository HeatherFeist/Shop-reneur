
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type ChallengeCategory = 'Education' | 'Advertising' | 'Branding' | 'Market Research';

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
  videoReviewCompleted?: boolean; 
  affiliateLink: string; 
  platform: 'Amazon' | 'Shein' | 'eBay'; 
  isWishlist: boolean; 
  isReceived?: boolean; 
  stockCount: number; 
  isMarketplaceSynced?: boolean; 
  asin?: string; 
  marketplaceId?: string; 
}

export enum ProductCategory {
  BEAUTY = 'Beauty & Skincare',
  FASHION = 'Fashion & Apparel',
  ACCESSORIES = 'Accessories',
  HAIR = 'Hair Care',
  TECH = 'Tech & Gadgets',
  LIFESTYLE = 'Lifestyle'
}

export interface UserProfile {
  id: string; 
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  role: 'Owner' | 'Shopper' | 'Partner';
  password?: string; 
  storeOwnerId?: string; 
  shippingAddress?: ShippingAddress;
  socials?: {
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
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
  logoUrl?: string;
  heroHeadline: string;
  heroSubtext: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontHeading: string;
  fontBody: string;
  amazonAffiliateTag?: string;
  ebayAffiliateId?: string;
  sheinAffiliateId?: string;
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

export interface ContentPrompt {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  trendingTopic: string;
  sources?: string[];
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  avatar: string;
  contentUrl: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook';
  title: string;
  votes: number;
  timestamp: number;
}

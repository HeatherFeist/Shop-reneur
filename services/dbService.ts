
import { supabase } from "./supabaseClient";
import { Product, ShopSettings, Message, UserProfile } from "../types";

const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  // Fix: cost_price mapped to costPrice in Product interface
  costPrice: p.cost_price ? Number(p.cost_price) : 0,
  category: p.category,
  description: p.description,
  imageUrl: p.image_url,
  additionalImages: p.additional_images || [],
  videoUrl: p.video_url,
  affiliateLink: p.affiliate_link,
  platform: p.platform,
  isWishlist: p.is_wishlist,
  isReceived: p.is_received,
  stockCount: p.stock_count,
  isMarketplaceSynced: p.is_marketplace_synced || false,
  asin: p.asin,
  marketplaceId: p.marketplace_id
});

const mapProfile = (p: any): UserProfile => ({
  id: p.id,
  name: p.name,
  handle: p.handle,
  bio: p.bio,
  // Fixed: database avatar_url mapped to interface property avatarUrl
  avatarUrl: p.avatar_url,
  role: p.role,
  password: p.password
});

export const dbService = {
  // --- Profiles ---
  getProfiles: async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return (data || []).map(mapProfile);
    } catch (e) {
      console.warn("DB profiles table not ready, using local state.");
      return [];
    }
  },

  subscribeToProfiles: (callback: (profiles: UserProfile[]) => void) => {
    supabase.from('profiles').select('*').then(({ data, error }) => {
      if (error) {
        console.warn("Supabase fetch profiles error:", error);
        callback([]); 
      } else {
        callback(data ? data.map(mapProfile) : []);
      }
    });

    return supabase.channel('profiles-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'profiles' }, async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) callback(data.map(mapProfile));
      })
      .subscribe();
  },

  upsertProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const payload = {
      id: profile.id,
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio,
      avatar_url: profile.avatarUrl,
      role: profile.role,
      password: profile.password
    };
    
    const { data, error } = await supabase.from('profiles').upsert(payload).select();
    if (error) {
      console.error("Upsert failed, likely missing profiles table:", error);
      throw error;
    }
    return mapProfile(data[0]);
  },

  // --- Products ---
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) callback(data.map(mapProduct)); });

    return supabase.channel('products-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'products' }, async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) callback(data.map(mapProduct));
      }).subscribe();
  },

  saveProduct: async (product: Partial<Product>) => {
    const dbPayload: any = {
      name: product.name,
      price: product.price,
      cost_price: product.costPrice,
      category: product.category,
      description: product.description,
      image_url: product.imageUrl,
      additional_images: product.additionalImages,
      video_url: product.videoUrl,
      affiliate_link: product.affiliateLink,
      platform: product.platform,
      is_wishlist: product.isWishlist,
      is_received: product.isReceived,
      stock_count: product.stockCount,
      is_marketplace_synced: product.isMarketplaceSynced,
      asin: product.asin,
      marketplace_id: product.marketplaceId,
      updated_at: new Date()
    };
    const { error } = product.id 
      ? await supabase.from('products').update(dbPayload).eq('id', product.id)
      : await supabase.from('products').insert([dbPayload]);
    if (error) throw error;
  },

  deleteProduct: async (productId: string) => {
    await supabase.from('products').delete().eq('id', productId);
  },

  // --- Settings ---
  subscribeToSettings: (callback: (settings: ShopSettings) => void) => {
    supabase.from('shop_settings').select('*').eq('id', 'global_settings').single()
      .then(({ data }) => { if (data) callback({
        storeName: data.store_name,
        tagline: data.tagline,
        heroHeadline: data.hero_headline,
        heroSubtext: data.hero_subtext,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        backgroundColor: data.background_color,
        fontHeading: data.font_heading,
        fontBody: data.font_body,
        amazonAffiliateTag: data.amazon_affiliate_tag,
        ebayAffiliateId: data.ebay_affiliate_id,
        sheinAffiliateId: data.shein_affiliate_id
      }); });

    return supabase.channel('settings-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'shop_settings' }, async () => {
        const { data } = await supabase.from('shop_settings').select('*').eq('id', 'global_settings').single();
        if (data) callback({
          storeName: data.store_name,
          tagline: data.tagline,
          heroHeadline: data.hero_headline,
          // Fixed: database hero_subtext mapped to interface property heroSubtext
          heroSubtext: data.hero_subtext,
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          backgroundColor: data.background_color,
          fontHeading: data.font_heading,
          fontBody: data.font_body,
          amazonAffiliateTag: data.amazon_affiliate_tag,
          ebayAffiliateId: data.ebay_affiliate_id,
          sheinAffiliateId: data.shein_affiliate_id
        });
      }).subscribe();
  },

  updateSettings: async (settings: ShopSettings) => {
    await supabase.from('shop_settings').upsert({
      id: 'global_settings',
      store_name: settings.storeName,
      tagline: settings.tagline,
      hero_headline: settings.heroHeadline,
      hero_subtext: settings.heroSubtext,
      primary_color: settings.primaryColor,
      secondary_color: settings.secondaryColor,
      background_color: settings.backgroundColor,
      font_heading: settings.fontHeading,
      font_body: settings.fontBody,
      amazon_affiliate_tag: settings.amazonAffiliateTag,
      ebay_affiliate_id: settings.ebayAffiliateId,
      shein_affiliate_id: settings.sheinAffiliateId,
      updated_at: new Date()
    });
  },

  // --- Messages ---
  subscribeToMessages: (callback: (messages: Message[]) => void) => {
    supabase.from('messages').select('*').order('timestamp', { ascending: true })
      .then(({ data }) => { if (data) callback(data.map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        recipientId: m.recipient_id,
        text: m.text,
        timestamp: m.timestamp
      }))); });

    return supabase.channel('messages-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'messages' }, async () => {
        const { data } = await supabase.from('messages').select('*').order('timestamp', { ascending: true });
        if (data) callback(data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          recipientId: m.recipient_id,
          text: m.text,
          timestamp: m.timestamp
        })));
      }).subscribe();
  },

  sendMessage: async (message: Omit<Message, 'id'>) => {
    await supabase.from('messages').insert([{
      sender_id: message.senderId,
      recipient_id: message.recipientId,
      text: message.text,
      timestamp: message.timestamp
    }]);
  },

  deleteMessage: async (messageId: string) => {
    await supabase.from('messages').delete().eq('id', messageId);
  }
};

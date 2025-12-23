
import { supabase } from "./supabaseClient";
import { Product, ShopSettings, Message } from "../types";

/**
 * Maps Database snake_case (SQL) to Frontend camelCase (TypeScript)
 */
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
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
  stockCount: p.stock_count
});

const mapSettings = (s: any): ShopSettings => ({
  storeName: s.store_name,
  tagline: s.tagline,
  heroHeadline: s.hero_headline,
  heroSubtext: s.hero_subtext,
  primaryColor: s.primary_color,
  secondaryColor: s.secondary_color,
  backgroundColor: s.background_color,
  fontHeading: s.font_heading,
  fontBody: s.font_body,
  amazonAffiliateTag: s.amazon_affiliate_tag
});

export const dbService = {
  // --- Products ---
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    // Initial fetch
    supabase.from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Error fetching initial products:", error);
        if (data) callback(data.map(mapProduct));
      });

    // Real-time listener
    // Fix: Explicitly include 'schema' and cast event type to 'any' to bypass strict overload resolution errors
    const channel = supabase.channel('products-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'products' }, async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) callback(data.map(mapProduct));
      })
      .subscribe();
      
    return channel;
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
      updated_at: new Date()
    };

    if (product.id) {
      const { error } = await supabase.from('products').update(dbPayload).eq('id', product.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('products').insert([dbPayload]);
      if (error) throw error;
    }
  },

  deleteProduct: async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  },

  // --- Settings ---
  subscribeToSettings: (callback: (settings: ShopSettings) => void) => {
    supabase.from('shop_settings')
      .select('*')
      .eq('id', 'global_settings')
      .single()
      .then(({ data }) => {
        if (data) callback(mapSettings(data));
      });

    // Fix: Explicitly include 'schema' and cast event type to 'any' to bypass strict overload resolution errors
    const channel = supabase.channel('settings-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'shop_settings' }, async () => {
        const { data } = await supabase.from('shop_settings').select('*').eq('id', 'global_settings').single();
        if (data) callback(mapSettings(data));
      })
      .subscribe();

    return channel;
  },

  updateSettings: async (settings: ShopSettings) => {
    const dbPayload = {
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
      updated_at: new Date()
    };
    const { error } = await supabase.from('shop_settings').upsert({ id: 'global_settings', ...dbPayload });
    if (error) throw error;
  },

  // --- Messages ---
  subscribeToMessages: (callback: (messages: Message[]) => void) => {
    supabase.from('messages')
      .select('*')
      .order('timestamp', { ascending: true })
      .then(({ data }) => {
        if (data) callback(data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          recipientId: m.recipient_id,
          text: m.text,
          timestamp: m.timestamp
        })));
      });

    // Fix: Explicitly include 'schema' and cast event type to 'any' to bypass strict overload resolution errors
    const channel = supabase.channel('messages-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'messages' }, async () => {
        const { data } = await supabase.from('messages').select('*').order('timestamp', { ascending: true });
        if (data) callback(data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          recipientId: m.recipient_id,
          text: m.text,
          timestamp: m.timestamp
        })));
      })
      .subscribe();

    return channel;
  },

  sendMessage: async (message: Omit<Message, 'id'>) => {
    const { error } = await supabase.from('messages').insert([{
      sender_id: message.senderId,
      recipient_id: message.recipientId,
      text: message.text,
      timestamp: message.timestamp
    }]);
    if (error) throw error;
  },

  deleteMessage: async (messageId: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) throw error;
  }
};


import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (
  productName: string,
  category: string,
  keywords: string
): Promise<string> => {
  try {
    const modelName = 'gemini-3-flash-preview';
    const prompt = `
      You are a trendy, Gen Z savvy copywriter for a teenage girl's online boutique on the "Shop'reneur" platform.
      Write a catchy, short, and appealing product description (max 40 words) for a product named "${productName}".
      Category: ${category}.
      Keywords/Vibe: ${keywords}.
      Use emojis sparingly but effectively. Make it sound exciting!
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return response.text || "Check out this amazing find!";
  } catch (error) {
    console.error("Error generating description:", error);
    return "A must-have item for your collection!";
  }
};

export const generateProductImage = async (
  productName: string,
  category: string,
  description: string
): Promise<string | null> => {
  try {
    const prompt = `Professional product photography of ${productName}. 
    Category: ${category}. 
    Description: ${description}. 
    Style: High-end e-commerce, clean white or pastel background, studio lighting, 4k, detailed. 
    Ensure the item is the main focus and fully visible. No text overlays.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating product image:", error);
    return null;
  }
};

export const generateTryOnImage = async (
  userImageBase64: string,
  productName: string,
  productCategory: string,
  productDescription: string
): Promise<string | null> => {
  try {
    const cleanBase64 = userImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Detailed Instruction: This is a photo of a user who wants to virtually try on a product. 
            Generate a realistic image of this EXACT person wearing the following item: "${productName}". 
            
            Product Details: ${productDescription}
            Category: ${productCategory}
            
            Requirements:
            1. Maintain the person's identity, facial features, hair, and body shape exactly as they appear in the original photo.
            2. Maintain the background of the original photo if possible, or use a neutral flattering background if the outfit change requires it.
            3. The clothing/item should fit naturally.
            4. High quality, photorealistic output.
            `
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating try-on image:", error);
    throw error;
  }
};

export const scanTrendsAndGenerateChallenges = async () => {
  try {
    const prompt = `
      Step 1: Use Google Search to find current viral social media trends (TikTok, Reels, YouTube Shorts) specifically related to:
      - Small business ownership
      - Affiliate marketing / Dropshipping
      - Gen Z fashion/beauty aesthetics
      - Brand storytelling

      Step 2: Based on these real-time trends, generate 4 unique "Entrepreneurship Challenges" for teenage store owners.
      
      Requirements for challenges:
      - 2 challenges must be 'Branding' or 'Education' focused (teaching them a business concept).
      - 2 challenges must be 'Advertising' focused (promoting a specific product type).
      - Include the current 'trendingTopic' that inspired the challenge.

      Return ONLY a JSON array of objects with this schema:
      [
        {
          "id": "unique_string",
          "title": "Short catchy title",
          "description": "Specific, actionable instruction for the user",
          "category": "Education" | "Advertising" | "Branding" | "Market Research",
          "platform": "TikTok" | "Instagram" | "YouTube" | "Facebook",
          "difficulty": "Easy" | "Medium" | "Hard",
          "xpReward": number (100-500),
          "trendingTopic": "The specific hashtag or trend used"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];

    const text = response.text;
    if (!text) return [];
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const challenges = JSON.parse(jsonStr);
      
      return challenges.map((c: any) => ({ ...c, sources }));
    } catch (e) {
      console.warn("Could not parse JSON from search grounding response:", text);
      return [];
    }
  } catch (error) {
    console.error("Error scanning trends:", error);
    return [];
  }
};

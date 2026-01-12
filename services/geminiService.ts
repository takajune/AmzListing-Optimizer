
import { GoogleGenAI, Type } from "@google/genai";
import { AmazonListing } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAmazonListing = async (
  base64Image: string,
  mimeType: string
): Promise<AmazonListing> => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this product mockup image and generate a highly optimized Amazon listing. 
            The listing must be conversion-focused, SEO-optimized, and follow Amazon's best practices.
            
            1. Title: Compelling, including main keywords, under 200 characters.
            2. 5 Feature Bullets: Highlighting benefits and solving pain points.
            3. Product Description: Detailed and engaging.
            4. Backend Search Terms: A string of relevant keywords for backend SEO (max 250 bytes).
            
            Return the response in JSON format.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Optimized Amazon product title.",
          },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 feature bullet points.",
          },
          description: {
            type: Type.STRING,
            description: "Detailed product description.",
          },
          searchTerms: {
            type: Type.STRING,
            description: "Backend SEO keywords.",
          },
        },
        required: ["title", "bullets", "description", "searchTerms"],
      },
    },
  });

  const response = await model;
  const jsonStr = response.text || "";
  
  try {
    return JSON.parse(jsonStr) as AmazonListing;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("The AI returned an invalid response format. Please try again.");
  }
};

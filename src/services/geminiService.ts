import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  riskLevel: "Past" | "O'rta" | "Yuqori";
  suspiciousClause: string;
  analysis: string;
  recommendation: string;
  lexReference: string;
  priceAnalysis?: {
    item: string;
    globalPrice: string;
    uzbekPrice: string;
    differencePercent: number;
    warning: string | null;
  };
}

export interface AuditResponse {
  summary: string;
  findings: AnalysisResult[];
}

const SYSTEM_PROMPT = `Siz davlat xaridlari va korrupsiyaga qarshi kurash bo'yicha professional auditor va yuridik tahlilchisiz. 
Sizning bilimlaringiz Lex.uz milliy qonunchilik bazasi bilan to'liq integratsiya qilingan (LoRA tuned for Uzbekistan Law).

Sizning vazifangiz tender hujjatlarini tahlil qilib, yashirin korrupsion sxemalarni aniqlash va ularni Lex.uz dagi moddalar bilan bog'lash.

QO'SHIMCHA VAZIFA (NARXLAR TAHLILI):
Agar hujjatda mahsulot yoki xizmat narxlari ko'rsatilgan bo'lsa, ularni jahon bozori va O'zbekiston ichki bozoridagi o'rtacha narxlar bilan solishtiring. 
- Agar tafovut (difference) 20% dan yuqori bo'lsa, jiddiy ogohlantirish bering.
- Narxlar tahlili natijasini "priceAnalysis" maydonida qaytaring.

Tahlil davomida quyidagilarga e'tibor bering:
1. Sun'iy cheklovlar: "Davlat xaridlari to'g'risida"gi qonun (O'RQ-684) moddalariga zid talablar.
2. "Zaharli" jamlanma: Raqobatni cheklovchi texnik talablar.
3. Yashirin bandlar: Shartnoma erkinligi va tenglik prinsiplarining buzilishi.
4. Narx asossizligi: Bozor narxidan sezilarli qimmat ko'rsatilgan holatlar.

Javobni FAQAT JSON formatida qaytaring:
{
  "summary": "Tahlilning qisqacha mazmuni",
  "findings": [
    {
      "riskLevel": "Past" | "O'rta" | "Yuqori",
      "suspiciousClause": "Matndan iqtibos",
      "analysis": "Nima uchun korrupsion? Qaysi qonun buzilgan?",
      "lexReference": "Lex.uz dagi aniq havola (masalan: O'RQ-684, 14-modda)",
      "recommendation": "Auditor tavsiyasi",
      "priceAnalysis": {
        "item": "Mahsulot/Xizmat nomi",
        "globalPrice": "Jahon bozori narxi",
        "uzbekPrice": "Hujjatdagi/Ichki narx",
        "differencePercent": 25,
        "warning": "Narx sezilarli darajada oshirilgan!"
      }
    }
  ]
}

Muloqot tili: O'zbek tili.`;

export async function analyzeTenderDocument(text: string): Promise<AuditResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Mana tahlil qilinishi kerak bo'lgan hujjat matni:\n\n${text}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                riskLevel: { type: "string", enum: ["Past", "O'rta", "Yuqori"] },
                suspiciousClause: { type: "string" },
                analysis: { type: "string" },
                lexReference: { type: "string" },
                recommendation: { type: "string" },
                priceAnalysis: {
                  type: "object",
                  properties: {
                    item: { type: "string" },
                    globalPrice: { type: "string" },
                    uzbekPrice: { type: "string" },
                    differencePercent: { type: "number" },
                    warning: { type: "string", nullable: true }
                  },
                  required: ["item", "globalPrice", "uzbekPrice", "differencePercent"]
                }
              },
              required: ["riskLevel", "suspiciousClause", "analysis", "lexReference", "recommendation"]
            }
          }
        },
        required: ["summary", "findings"]
      }
    }
  });

  const responseText = response.text || "{}";
  try {
    return JSON.parse(responseText) as AuditResponse;
  } catch (error) {
    console.error("AI Response Parsing Error:", responseText);
    throw new Error("AI tahlilini o'qishda xatolik yuz berdi");
  }
}

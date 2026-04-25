# main.py
import os
import fitz
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from google import genai

# Bizning "Ma'lumotlar bazamiz" fayllari
from mock_data import uzb_market_prices, lex_uz_laws
from tricks_db import corruption_tricks_uz

# 1. Muhit va API sozlamalari
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key or api_key == "AIzaSyYourRealApiKeyGoesHere...":
    raise RuntimeError("API Key is missing from .env file. Please check your .env file.")

client = genai.Client(api_key=api_key)

# 2. Qoidabuzarliklar ro'yxatini matnga o'tkazish (Prompt uchun)
tricks_context = ""
for key, value in corruption_tricks_uz.items():
    tricks_context += f"- **{value['name']}**: {value['description']}\n"

# 3. FastAPI tizimini ishga tushirish
app = FastAPI(title="GovTech Anti-Corruption API")


# --- MOCK API: Dashboard Stats ---
@app.get("/api/dashboard")
async def get_dashboard_stats():
    return {
        "status": "success",
        "data": {
            "total_found": 142,
            "viewed": 98,
            "unviewed": 44,
            "most_common": [
                {"name": "Maxsus moslashtirilgan talablar (Vendor Lock-in)", "count": 56, "color": "text-red-400"},
                {"name": "Narxni asossiz oshirish (Overpricing)", "count": 41, "color": "text-yellow-400"},
                {"name": "Bajarib bo'lmaydigan qisqa muddatlar (Squeeze Trick)", "count": 27, "color": "text-blue-400"},
                {"name": "Turli xil mahsulotlarni birlashtirish (Bad Apple)", "count": 18, "color": "text-gray-400"}
            ]
        }
    }


# --- MOCK API: Notifications ---
@app.get("/api/notifications")
async def get_notifications():
    return {
        "status": "success",
        "data": [
            {"id": 1, "title": "🚨 Yangi xavfli tender (Sog'liqni Saqlash)",
             "message": "Tender hujjatida 3 ta 'High severity' qoidabuzarlik topildi.", "time": "10 daqiqa oldin",
             "is_new": True},
            {"id": 2, "title": "💡 Tizim Yangilanishi",
             "message": "Lex.uz bo'yicha 684-sonli qonun parametrlari tizimga yuklandi.", "time": "2 soat oldin",
             "is_new": False},
            {"id": 3, "title": "⚠️ Shubhali faollik",
             "message": "Xorazm viloyati qurilish tenderlarida narxlar 150% ga oshirilganligi qayd etildi.",
             "time": "1 kun oldin", "is_new": False}
        ]
    }


# --- CORE API: Gemini AI Scanner ---
@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Faqat PDF formatidagi hujjatlar qabul qilinadi.")

    try:
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        # 4. METADATA INJECTION: Har bir qatorga sahifa va qator raqamini qo'shish
        pdf_text_with_metadata = ""
        for page_num, page in enumerate(doc, start=1):
            lines = page.get_text().split('\n')
            for line_num, line in enumerate(lines, start=1):
                clean_line = line.strip()
                if clean_line:  # Bo'sh qatorlarni o'tkazib yuboramiz
                    pdf_text_with_metadata += f"[Sahifa {page_num}, Qator {line_num}]: {clean_line}\n"

        # 5. MEGA-PROMPT
        system_prompt = f"""
        You are an expert Anti-Corruption Auditor for Uzbekistan public procurement.
        Your job is to analyze the provided tender document text and detect hidden loopholes or corruption tricks.

        ### OFFICIAL CORRUPTION TRICKS DATABASE (UZBEK):
        {tricks_context}

        ### CURRENT UZBEK PROCUREMENT LAW (Lex.uz):
        {lex_uz_laws}

        ### CURRENT TASHKENT MARKET PRICES:
        {uzb_market_prices}

        ### RAW TENDER TEXT (TAGGED WITH PAGE AND LINE NUMBERS):
        {pdf_text_with_metadata}

        ### INSTRUCTIONS AND OUTPUT FORMAT:
        Analyze the document carefully. If a requirement seems suspicious, match it against the "OFFICIAL CORRUPTION TRICKS DATABASE".
        Use the [Sahifa X, Qator Y] tags provided in the text to identify exactly where the trick is located.

        You must output ONLY a valid JSON array of objects. Do not include markdown formatting like ```json.
        Each object must have: 
        - "trick_name" (MUST be the exact Uzbek "name" from the Official Database)
        - "quoted_text" (the exact text from the document proving the trick, WITHOUT the tags)
        - "explanation" (Detailed explanation in Uzbek referencing exact parameters)
        - "severity" (High, Medium, Low)
        - "page_info" (string, exact page number, e.g., "Sahifa 2")
        - "line_info" (string, exact line numbers, e.g., "Qator 45-48")
        """

        # 6. Call Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
            config={"response_mime_type": "application/json"}
        )

        results = json.loads(response.text)
        return JSONResponse(content={"status": "success", "data": results})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 7. Mount Frontend (Eng pastda bo'lishi shart)
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")
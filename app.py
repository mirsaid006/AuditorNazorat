# test_core.py
import os
import fitz  # PyMuPDF
import json
from dotenv import load_dotenv
from google import genai
from mock_data import uzb_market_prices, lex_uz_laws
from tricks_db import corruption_tricks_uz # <--- Import your new database

# 1. Setup & Auth
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# if not api_key or api_key == "AIzaSyBULsIG_8yq7gtyhHp2rMiBQKlC_6lbTJ0":
#     print("❌ ERROR: Please put your real Gemini API key in the .env file.")
#     exit(1)

# Initialize the client
client = genai.Client(api_key=api_key)

# 2. PDF Target
PDF_FILE = "Ofis_texnikasi_toliq_shartnoma.pdf"  # Make sure you have a PDF named this in your folder!

if not os.path.exists(PDF_FILE):
    print(f"❌ ERROR: Cannot find {PDF_FILE}. Please add a test PDF to this folder.")
    exit(1)

# 3. Extract Text
print(f"📄 Extracting text from {PDF_FILE}...")
doc = fitz.open(PDF_FILE)
pdf_text = "\n".join([page.get_text() for page in doc])

# 4. The Prompt
tricks_context = ""
for key, value in corruption_tricks_uz.items():
    tricks_context += f"- **{value['name']}**: {value['description']}\n"

# 2. The Dynamic Prompt
system_prompt = f"""
You are an expert Anti-Corruption Auditor for Uzbekistan public procurement.
Your job is to analyze the provided tender document text and detect hidden loopholes or corruption tricks.

### OFFICIAL CORRUPTION TRICKS DATABASE (UZBEK):
You must classify any anomaly you find using ONLY the following officially recognized tricks. 
{tricks_context}

### CURRENT UZBEK PROCUREMENT LAW (Lex.uz):
{lex_uz_laws}

### CURRENT TASHKENT MARKET PRICES:
{uzb_market_prices}

### RAW TENDER TEXT:
{pdf_text}

### INSTRUCTIONS AND OUTPUT FORMAT:
Analyze the document carefully. If a requirement seems suspicious, match it against the "OFFICIAL CORRUPTION TRICKS DATABASE".

You must output ONLY a valid JSON array of objects. Do not include markdown formatting like ```json.
Each object must have: 
- "trick_name" (MUST be the exact Uzbek "name" from the Official Database provided above)
- "quoted_text" (the exact text from the document proving the trick)
- "explanation" (Detailed explanation in Uzbek of why this matches the trick, referencing the exact suspicious parameters like weight, days, or price)
- "severity" (High, Medium, Low)
"""

# 5. Execute Analysis
print("🧠 Sending data to Gemini 2.5 Flash API...")
try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=system_prompt,
        config={"response_mime_type": "application/json"}
    )

    # Parse the JSON string into a Python dictionary
    results = json.loads(response.text)

    print("\n✅ ANALYSIS COMPLETE. RESULTS:\n")
    # Pretty print the JSON output to the terminal
    print(json.dumps(results, indent=4, ensure_ascii=False))

except Exception as e:
    print(f"\n❌ API ERROR: {e}")
# 🕵️‍♂️ Auditor Nazorat

An enterprise-grade, AI-driven Document Intelligence System designed to detect "tricky moments," hidden corruption loopholes, and artificially inflated prices in government procurement documents (tenders, agreements, and auctions).

Powered by **Gemini 2.5 Flash**, this system reads massive PDF contracts, identifies anti-competitive clauses (like fake warranties, impossible deadlines, and vendor lock-in), and pinpoints the exact page and line number for auditors.

## ✨ Key Features

* **🧠 Deep AI Scanning:** Analyzes dense legal text in Uzbek to find complex corruption schemes based on official procurement laws (Lex.uz).
* **🎯 Precision Metadata:** Doesn't just flag issues; it provides the exact **Page and Line Number** where the loophole is buried.
* **📊 Enterprise Command Center:** A sleek, dark-mode Single Page Application (SPA) featuring live Chart.js visualizations, system readiness metrics, and activity logs.
* **⚡ Real-time Terminal Animation:** Provides visual feedback during the NLP vectorization and API analysis phases.
* **🛡️ One-Click Reporting:** Includes a simulated secure forwarding module (AES-256) to instantly send detected dossiers to the Prosecutor General or Anti-Corruption Agency.

## 🛠️ Tech Stack

* **Backend Engine:** FastAPI, Python 3.12+
* **AI & Reasoning:** Google GenAI SDK (Gemini 2.5 Flash)
* **Document Parsing:** PyMuPDF (`fitz`)
* **Frontend UI:** Vanilla HTML, CSS (Custom Glassmorphism), JavaScript (SPA routing)
* **Data Visualization:** Chart.js
* **Package Manager:** `uv`

## 📂 Project Structure

```text
AntiCorruption/
├── .env                  # Environment variables (API Keys)
├── requirements.txt      # Project dependencies
├── main.py               # Core FastAPI server and Gemini logic
├── mock_data.py          # Simulated databases for market prices and laws
├── tricks_db.py          # Dictionary of specific Uzbek corruption schemes
└── static/
    └── index.html        # The complete Frontend SPA

# TradeMind AI — Autonomous Sentiment-to-Execution Trading Agent


<div align="center">

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Alibaba Cloud](https://img.shields.io/badge/Alibaba_Cloud-FF6A00?style=for-the-badge&logo=alibabacloud&logoColor=white)

</div>

---
TradeMind AI is an autonomous, sentiment-driven algorithmic trading agent designed for the **Bitget AI Base Camp Hackathon S1 (Track 1: Trading Agent · For Traders)**. 

The platform translates unstructured live web data (financial news, coin-specific catalysts, and macro updates) alongside live mathematical exchange metrics (24h high/low, price velocity, and trading volumes) into structured, risk-managed spot trades executed natively via the Bitget V2 API. 

Users monitor, manage, and execute trades through a responsive, glassmorphic Web3 dashboard hosted on Vercel or an interactive, inline-menu Telegram Bot running 24/7 on cloud infrastructure.

---

## 🚀 Hackathon Track Alignment (Track 1: Trading Agent)

TradeMind AI implements the complete, closed strategy loop required by the Track 1 guidelines:
* **Perception**: Utilizes **Tavily Search** to extract real-time, unstructured news catalysts from the live web. It matches these articles with live mathematical market data (24h high, low, volume, and last price) polled from Bitget spot endpoints.
* **Decision**: Passes this unified dataset to the **Alibaba Qwen-Plus** international model. Qwen executes a deep logical assessment of market conditions, generating a structured, risk-managed trade setup.
* **Execution**: Signs and executes spot market orders natively using Bitget's V2 REST API endpoint configurations (`/api/v2/spot/trade/place-order`).
* **Risk Management**: Generates technical stop-loss coordinates, take-profit limits, risk-to-reward ratios, and target portfolio capital sizing percentages (1% to 5%) per asset.
* **Open Monitoring**: Maintains an active local Position Ledger to calculate live P&L and yield analytics across open positions.

---

## 🛠 Core Feature Suite

### 1. Web3 Glassmorphic iOS Dashboard (Vercel)
A premium client dashboard designed with Apple-inspired visual patterns:
* **Dynamic CSS Particle Drift**: An ambient, lightweight background snowfall effect simulating data flows.
* **Swimming Card Physics**: Responsive cards floating on offset vertical wave keyframes for a organic, fluid feel.
* **Vivid Background Blobs**: Multi-stop radial lighting spheres to enhance visual contrast and depth perception.
* **Interactive Control Board**: Configure asset tickers, sizing metrics, and toggle Autopilot systems.

### 2. Multi-Account Simulation Toggle
Allows anyone (including hackathon judges) to evaluate the trading agent without entering live private keys:
* **Live Mode**: Submits signed trade requests to your connected Bitget account.
* **Simulation Mode**: Uses an in-memory virtual ledger to track paper positions and simulate fills.

### 3. Active Positions Tracker with Live P&L
When a trade is opened:
* An active tracker card opens on the dashboard.
* It polls live price tickers every 10 seconds, comparing current values against entry targets.
* Displays a live, floating P&L percentage with neon color coding (Green for yield, Red for loss).
* Includes a **Close Position** button that immediately submits counter-market orders to exit the position and logs the event.

### 4. Interactive Telegram Bot (`@Trade247AIBot`)
A dual-mode (commands + inline tap menus) interface featuring:
* **Inline Button Menus**: Tap-to-execute controls for market analysis, positions, and balance checks.
* **Dynamic QuickChart Candlesticks**: The `/chart [coin]` command pulls live candle data from Bitget V2 and compiles a visual 24H trendline graph image delivered as a photo.
* **Automatic Callback Routing**: Confirm, execute, or cancel trade positions with one-tap inline buttons.

### 5. Autonomous Market Radar
A background cron job running on the server:
* Automatically scans principal assets (BTC, ETH, SOL, BGB) every 4 hours.
* If the Qwen model identifies an actionable trade setup with an AI confidence score **$\ge 90\%$**, it broadcasts a high-priority alert directly to your Telegram chat with inline execution buttons.

---

## 📊 System Architecture

```text
       ┌────────────────────────┐         ┌────────────────────────┐
       │     Tavily Search      │         │   Bitget Spot Ticker   │
       │  (Unstructured News)   │         │  (Mathematical Data)   │
       └───────────┬────────────┘         └───────────┬────────────┘
                   │                                  │
                   └────────────────┬─────────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │     Alibaba Qwen LLM        │
                     │  (Math-Grounded Analysis)   │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │    TradeMind AI Engine      │
                     │    (Pipeline Orchestrator)  │
                     └──────┬───────────────┬──────┘
                            │               │
       ┌────────────────────▼───┐       ┌───▼────────────────────┐
       │     Bitget V2 API      │       │     Position Ledger    │
       │ (Signed Spot Execution)│       │ (Live P&L calculations)│
       └────────────────────────┘       └────────────────────────┘
```

---

## 📂 Repository Structure

```text
trademind-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── constants.js       # App configuration and validation rules
│   │   ├── controllers/
│   │   ├── routes/
│   │   │   ├── analyzerRoutes.js  # AI pipeline endpoints
│   │   │   └── bitgetRoutes.js    # Ledger positions and balance endpoints
│   │   ├── services/
│   │   │   ├── analyzerService.js # Pipeline orchestrator & Autopilot logic
│   │   │   ├── bitgetService.js   # HMAC-SHA256 V2 API sign & order methods
│   │   │   ├── chartService.js    # QuickChart candle trendline generator
│   │   │   ├── historyService.js  # Rolling log registry
│   │   │   ├── pingService.js     # Keep-alive Render autoping service
│   │   │   ├── positionService.js # Position ledger & P&L calculations
│   │   │   ├── qwenService.js     # Sanitized Qwen LLM prompt execution
│   │   │   └── telegramService.js # Keyboard reply & callback inline bot
│   │   └── index.js               # Express entrypoint and server boot
│   ├── package.json
│   └── .env                       # Environment credentials
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Web3 Glassmorphic dashboard
│   │   ├── index.css              # Tailwind v4 configuration and styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js             # Native Tailwind Vite plugin configuration
│   └── package.json
└── .gitignore                     # Monorepo file protection rules
```

---

## ⚡ Local Setup and Execution

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* A Telegram Bot token (from [BotFather](https://t.me/BotFather))
* A Bitget API Key, Secret, and Passphrase (with Read & Trade permissions enabled)
* A Tavily Search API Key
* An Alibaba Cloud (Qwen) API Key

### 1. Backend Configuration
Navigate into your backend folder, create your `.env` configuration file, and install dependencies:

```bash
cd backend
npm install
```

Configure your **`backend/.env`** file with your credentials:
```env
PORT=5000
NODE_ENV=development

# Telegram Bot configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Alibaba Qwen Configuration (International Studio)
QWEN_API_KEY=your-qwen-api-key
QWEN_BASE_URL=https://dashscope-international.aliyuncs.com/compatible-mode/v1

# Tavily Search Configuration
TAVILY_API_KEY=your-tavily-api-key

# Bitget V2 API Configuration
BITGET_API_KEY=your-bitget-api-key
BITGET_SECRET_KEY=your-bitget-secret-key
BITGET_PASSPHRASE=your-bitget-passphrase
BITGET_API_URL=https://api.bitget.com

# MuleRun / MuleRouter API Configuration
MULERUN_API_KEY=your-mulerun-api-key
```

Run the backend development server:
```bash
npm run dev
```
Confirm the console output displays:
`[TELEGRAM] Bot successfully initialized on polling mode.`

### 2. Frontend Configuration
Navigate into your frontend folder, update your API connection path, and install dependencies:

```bash
cd ../frontend
npm install
```

Ensure the `BACKEND_URL` in **`frontend/src/App.jsx`** points to your local backend server:
```javascript
const BACKEND_URL = 'http://localhost:5000';
```

Start the Vite React development server:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to view your upgraded Web3 dashboard.

---

## 🌐 Production Cloud Deployments

To deploy this project to production:

### 1. Backend Web Service on Render
* Create a new **Web Service** on [Render](https://render.com).
* Link your GitHub repository.
* Set the following configurations:
  * **Root Directory**: `backend` *(Critical: tells Render to navigate into the backend subfolder before executing builds)*
  * **Runtime**: `Node`
  * **Build Command**: `npm install`
  * **Start Command**: `npm start`
* Add your complete Environment Variables (matching your `.env` file) under the **Environment** settings.
* Click **Deploy**. Copy the generated URL (e.g., `https://trademind-backend.onrender.com`).

### 2. Connect Your Client to Production
Open **`frontend/src/App.jsx`** and update the `BACKEND_URL` constant with your live Render URL:
```javascript
const BACKEND_URL = 'https://trademind-backend.onrender.com';
```
Stage and push these changes to GitHub to trigger Vercel rebuilds:
```bash
git add .
git commit -m "build: point client to production cloud backend"
git push origin main
```

### 3. Frontend Static Hosting on Vercel
* Create a new project on [Vercel](https://vercel.com).
* Import your repository.
* Click edit next to **Root Directory** and select **`frontend`**.
* Click **Deploy**. Vercel will compile your styles and host your static files securely.

---

## 🤖 Telegram Bot Commands Menu

* `/start` / `/help` - Launches the interactive keyboard reply markup.
* `/status` - Performs end-to-end network latency checks on your active APIs.
* `/balance` - Retrives live, unhedged spot USDT assets.
* `/positions` - Scans open exchange positions with live P&L yields.
* `/analyze [coin]` - Formulates technical setups (Entries, exits, stop losses) for a target coin.
* `/scanner` - Triggers a multi-token parallel scan across BTC, ETH, SOL, and BGB.
* `/auto [coin] [usdt_amount]` - Triggers Autopilot analysis; executes spot order if Qwen confidence is $\ge 80\%$.

---

## 🔒 Safe Trading and Network Proxies

If you are running the bot locally in a restricted IP region, configure your network traffic using local HTTP or SOCKS5 proxies:

```bash
# Apply global proxy
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# Unset proxy when pushing normally
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## ⚖️ License
This project is released under the MIT License. Developed for the Bitget AI Base Camp Hackathon S1.
```

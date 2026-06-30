<div align="center">

<!-- Auto-playing typing text effect -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=600&size=20&duration=3000&pause=1000&color=00F0FF&center=true&vCenter=true&width=600&lines=INITIALIZING+TRADEMIND+AI+CORE...;RUNNING+SENTIMENT+ANALYSIS...;COMPILING+MATHEMATICAL+ORDER+BOOK...;ESTABLISHING+SECURE+HANDSHAKE..." alt="Typing SVG" />
</a>

<!-- Main Banner -->
<img width="1402" height="1122" alt="TradeMind AI Main Dashboard" src="https://github.com/user-attachments/assets/ba4ece55-5092-49a4-927f-e931ec841678" />

<br><br>

# 🧠 TRADEMIND AI
> **Autonomous Sentiment-to-Execution Trading Agent & Multi-Platform Trading Console**

<br>

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Alibaba Cloud](https://img.shields.io/badge/Alibaba_Cloud-FF6A00?style=for-the-badge&logo=alibabacloud&logoColor=white)
![Bitget](https://img.shields.io/badge/Bitget-00F0FF?style=for-the-badge&logo=bitcoin&logoColor=black)

</div>

---

<br>

## 🏛️ <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=5000&color=00E5FF&vCenter=true&width=800&lines=System+Architecture+%26+Execution+Topology" alt="System Architecture" />

TradeMind AI is an autonomous, sentiment-driven algorithmic trading agent designed for the **Bitget AI Base Camp Hackathon S1 (Track 1: Trading Agent · For Traders)**. 

The platform translates unstructured live web data (financial news, coin-specific catalysts, and macro updates) alongside live mathematical exchange metrics (24h high/low, price velocity, and trading volumes) into structured, risk-managed spot trades executed natively via the Bitget V2 API. 

Users monitor, manage, and execute trades through a responsive, glassmorphic Web3 dashboard hosted on Vercel or an interactive, inline-menu Telegram Bot running 24/7 on cloud infrastructure.

```text
  ┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
  │     Unstructured Web Data       │                 │     Mathematical Market Data    │
  │     - Real-Time News Catalysts  │                 │     - 24h Price High & Low      │
  │     - Macro Updates (Tavily)    │                 │     - Volumes & Velocity (Bitget)│
  └────────────────┬────────────────┘                 └────────────────┬────────────────┘
                   │                                                   │
                   └───────────────────────┬───────────────────────────┘
                                           ▼
                            ┌─────────────────────────────┐
                            │    Alibaba Qwen-Plus LLM    │
                            │   - Logic Formulation Unit  │
                            └──────────────┬──────────────┘
                                           ▼
                            ┌─────────────────────────────┐
                            │     TradeMind AI Engine     │
                            │  - Risk Guardrails / Sizing │
                            └──────┬───────────────┬──────┘
                                   │               │
            ┌──────────────────────┴┐             ┌┴──────────────────────┐
            ▼                       ▼             ▼                       ▼
┌──────────────────────┐ ┌────────────────┐ ┌───────────────┐ ┌───────────────────────┐
│ Live Execution Loop  │ │ Paper Sandbox  │ │  P&L Tracker  │ │ Telegram Companion Bot│
│ (Bitget Spot V2 API) │ │ Virtual Ledger │ │ (Polls 10s)   │ │ (Interactive Markup)  │
└──────────────────────┘ └────────────────┘ └───────────────┘ └───────────────────────┘
```

---

<br>

## 🛡️ <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=600&size=26&pause=5000&color=B026FF&vCenter=true&width=600&lines=Track+1:+Strategic+Integration+Loop" alt="Track Integration" />

TradeMind AI implements the complete, closed-loop trading strategy process required by the Track 1 guidelines:

*   **Perception (Sensory Aggregation):** Uses **Tavily Search** to crawl news engines, identifying unstructured token catalysts and recent macro-financial events. It automatically pairs this news footprint with raw mathematical market feeds (24h high, low, volume, and last price indicators) parsed from Bitget's public exchange feeds.
*   **Decision (Logical Risk Synthesis):** Combines unstructured and structured market data inside the **Alibaba Qwen-Plus** international inference engine. The model evaluates logical conflicts, compiles targets, and determines a trade setup containing clear entry points, target exits, and strict stop-loss coordinates.
*   **Execution (Automated Spot Placement):** Signs and routes trade instructions to Bitget's Spot V2 trading endpoints (`/api/v2/spot/trade/place-order`) with HMAC-SHA256 authenticated headers.
*   **Risk Mitigation (Position Guardrails):** Evaluates risk parameters to output maximum capital allocation recommendations (1% to 5% of overall assets) and structured risk-reward thresholds.
*   **Dynamic Monitoring (Performance Audits):** Preserves an active ledger session to monitor ongoing transactions, calculate yields, and process manual exits.

---

<br>

## 🧠 <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=600&size=26&pause=5000&color=00FF7F&vCenter=true&width=600&lines=Core+System+Modules" alt="Core Modules" />

### <img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=600&size=18&pause=4000&color=FFD700&vCenter=true&width=500&lines=1.+Web3+Glassmorphic+Dashboard" alt="Dashboard Module" />
A dashboard styled with modern design patterns, optimized for mobile and desktop screens:
*   **Dynamic Particle Field:** Features animated background canvas particles that simulate network data flow.
*   **Floating Card Framework:** Arranges information in clean, visually layered layouts to improve readability.
*   **Background Lighting Elements:** Uses radial color accents to create visual depth and focus.
*   **Integrated Controls:** Offers quick configuration inputs to customize tickers, transaction sizing, and autopilot preferences.

### <img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=600&size=18&pause=4000&color=FF1493&vCenter=true&width=500&lines=2.+Sandbox+Simulation+Engine" alt="Simulation Module" />
Includes a simulation toggle to let users test and review the agent's actions without requiring active API keys:
*   **Live Mode:** Connects and signs operations with your provided Bitget keys.
*   **Simulation Mode:** Executes trade actions within a local in-memory virtual ledger to demonstrate fills and behavior.

### <img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=600&size=18&pause=4000&color=1E90FF&vCenter=true&width=500&lines=3.+Position+Manager+%26+Live+P%26L" alt="Position Module" />
Tracks opened positions in real time:
*   Renders active tracking cards directly on the Web dashboard.
*   Queries live market prices every 10 seconds to compute dynamic yield performance.
*   Uses clear color coding (neon green for profit, neon red for losses) to show real-time P&L changes.
*   Includes a **Close Position** feature to quickly exit positions through standard market counter-orders.

### <img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=600&size=18&pause=4000&color=E0E0E0&vCenter=true&width=500&lines=4.+Interactive+Telegram+Bot" alt="Telegram Bot Module" />
An integrated bot (`@Trade247AIBot`) designed for 24/7 access:
*   **Quick Menu Overlays:** Provides tap-activated buttons for status updates, positions, and balance checks.
*   **Direct Visual Charting:** Features a `/chart [coin]` command that compiles historical candles from Bitget V2, returning clean trendline visualizations generated by QuickChart.
*   **Callback Support:** Supports one-tap inline buttons to quickly confirm, execute, or cancel pending positions.

### <img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=600&size=18&pause=4000&color=39FF14&vCenter=true&width=500&lines=5.+Autonomous+Market+Radar" alt="Radar Module" />
A background automation routine that monitors target assets (BTC, ETH, SOL, BGB) every 4 hours. If Qwen-Plus returns a strong trade setup with high confidence ($\ge 90\%$), the agent automatically shares a priority alert with inline execution options to the user's Telegram interface.

---

<br>

## 📂 <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=5000&color=FFA500&vCenter=true&width=400&lines=Repository+Layout" alt="Repository Layout" />

```text
trademind-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── constants.js       # Global environment constants and safety levels
│   │   ├── routes/
│   │   │   ├── analyzerRoutes.js  # AI pipeline evaluation routes
│   │   │   └── bitgetRoutes.js    # Position registers and balance routes
│   │   ├── services/
│   │   │   ├── analyzerService.js # Strategy orchestration & background cron
│   │   │   ├── bitgetService.js   # HMAC-SHA256 signature generator & order router
│   │   │   ├── chartService.js    # Bitget Spot V2 historical candle parsing
│   │   │   ├── historyService.js  # Transaction audit logs database controller
│   │   │   ├── pingService.js     # Self-pinging helper for continuous operation
│   │   │   ├── positionService.js # Local active position book
│   │   │   ├── qwenService.js     # Alibaba Qwen LLM prompt execution
│   │   │   └── telegramService.js # Bot registration & event controllers
│   │   └── index.js               # Express application and server initialization
│   ├── package.json               # Backend dependencies
│   └── .env                       # Environment keys
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Glassmorphic React dashboard
│   │   ├── index.css              # Custom Tailwind configuration
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js             # Vite compiler definitions
│   └── package.json               # Frontend dependencies
└── .gitignore                     # Git ignore rules
```

---

<br>

## 📡 <img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=600&size=24&pause=5000&color=00FFFF&vCenter=true&width=500&lines=API+Routing+Manual" alt="API Routing" />

**REST API Server Routes (Express Backend / Port 5000)**

| Target Endpoint | Method | Payload Interface | Operational Utility |
| :--- | :--- | :--- | :--- |
| `/api/analyzer/scan` | `POST` | `{ "coin": "SOL" }` | Initiates the perception-to-decision pipeline. |
| `/api/analyzer/autopilot`| `POST` | `{ "enabled": true }` | Enables or disables the autonomous scanning worker. |
| `/api/bitget/balance` | `GET` | `None` | Retrieves real-time USDT spot assets. |
| `/api/bitget/positions` | `GET` | `None` | Lists all monitored active ledger positions. |
| `/api/bitget/order` | `POST` | `{ "coin": "SOL", "side": "buy" }` | Signs and sends an immediate order to the exchange. |
| `/api/bitget/close` | `POST` | `{ "id": "pos_123" }` | Closes active positions and updates the transaction logs. |

---

<br>

## 🔐 <img src="https://readme-typing-svg.demolab.com?font=Share+Tech+Mono&weight=600&size=24&pause=5000&color=FFFF00&vCenter=true&width=600&lines=Environment+Configuration+Map" alt="Environment Map" />

Below is the required registry of configurations for running the TradeMind AI backend:

| Config Key | Context Location | Usage | Required? | Fallback Mode |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Server-side | Port configuration for the Express service. | *Optional* | Defaults to port `5000`. |
| `TELEGRAM_BOT_TOKEN` | Server-side | Bot token generated by BotFather. | **Yes** | Telegram services will fail to launch. |
| `QWEN_API_KEY` | Server-side | Access key for Alibaba DashScope. | **Yes** | AI analysis features will be disabled. |
| `QWEN_BASE_URL` | Server-side | DashScope international base URL. | *Optional* | Defaults to Singapore international gateway. |
| `TAVILY_API_KEY` | Server-side | Search API key for financial news inputs. | **Yes** | Sentiment-based trading parameters are skipped. |
| `BITGET_API_KEY` | Server-side | API key with read and trade permissions. | *Optional* | Restricts trading to Simulation Mode. |
| `BITGET_SECRET_KEY` | Server-side | Secret key for signing trading payloads. | *Optional* | Restricts trading to Simulation Mode. |
| `BITGET_PASSPHRASE` | Server-side | User passphrase for Bitget API keys. | *Optional* | Restricts trading to Simulation Mode. |
| `BITGET_API_URL` | Server-side | Target endpoint for Bitget operations. | *Optional* | Defaults to `https://api.bitget.com`. |

---

<br>

## 💻 <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=5000&color=32CD32&vCenter=true&width=700&lines=Local+Deployment+Guide" alt="Local Deployment" />

### 1. Build & Run the Backend API Server
Navigate into the backend project folder, install dependencies, and run the service:
```bash
cd backend
npm install
```

Create a `.env` configuration file in your **`backend/`** directory matching the keys in the **Environment Configuration Map**.

Start the backend development environment:
```bash
npm run dev
```

Confirm that the initialization processes complete successfully:
`[TELEGRAM] Bot successfully initialized on polling mode.`

### 2. Build & Run the Client Interface
Navigate to the frontend folder, install dependencies, and start the dashboard:
```bash
cd ../frontend
npm install
```

Verify that the `BACKEND_URL` reference inside **`frontend/src/App.jsx`** points to your local server instance:
```javascript
const BACKEND_URL = 'http://localhost:5000';
```

Launch the Vite client dashboard:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to view your upgraded Web3 dashboard.

---

<br>

## 🚀 <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=600&size=24&pause=5000&color=4169E1&vCenter=true&width=700&lines=Production+Deployment+Configurations" alt="Production Deployment" />

### 1. Backend Web Service on Render
1.  Set up a new **Web Service** on [Render](https://render.com) and connect your GitHub repository.
2.  Define the following structural deployment properties:
    *   **Root Directory:** `backend` *(Directs the container configuration to the backend folder)*
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
3.  Add your active environment variables to the Render configuration panel matching your `.env` settings.
4.  Copy your live backend URL (e.g., `https://trademind-backend.onrender.com`).

### 2. Connect Your Client to Production
Update the `BACKEND_URL` variable inside **`frontend/src/App.jsx`** to use your live Render address:
```javascript
const BACKEND_URL = 'https://trademind-backend.onrender.com';
```

Commit and push your changes to redeploy on Vercel:
```bash
git add .
git commit -m "build: point client to production cloud backend"
git push origin main
```

### 3. Frontend Static Hosting on Vercel
1.  Import your repository into [Vercel](https://vercel.com).
2.  Change the **Root Directory** field to **`frontend`**.
3.  Click **Deploy**. Vercel will compile your styles and host your static files securely.

---

<br>

## 🤖 <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=5000&color=32CD32&vCenter=true&width=700&lines=Telegram+Bot+Commands+Menu" alt="Telegram Menu" />

*   `/start` / `/help` - Launches the interactive keyboard reply markup.
*   `/status` - Performs end-to-end network latency checks on your active APIs.
*   `/balance` - Retrieves live, unhedged spot USDT assets.
*   `/positions` - Scans open exchange positions with live P&L yields.
*   `/analyze [coin]` - Formulates technical setups (Entries, exits, stop losses) for a target coin.
*   `/scanner` - Triggers a multi-token parallel scan across BTC, ETH, SOL, and BGB.
*   `/auto [coin] [usdt_amount]` - Triggers Autopilot analysis; executes spot order if Qwen confidence is $\ge 80\%$.

---

<br>

## 🚨 <img src="https://readme-typing-svg.demolab.com?font=Bitcount+Ink&weight=600&size=24&pause=5000&color=DC143C&vCenter=true&width=700&lines=Proxy+%26+Network+Troubleshooting" alt="Proxy Troubleshooting" />

If you run the backend or Telegram agent from restricted IP regions, configure proxy routes to maintain reliable connections with Bitget's servers:

```bash
# Set global console traffic rules
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# Reset the console rules
git config --global --unset http.proxy
git config --global --unset https.proxy
```

<br><br>

<div align="center">
  <i>Developed to streamline autonomous web-to-execution workflows.</i>
  <br><br>
  <b><a href="https://x.com/asiwajubtc">@asiwajubtc</a></b>
</div>

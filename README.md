# Plutus 🚀
# [ Demo Video ](https://youtu.be/_wqJNcnHbG0)

**Plutus** is an intelligent, real-time DeFi dashboard designed to simplify yield farming and portfolio management on Ethereum. By aggregating live data from major protocols and integrating an AI-driven analyst, Plutus empowers users to discover high-yield opportunities and make data-backed investment decisions with confidence.

---

## 📑 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧐 Problem Statement

The Decentralized Finance (DeFi) landscape is rapidly expanding, but it remains fragmented and difficult to navigate for the average user.

*   **Fragmentation**: Users must visit dozens of separate protocol interfaces (Aave, Uniswap, Curve) to compare rates.
*   **Data Latency**: Traditional dashboards often serve stale data, leading to missed opportunities in a fast-moving market.
*   **Complexity**: analyzing risk, impermanent loss, and reward tokenomics requires deep technical expertise.
*   **Analysis Paralysis**: With thousands of pools available, knowing *where* to allocate capital is overwhelming.

## 💡 Solution Overview

Plutus solves these challenges by providing a **unified, intelligent interface**:

1.  **Aggregates** yield data across protocols into a single, normalized view.
2.  **Updates** data in real-time using a custom WebSocket architecture.
3.  **Analyzes** opportunities using **Agent X402**, an embedded AI that acts as your personal DeFi quantitative analyst.

---

## ✨ Key Features

### 🔥 Real-Time Yield Dashboard
*   **Live Updates:** Unlike static dashboards, Plutus uses a WebSocket connection to stream price and APY updates the moment they happen on-chain.
*   **Multi-Protocol Support:** Currently tracks lending and liquidity pools from **Aave V3**, **Uniswap V3**, **Aerodrome**, and more.
*   **Risk Grading:** Automatically categorizes pools into Risk Tiers (Low/Medium/High) based on asset type and impermanent loss exposure.

### 🤖 Agent X402 (AI Analyst)
*   **Context-Aware:** The agent doesn't just "chat"; it consumes the live market data displayed on your dashboard.
*   **Investment Advice:** Ask questions like *"Where can I get the best stablecoin yield with low risk?"* and get data-backed answers.
*   **Protocol Explanation:** The agent can explain complex mechanisms (e.g., "How does Aave's E-Mode work?") in simple terms.

### 💰 Portfolio Tracking
*   **Wallet Connection:** Seamlessly connect via **RainbowKit** to view your real-time ETH and token balances.
*   **Visual Analytics:** Interactive area charts visualize historical APY trends and portfolio utilization.

---

## 🏗️ Architecture & Data Flow

Plutus is built on a custom hybrid architecture to ensure maximum performance and data freshness.

### 1. The Backend (Node.js + Socket.IO)
*   **Custom Server**: We replaced the standard Next.js server with a custom Node.js server (`server.js`) to support long-running processes.
*   **Data Poller**: A background job runs every **10 seconds**, querying **The Graph** subgraphs (e.g., Aave V3) for the latest rates.
*   **Broadcaster**: When new data is detected, the server emits a `yield-update` event via **Socket.IO** to all connected clients.

### 2. The Frontend (Next.js 16)
*   **Client-Side State**: React hooks subscribe to the WebSocket feed, updating the UI instantly without page reloads.
*   **AI Integration**: When you ask the Agent a question, the frontend bundles your query with a snapshot of the current market state and sends it to `/api/agent`.

```mermaid
graph TD
    A[The Graph / DefiLlama] -->|Poll (10s)| B(Node.js Custom Server)
    B -->|Emit Update| C(WebSocket)
    C -->|Stream| D[Client Dashboard]
    D -->|User Query + Data| E[AI Agent Endpoint]
    E -->|Analyze| F[OpenAI API]
    F -->|Insight| D
```

---

## 🛠️ Tech Stack

### Core
*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Server:** Node.js (Custom) + [Socket.IO](https://socket.io/)

### Frontend & UI
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Components:** [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
*   **State Management:** React Hooks + Context
*   **Charts:** [Recharts](https://recharts.org/)

### Web3 & Data
*   **Wallet:** [RainbowKit](https://www.rainbowkit.com/) + [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/)
*   **Indexing:** [The Graph](https://thegraph.com/) (GraphQL)
*   **AI:** OpenAI API (GPT-4o)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   npm or yarn
*   A WalletConnect Cloud Project ID (free)
*   OpenAI API Key
*   The Graph API Key (optional, falls back to public gateway if available)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/plutus.git
    cd plutus
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root:
    ```env
    # Data Sources
    GRAPH_API_KEY=your_graph_key
    
    # AI Capability
    OPENAI_API_KEY=sk-...

    # Wallet Connection
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wc_project_id
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    > **Note:** This runs `node server.js`, which starts both the Next.js app and the WebSocket server.

5.  **Access the App**
    Open `http://localhost:3000` to view the dashboard.

---

## 🔌 API Documentation

Plutus exposes internal APIs that you can use to extend the platform.

### `GET /api/yields`
Returns the current aggregated list of yield opportunities.

**Response:**
```json
{
  "timestamp": "2024-02-01T12:00:00Z",
  "data": [
    {
      "protocol": "Aave V3",
      "symbol": "USDC",
      "apy": 4.5,
      "tvl": 150000000,
      "risk": "Low"
    }
  ],
  "pagination": { "page": 1, "limit": 50 }
}
```

### `POST /api/agent`
Interacts with Agent X402.

**Body:**
```json
{
  "messages": [{ "role": "user", "content": "Is it safe to lend USDC?" }],
  "marketData": [...] // Optional: Pass current market context
}
```

---

## 🗺️ Roadmap

*   **Q1 2026**
    *   [x] MVP Dashboard with Aave V3 integration
    *   [x] Basic AI Agent implementation
    *   [ ] Mobile-responsive layout refinement
*   **Q2 2026**
    *   [ ] One-click "Zap" (Investment) transactions
    *   [ ] User portfolio historical tracking (P&L)
    *   [ ] Integration with Layer 2s (Arbitrum, Optimism)

---

## 🤝 Contributing

We welcome contributions from the community!

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/NewProtocol`)
3.  Commit your changes (`git commit -m 'Add Compound V3 support'`)
4.  Push to the branch (`git push origin feature/NewProtocol`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

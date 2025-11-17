# 🧬 miRTargetLink2 MCP

**A TypeScript-based MCP (Model Context Protocol) server for automated retrieval of miRNA–target interaction data from [miRTargetLink 2.0](https://ccb-compute.cs.uni-saarland.de/mirtargetlink2/)**

Developed at Saarland University (Bioinformatics) for network-based microRNA–target interaction exploration, with integration for **Anthropic’s Claude Desktop** via MCP.

---

## 📘 Overview

`miRTargetLink2_MCP` enables **automated extraction of miRNA–target interactions** (validated, predicted, and network-level) from the **miRTargetLink 2.0** web platform.

It exposes the data as a **Claude MCP Tool**, supporting:
- 🧪 *Validated* interactions (experimentally verified)
- 💻 *Predicted* interactions (computationally inferred)

---

## 🧱 Core Stack

| Component | Purpose | Notes |
|------------|----------|-------|
| **TypeScript + Node.js (ESM)** | Main runtime | Modern type-safe backend |
| **@modelcontextprotocol/sdk** | MCP interface | Provides `McpServer` + `StdioTransport` |
| **Axios** | HTTP client | Handles web requests and form POSTs |
| **Cheerio** | HTML parser | Extracts tabular data from miRTargetLink pages |
| **Puppeteer** *(optional)* | Browser automation | Used as fallback if the server enforces CSRF |
| **Zod** | Input validation | Ensures safe query structure |

---

## ⚙️ System Requirements

| Tool | Minimum Version | Install Command |
|------|------------------|----------------|
| **Node.js** | ≥ 18.x | `sudo apt install nodejs` or [Download](https://nodejs.org/) |
| **npm** | ≥ 9.x | Comes with Node |
| **Git** | any | `sudo apt install git` |


---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/kkShrihari/mirTargetLink2_mcp.git
cd mirTargetLink2_mcp
```

### 2️⃣ Install all dependencies
```bash
npm install
```

If Puppeteer’s Chrome download fails:
```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer
```

---

## 🧩 Included Dependencies

**Runtime Dependencies**
```json
"@modelcontextprotocol/sdk": "^1.22.0",   // MCP communication layer
"axios": "^1.6.7",                        // Handles HTTP(S) requests
"cheerio": "^1.0.0-rc.12",                // Parses HTML pages
"dotenv": "^16.6.1",                      // Loads environment variables
"zod": "^3.25.76",                        // Validates query input
"puppeteer": "^23.5.3"                    // Automates browser actions (fallback)
```

**Development Dependencies**
```json
"typescript": "^5.6.3",                   // TypeScript compiler
"ts-node": "^10.9.2",                     // Runs TS files directly
"@types/node": "^22.0.0",                 // Node.js type definitions
"@types/cheerio": "^0.22.35"              // Cheerio type definitions
```

---

## 🧰 Build and Run

### 🛠️ Build the project
```bash
npm run build
```

### ▶️ Run the MCP Server
```bash
npm start
```

Expected output:
```
[INFO] Starting miRTargetLink2 MCP server...
[INFO] Connecting server via stdio transport...
[INFO] miRTargetLink 2 MCP server is live and ready.
```

If this appears and stays active — your server is healthy.  
If it exits early in Claude, check `stderr` logs inside Claude’s Developer Console.

---

## 🧪 Local Testing (without Claude)

Test using your local `test.ts` file:
```bash
npm run test
```

Expected output example:
```json
{
  "success": true,
  "query": "TP53",
  "mode": "validated",
  "interactionsCount": 45,
  "nodesCount": 20
  "interactions": [
    { "miRNA": "hsa-miR-21-5p", "target": "TP53", "support": "strong", "source": "miRTarBase", "experiment": "Luciferase assay", "reference": "PMID123456" },
    { "miRNA": "hsa-miR-34a-5p", "target": "TP53", "support": "moderate", "source": "miRWalk", "experiment": "qPCR", "reference": "PMID234567" },
    ...
  ],
  "nodes": [
    { "source": "TP53", "categorySet": "KEGG", "category": "Apoptosis", "nodeType": "gene", "coveredEntities": "12" },
    ...
  ]
}

```

If the site blocks requests (HTTP 403 or 404), Puppeteer will automatically retry using a headless browser.

---

## ⚙️ Project Structure

```
mirTargetLink2_mcp/
├── manifest.json                # MCP manifest for Claude
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── tools/
│   │   └── source.ts            # Core logic (axios + cheerio + puppeteer)
│   └── tests/
│       └── test.ts              # Local test runner
└── build/                       # Compiled JS output
```

---

## 🧩 Integration with Claude Desktop

To make this module accessible inside Claude:

### Step 1: Package into `.dxt`
```bash
zip -r mirTargetLink2_mcp.dxt manifest.json package.json build node_modules
```

### Step 2: Move to Claude MCP directory

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/mcp/` |
| Linux | `~/.config/Claude/mcp/` |
| Windows | `%APPDATA%\Claude\mcp\` |

### Step 3: Restart Claude

Your tool will appear in the **“Tools”** tab under the name:  
> `miRTargetLink 2 MCP`

---

## 🧠 Troubleshooting

| Error | Likely Cause | Fix |
|--------|--------------|-----|
| `Server transport closed unexpectedly` | Claude terminated the MCP connection | Keep process alive with `await new Promise(() => {})` |
| `403 Forbidden (CSRF verification failed)` | miRTargetLink2 blocks non-browser POSTs | Use Puppeteer fallback (already handled) |
| `404 Not Found` | Site endpoint changed | Check base URL in `source.ts` |
| `EADDRINUSE: Port 6277` | MCP Inspector still running | Kill with `pkill -f modelcontextprotocol` |

---

## 🧾 Citation

If you use this module in academic work, please cite:

> Oki & Ohta *et al.*,  
> **miRTargetLink 2.0: microRNA–target interaction network analysis.**  
> *Nucleic Acids Research*, Volume 51, Issue W1, July 2023, Pages W88–W95.  
> [https://ccb-compute.cs.uni-saarland.de/mirtargetlink2](https://ccb-compute.cs.uni-saarland.de/mirtargetlink2)

---

## 👤 Author

**Shrihari Kamalan Kumarguruparan**  
Bioinformatics, Saarland University  
📧 `shka00003@stud.uni-saarland.de`  
GitHub: [kkShrihari](https://github.com/kkShrihari)

---

### ✅ Quick Setup for Reviewers

```bash
git clone https://github.com/kkShrihari/mirTargetLink2_mcp.git
cd mirTargetLink2_mcp
npm install
npm run build
npm start
```

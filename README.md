# 🧬 miRTargetLink2_MCP

**A TypeScript-based MCP module to retrieve validated, predicted, and network-level miRNA–target interactions from [miRTargetLink 2.0](https://ccb-web.cs.uni-saarland.de/mirtargetlink/)**

Developed as part of the Saarland University bioinformatics tool ecosystem.  
Implements **Anthropic MCP-compatible interfaces**, with **local testing and full automation**.

---

## 📘 Overview

`miRTargetLink2_MCP` provides programmatic access to **miRNA–target interaction data** from the *miRTargetLink 2.0* web resource (Oki & Ohta, NAR 2024).  
The module supports three major modes:
- Experimentally **validated** targets  
- Computationally **predicted** targets  
- Network-level **interaction graphs**

The module is built with:
- ⚙️ **TypeScript + Node.js**
- 🧩 **fastMCP** (Anthropic MCP integration)
- 🕵️ **Puppeteer** for web scraping
- 📊 **cli-table3** for readable console output

---

## 🧱 Features

| Mode | Description | Output |
|------|--------------|---------|
| `validated` | Fetches experimentally validated miRNA–target pairs | Gene name, evidence type, PubMed link |
| `predicted` | Fetches computationally predicted pairs | Gene name, prediction confidence |
| `network` | Retrieves full interaction networks | JSON graph (nodes & edges) |

---

## ⚙️ Requirements

Make sure you have the following installed:

| Tool | Version | Install Command |
|------|----------|----------------|
| **Node.js** | ≥ 18.x | [Download](https://nodejs.org/) or `sudo apt install nodejs` |
| **npm** | ≥ 9.x | Comes with Node |
| **Chromium / Google Chrome** | Any | `sudo apt install chromium-browser` |
| **Git** | Any | `sudo apt install git` |

> 💡 Puppeteer requires a Chrome/Chromium binary.  
> Verify your browser path with:
> ```bash
> which chromium-browser
> ```

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

If you see Puppeteer Chrome download errors, skip it:
```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer
```

---

## 🧰 Included Dependencies

All dependencies are pre-declared in `package.json`:

**Core**
```json
"axios", "cheerio", "p-queue", "papaparse", "puppeteer", "cli-table3", "fs-extra", "xlsx", "zod", "fastmcp"
```

**Development**
```json
"typescript", "ts-node", "eslint", "prettier",
"@types/node", "@types/cheerio", "@types/fs-extra", "@types/papaparse"
```

---

## 🚀 Running the MCP Server

To build and run the MCP module:
```bash
npm start
```

If everything works, you’ll see:
```
🚀 miRTargetLink2_MCP server initialized and ready.
[FastMCP warning] could not infer client capabilities after 10 attempts. Connection may be unstable.
```

That message is normal — it just means Claude isn’t connected yet.

---

## 🧪 Local Testing

You can run built-in tests without Claude:

```bash
npm test
```

Or directly run the test file:
```bash
node --loader ts-node/esm src/tests/localTests.ts
```

Expected output:
```json
{
  "success": true,
  "query": "hsa-miR-21-5p",
  "mode": "validated",
  "message": "45 validated targets found"
}
```

---

## 📁 Project Structure

```
mirTargetLink2_mcp/
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
├── manifest.json
├── dist/
├── src/
│   ├── index.ts                  # MCP server entry point
│   ├── tools/
│   │   └── miRTargetLinkTool.ts  # Core scraper + logic
│   └── tests/
│       └── localTests.ts         # Local execution test
```

---

## 🧩 Using with Claude / MCP

To integrate with **Claude Desktop (Anthropic MCP)**:

1. Copy or link your built `.dxt` package into Claude’s MCP tools directory:
   ```
   ~/Library/Application Support/Claude/mcp/mirTargetLink2_MCP.dxt
   ```
   or
   ```
   ~/.config/Claude/mcp/
   ```

2. Add to Claude’s config file (`claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "mirTargetLink2": {
         "command": "node",
         "args": ["dist/src/index.js"],
         "workingDirectory": "/path/to/mirTargetLink2_mcp"
       }
     }
   }
   ```

3. Restart Claude Desktop — your MCP tool should now appear in the **Tools** menu.

---

## 🧠 Notes

- Works offline with cached pages (if supported).
- No API keys required.
- Safe error handling for downtime or missing results.
- Runs on Linux, macOS, and Windows.

---

## 🧾 Citation

> **Oki, S. & Ohta, T. (2024)**  
> *ChIP-Atlas 3.0: a data-mining suite to explore chromosome architecture together with large-scale regulome data.*  
> *Nucleic Acids Research*, Oxford University Press.  
> DOI: [10.1093/nar/gkae358](https://doi.org/10.1093/nar/gkae358)

---

## 👤 Author

**Shrihari Kamalan Kumarguruparan**  
📧 `shka00003@stud.uni-saarland.de`  
University of Saarland — Bioinformatics  
GitHub: [kkShrihari](https://github.com/kkShrihari)

---

## 🧩 Quick Setup (for Supervisors / Reviewers)

```bash
git clone https://github.com/kkShrihari/mirTargetLink2_mcp.git
cd mirTargetLink2_mcp
npm install
PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer
npm run build
npm start
```

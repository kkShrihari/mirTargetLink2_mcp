import puppeteer from "puppeteer";
import axios from "axios";
import { execSync } from "child_process";

/** Tool input */
interface MiRTargetQuery {
  mode: "validated" | "predicted" | "network";
  name: string; // e.g. "hsa-miR-21-5p"
}

/** Result entry */
interface MiRTargetResult {
  miRNA: string;
  targetGene: string;
  evidenceType?: string;
  link?: string;
}

/** Unified response */
interface ToolResponse {
  success: boolean;
  message: string;
  payload?: any;
}

/**
 * Helper: detect local Chromium or Chrome executable
 */
function detectBrowserPath(): string | undefined {
  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/snap/bin/chromium"
  ];

  for (const path of candidates) {
    try {
      execSync(`test -x ${path}`);
      return path;
    } catch {
      continue;
    }
  }

  console.warn("⚠️  No local Chrome/Chromium found — Puppeteer will use its own bundled version (if available).");
  return undefined;
}

/**
 * Scraper for miRTargetLink 2.0 using Puppeteer
 */
class MiRTargetLinkTool {
  private baseUrl = "https://ccb-compute.cs.uni-saarland.de/mirtargetlink2/";

  async execute(input: MiRTargetQuery): Promise<ToolResponse> {
    const { mode, name } = input;

    if (!name) return { success: false, message: "Error: miRNA name is required." };

    try {
      console.log(`Fetching ${mode} targets for ${name}...`);

      if (mode === "validated") {
        const data = await this.fetchTable(name, "validated");
        return {
          success: true,
          message: `${data.length} validated targets found`,
          payload: data
        };
      }

      if (mode === "predicted") {
        const data = await this.fetchTable(name, "predicted");
        return {
          success: true,
          message: `${data.length} predicted targets found`,
          payload: data
        };
      }

      if (mode === "network") {
        const url = `${this.baseUrl}api/export/json/${encodeURIComponent(name)}`;
        try {
          const response = await axios.get(url);
          return {
            success: true,
            message: "Network JSON retrieved",
            payload: response.data
          };
        } catch (err: any) {
          return {
            success: false,
            message: `Network data unavailable (HTTP ${err.response?.status || "error"})`
          };
        }
      }

      return { success: false, message: "Invalid mode. Use validated, predicted, or network." };
    } catch (err: any) {
      return { success: false, message: `Error fetching data: ${err.message}` };
    }
  }

  /**
   * Fetch dynamically rendered tables with Puppeteer
   */
  private async fetchTable(miRNA: string, type: "validated" | "predicted"): Promise<MiRTargetResult[]> {
    const browserPath = detectBrowserPath();
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: browserPath
    });

    const page = await browser.newPage();
    const targetUrl = `${this.baseUrl}?searchType=${type}&mirna=${encodeURIComponent(miRNA)}`;
    console.log("🌐 Opening:", targetUrl);

    try {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    } catch {
      console.error("⚠️  Page load timed out — site might be slow or down.");
      await browser.close();
      return [];
    }

    // Detect if table exists
    const tableSelector = type === "validated" ? "#validatedTable" : "#predictedTable";
    try {
      await page.waitForSelector(`${tableSelector} tbody tr`, { timeout: 15000 });
    } catch {
      console.error(`⚠️  ${type} table not found on page. Possibly empty or site down.`);
      await browser.close();
      return [];
    }

    const rows = await page.$$eval(
      `${tableSelector} tbody tr`,
      (trs, miRNA) =>
        trs.map((tr) => {
          const cols = Array.from(tr.querySelectorAll("td"));
          const gene = cols[0]?.textContent?.trim() || "";
          const evidence = cols[1]?.textContent?.trim() || "";
          const link = (cols[0]?.querySelector("a") as HTMLAnchorElement)?.href || undefined;
          return { miRNA, targetGene: gene, evidenceType: evidence, link };
        }),
      miRNA
    );

    await browser.close();
    return rows as MiRTargetResult[];
  }
}

export const miRTargetLinkTool = new MiRTargetLinkTool();


// src/tools/miRTargetLinkTool.ts
import { Page } from "puppeteer";
import Table from "cli-table3"; // ✅ ESM-compatible import

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function waitForNewTableContent(
  page: Page,
  prevText: string,
  timeoutMs = 150000
) {
  console.log("⏳ Waiting for table reload (with loading indicators)...");
  try {
    await page
      .waitForFunction(() => {
        const table = document.querySelector("#interactionTable tbody");
        return table && table.textContent?.includes("Loading...");
      }, { timeout: 20000 })
      .catch(() => {});

    await page.waitForFunction(() => {
      const table = document.querySelector("#interactionTable tbody");
      return table && !table.textContent?.includes("Loading...");
    }, { timeout: timeoutMs });

    await page.waitForFunction(() => {
      const rows = document.querySelectorAll("#interactionTable tbody tr");
      return rows && rows.length > 0;
    }, { timeout: 30000 });

    await sleep(2500);
    const count = await page.$$eval("#interactionTable tbody tr", (r) => r.length);
    console.log(`✅ Table reloaded successfully (${count} rows).`);
  } catch {
    throw new Error("Table reload did not complete properly (timeout).");
  }
}

export async function extractInteractionTable(page: Page, limit = 10) {
  const interactionRows = await page.$$("#interactionTable tbody tr");
  if (interactionRows.length === 0) {
    console.log("⚠️ Interaction Table is empty (no data available for this mode).");
    return;
  }

  const interactions = await page.$$eval(
    "#interactionTable tbody tr",
    (rows, limit) =>
      rows.slice(0, limit).map((tr) => {
        const tds = Array.from(tr.querySelectorAll("td"));
        const get = (i: number) =>
          (tds[i]?.textContent?.trim() || "").replace(/\s+/g, " ");
        return [get(0), get(1), get(2), get(3), get(4), get(5)];
      }),
    limit
  );

  const interactionTable = new Table({
    head: ["miRNA", "Target", "Support", "Source", "Experiments", "Reference"],
    colWidths: [22, 22, 10, 12, 15, 12],
    wordWrap: true,
  });

  interactions.forEach((r) => interactionTable.push(r));
  console.log("\n📊 Interaction Table (Top 10):");
  console.log(interactionTable.toString());
}

export async function extractNodeTable(page: Page, limit = 10) {
  const nodeRows = await page.$$("#nodeTable tbody tr");
  if (nodeRows.length === 0) {
    console.log("⚠️ Node Annotation Table is empty (no data available for this mode).");
    return;
  }

  const nodes = await page.$$eval(
    "#nodeTable tbody tr",
    (rows, limit) =>
      rows.slice(0, limit).map((tr) => {
        const tds = Array.from(tr.querySelectorAll("td"));
        const get = (i: number) =>
          (tds[i]?.textContent?.trim() || "").replace(/\s+/g, " ");
        return [get(0), get(1), get(2), get(3), get(4)];
      }),
    limit
  );

  const nodeTable = new Table({
    head: ["Source", "CategorySet", "Category", "NodeType", "CoveredEntities"],
    colWidths: [15, 20, 22, 12, 65],
    wordWrap: true,
  });

  nodes.forEach((r) => nodeTable.push(r));
  console.log("\n🧬 Node Annotation Table (Top 10):");
  console.log(nodeTable.toString());
}

export async function setOption(page: Page, selector: string, checked: boolean) {
  await page.evaluate(
    ({ selector, checked }) => {
      const el = document.querySelector(selector) as HTMLInputElement;
      if (el) {
        el.checked = checked;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    { selector, checked }
  );
}

// ================================
// 🧬 Main entry point for MCP use
// ================================
import puppeteer, { executablePath } from "puppeteer";

export async function runMiRTargetLink(input: { query: string; mode?: string }) {
  const { query, mode = "validated" } = input;
  console.log(`🚀 Starting miRTargetLink run for query: ${query} (mode: ${mode})`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // --- Load website ---
  await page.goto("https://ccb-compute.cs.uni-saarland.de/mirtargetlink2/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // --- Type query ---
  await page.waitForSelector("input.form-control");
  await page.type("input.form-control", query, { delay: 50 });
  await page.click("button.btn.btn-info");

  // --- Wait for redirect to results page ---
  await page.waitForFunction(
    () =>
      window.location.href.includes("/network/") ||
      window.location.href.includes("/unidirectional_search/"),
    { timeout: 60000 }
  );

  console.log("➡️ Loaded results page:", await page.url());
  await page.waitForSelector("#interactionTable tbody", { timeout: 60000 });

  // --- Select correct combination based on mode ---
  if (mode === "validated") {
    console.log("🔬 Using Validated Interactions (Weak + Strong).");
    await setOption(page, "#targetCheckboxWeak", true);
    await setOption(page, "#targetCheckboxStrong", true);
    await setOption(page, "#targetCheckboxPredicted", false);
  } else {
    console.log("🔬 Using Predicted Interactions only.");
    await setOption(page, "#targetCheckboxWeak", false);
    await setOption(page, "#targetCheckboxStrong", false);
    await setOption(page, "#targetCheckboxPredicted", true);
  }

  // --- Enable pathways and neighbors ---
  await setOption(page, "#miRNAPathwaySwitch", true);
  await setOption(page, "#neighboursSwitch", true);
  await page.select("#layoutSelect", "euler");
  await page.click("#updateConfig");

  // --- Wait for new data ---
  const oldText = await page.$eval("#interactionTable tbody", (el) => el.textContent || "");
  await waitForNewTableContent(page, oldText, 120000);

  // --- Extract both tables ---
  await extractInteractionTable(page);
  await extractNodeTable(page);

  // --- Cleanup ---
  await browser.close();
  console.log(`✅ Completed miRTargetLink analysis for: ${query}`);

  // Return structured result for MCP
  return {
    success: true,
    query,
    mode,
    message: `miRTargetLink 2.0 analysis completed successfully for '${query}' in mode '${mode}'.`,
  };
}

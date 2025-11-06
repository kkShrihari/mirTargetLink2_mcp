
import puppeteer, { executablePath } from "puppeteer";
import {
  waitForNewTableContent,
  extractInteractionTable,
  extractNodeTable,
  setOption,
} from "../tools/miRTargetLinkTool.js";


(async () => {
  const testQueries = [
    { name: "hsa-miR-21-5p [Homo sapiens] - miRNA", label: "miRNA (Human)" },
    { name: "mmu-miR-1191b-3p [Mus musculus] - miRNA", label: "miRNA (Mouse)" },
    { name: "rno-miR-125b-5p [Rattus norvegicus] - miRNA", label: "miRNA (Rat)" },
    { name: "TP53 [Homo sapiens] - Gene", label: "Gene (Human)" },
    { name: "MAPK signaling pathway [Homo sapiens] - Pathway", label: "Pathway (Human)" },
  ];

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    for (const query of testQueries) {
      console.log("\n==================================================");
      console.log(`🔬 Testing input: ${query.label}`);
      console.log("==================================================");

      await page.goto("https://ccb-compute.cs.uni-saarland.de/mirtargetlink2/", {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      await page.waitForSelector("input.form-control");
      await page.type("input.form-control", query.name, { delay: 60 });
      await page.click("button.btn.btn-info");

      await page.waitForFunction(
        () =>
          window.location.href.includes("/network/") ||
          window.location.href.includes("/unidirectional_search/"),
        { timeout: 60000 }
      );

      console.log(`➡️ Loaded results page for: ${query.name}`);
      await page.waitForSelector("#interactionTable tbody", { timeout: 60000 });

      // Combination 1
      console.log("\n==============================");
      console.log("🔬 Combination 1 – Weak + Strong Validated + Pathways + Other miRNAs");
      console.log("==============================");

      const oldText1 = await page.$eval("#interactionTable tbody", (el) => el.textContent || "");
      await setOption(page, "#targetCheckboxWeak", true);
      await setOption(page, "#targetCheckboxStrong", true);
      await setOption(page, "#targetCheckboxPredicted", false);
      await setOption(page, "#miRNAPathwaySwitch", true);
      await setOption(page, "#neighboursSwitch", true);
      await page.select("#layoutSelect", "euler");
      await page.click("#updateConfig");

      await waitForNewTableContent(page, oldText1, 90000);
      console.log("✅ Combination 1 updated.");
      await extractInteractionTable(page);
      await extractNodeTable(page);

      // Combination 2
      console.log("\n==============================");
      console.log("🔬 Combination 2 – Predicted + Pathways + Other miRNAs");
      console.log("==============================");

      const oldText2 = await page.$eval("#interactionTable tbody", (el) => el.textContent || "");
      await setOption(page, "#targetCheckboxWeak", false);
      await setOption(page, "#targetCheckboxStrong", false);
      await setOption(page, "#targetCheckboxPredicted", true);
      await setOption(page, "#miRNAPathwaySwitch", true);
      await setOption(page, "#neighboursSwitch", true);
      await page.select("#layoutSelect", "euler");
      await page.click("#updateConfig");

      await waitForNewTableContent(page, oldText2, 150000);
      console.log("✅ Combination 2 updated.");
      await extractInteractionTable(page);
      await extractNodeTable(page);

      console.log(`\n✅ Completed for ${query.label}`);
    }

    await browser.close();
    console.log("\n🎉 All species and input types tested successfully!");
    console.log("-----------------------------------------------------");
  } catch (err: any) {
    console.error("❌ Test failed:", err.message || err);
  }
})();

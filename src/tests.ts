import { runMiRTargetLink } from "../tools/source.js";

async function main() {
  const result = await runMiRTargetLink({ query: "TP53", mode: "validated" });
  console.error("[TEST OUTPUT]", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("[TEST ERROR]", err);
});

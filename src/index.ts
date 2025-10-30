import { miRTargetLinkTool } from "./tools/miRTargetLinkTool";

(async () => {
  const testMiRNA = "hsa-miR-21-5p";

  console.log("Fetching validated targets...");
  const validated = await miRTargetLinkTool.execute({
    mode: "validated",
    name: testMiRNA,
  });
  console.log(JSON.stringify(validated, null, 2));

  console.log("Fetching predicted targets...");
  const predicted = await miRTargetLinkTool.execute({
    mode: "predicted",
    name: testMiRNA,
  });
  console.log(JSON.stringify(predicted, null, 2));

  console.log("Fetching network JSON...");
  const network = await miRTargetLinkTool.execute({
    mode: "network",
    name: testMiRNA,
  });
  console.log(JSON.stringify(network, null, 2));
})();

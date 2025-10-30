import { miRTargetLinkTool } from "../tools/miRTargetLinkTool";

(async () => {
  const testMiRNA = "hsa-miR-21-5p";

  console.log(" Testing validated targets fetch...");
  const validated = await miRTargetLinkTool.execute({
    mode: "validated",
    name: testMiRNA,
  });
  console.log(" Validated targets:", validated.message);

  console.log(" Testing predicted targets fetch...");
  const predicted = await miRTargetLinkTool.execute({
    mode: "predicted",
    name: testMiRNA,
  });
  console.log(" Predicted targets:", predicted.message);

  console.log(" Testing network fetch...");
  const network = await miRTargetLinkTool.execute({
    mode: "network",
    name: testMiRNA,
  });
  console.log(" Network response:", network.message);
})();

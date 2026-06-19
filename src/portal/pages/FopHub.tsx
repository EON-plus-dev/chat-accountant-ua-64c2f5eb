import { HubLayout } from "@/portal/layouts/HubLayout";
import { getHubConfig } from "@/portal/data/hubs";

const FopHub = () => {
  const config = getHubConfig("fop")!;
  return <HubLayout config={config} />;
};

export default FopHub;

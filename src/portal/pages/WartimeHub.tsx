import { HubLayout } from "@/portal/layouts/HubLayout";
import { getHubConfig } from "@/portal/data/hubs";

const WartimeHub = () => {
  const config = getHubConfig("wartime")!;
  return <HubLayout config={config} />;
};

export default WartimeHub;

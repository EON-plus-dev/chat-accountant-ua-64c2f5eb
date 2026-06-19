import { HubLayout } from "@/portal/layouts/HubLayout";
import { getHubConfig } from "@/portal/data/hubs";

const LawHub = () => {
  const config = getHubConfig("law")!;
  return <HubLayout config={config} />;
};

export default LawHub;

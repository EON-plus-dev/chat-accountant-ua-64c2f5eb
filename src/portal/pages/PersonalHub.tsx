import { HubLayout } from "@/portal/layouts/HubLayout";
import { getHubConfig } from "@/portal/data/hubs";

const PersonalHub = () => {
  const config = getHubConfig("personal")!;
  return <HubLayout config={config} />;
};

export default PersonalHub;

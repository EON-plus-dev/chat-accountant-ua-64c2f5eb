import { HubLayout } from "@/portal/layouts/HubLayout";
import { getHubConfig } from "@/portal/data/hubs";

const TaxesHub = () => {
  const config = getHubConfig("taxes")!;
  return <HubLayout config={config} />;
};

export default TaxesHub;

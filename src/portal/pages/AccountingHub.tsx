import { HubLayout } from "@/portal/layouts/HubLayout";
import { getHubConfig } from "@/portal/data/hubs";

const AccountingHub = () => {
  const config = getHubConfig("accounting")!;
  return <HubLayout config={config} />;
};

export default AccountingHub;

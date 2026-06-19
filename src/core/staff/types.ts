/**
 * Core: StaffMember
 *
 * Vertical-agnostic alias для виконавця послуги: майстер (salon),
 * тренер (tennis), офіціант (restaurant). Hotel зазвичай не має
 * staff-per-resource — гість бронює ресурс напряму.
 */
export type { SalonMaster as StaffMember } from "@/config/demoCabinets/salonData";
export type {
  SalonMasterContractKind as StaffContractKind,
  SalonMasterTerms as StaffTerms,
  SalonMasterPermission as StaffPermission,
  SalonMasterDelegationContract as StaffDelegationContract,
  SalonMasterInvitation as StaffInvitation,
} from "@/config/demoCabinets/salonMasterDelegations";

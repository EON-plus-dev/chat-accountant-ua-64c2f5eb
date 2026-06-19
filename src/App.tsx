import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// FINTODO OS marketing site (audience-aware, single shell)
const OsLayout = lazy(() => import("./os/layouts/OsLayout"));
const OsHomePage = lazy(() => import("./os/pages/OsHomePage"));
const OsModulesIndexPage = lazy(() => import("./os/pages/OsModulesIndexPage"));
const OsModulePage = lazy(() => import("./os/pages/OsModulePage"));
const OsScenariosIndexPage = lazy(() => import("./os/pages/OsScenariosIndexPage"));
const OsScenarioPage = lazy(() => import("./os/pages/OsScenarioPage"));
const OsPricingPage = lazy(() => import("./os/pages/OsPricingPage"));
const OsSecurityPage = lazy(() => import("./os/pages/OsSecurityPage"));
import { ThemeProvider } from "next-themes";
import { AudienceProvider } from "@/contexts/AudienceContext";
import LandingBusinessPage from "./pages/landing/LandingBusinessPage";
import LandingIndividualPage from "./pages/landing/LandingIndividualPage";
import LandingPartnersPage from "./pages/landing/LandingPartnersPage";
import PartnerProgramPitchPage from "./pages/landing/PartnerProgramPitchPage";
import Login from "./pages/Login";
import PortalHome from "./portal/pages/PortalHome";
import TaxesHub from "./portal/pages/TaxesHub";
import ArticlePage from "./portal/pages/ArticlePage";
import ToolsHub from "./portal/pages/ToolsHub";
import ToolPage from "./portal/pages/ToolPage";
import AccountingHub from "./portal/pages/AccountingHub";
import LawHub from "./portal/pages/LawHub";
import FopHub from "./portal/pages/FopHub";
import PersonalHub from "./portal/pages/PersonalHub";
import WartimeHub from "./portal/pages/WartimeHub";
import RadarPage from "./portal/pages/RadarPage";
import ReklamaPage from "./portal/pages/ReklamaPage";

import SavedPage from "./portal/pages/SavedPage";
import RankingsPage from "./portal/pages/RankingsPage";
import RankingCategoryPage from "./portal/pages/RankingCategoryPage";
import RankingItemPage from "./portal/pages/RankingItemPage";
import KnowledgePage from "./portal/pages/KnowledgePage";
// AIConsultationsPage removed — redirects to /consultant?tab=forum
import AIConsultationDetailPage from "./portal/pages/AIConsultationDetailPage";
import KnowledgeEntryPage from "./portal/pages/KnowledgeEntryPage";
import Dashboard from "./pages/Dashboard";
import AppealDetailPage from "./pages/AppealDetailPage";
import AuditDetailPage from "./pages/AuditDetailPage";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutError from "./pages/CheckoutError";
import TopUp from "./pages/TopUp";
import TopUpSuccess from "./pages/TopUpSuccess";
import TopUpError from "./pages/TopUpError";
import AnalyticsPage from "./portal/pages/analytics/AnalyticsPage";
import AnalyticsCurrencyPage from "./portal/pages/analytics/AnalyticsCurrencyPage";
import AnalyticsDepositsPage from "./portal/pages/analytics/AnalyticsDepositsPage";
import AnalyticsCardsPage from "./portal/pages/analytics/AnalyticsCardsPage";
import AnalyticsInsurancePage from "./portal/pages/analytics/AnalyticsInsurancePage";
import AnalyticsFeesPage from "./portal/pages/analytics/AnalyticsFeesPage";
import AnalyticsIndicesPage from "./portal/pages/analytics/AnalyticsIndicesPage";
import AnalyticsLaborPage from "./portal/pages/analytics/AnalyticsLaborPage";
import AnalyticsMortgagePage from "./portal/pages/analytics/AnalyticsMortgagePage";
import AnalyticsArchivePage from "./portal/pages/analytics/AnalyticsArchivePage";

import ChangePlan from "./pages/ChangePlan";
import ContractorOnboarding from "./pages/ContractorOnboarding";
import SpecialistOnboarding from "./pages/SpecialistOnboarding";
import AddCabinet from "./pages/AddCabinet";
import InviteLanding from "./pages/InviteLanding";
import Consultations from "./pages/Consultations";
import ConsultationPage from "./pages/ConsultationPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PortalAnalyticsPage from "./portal/pages/PortalAnalyticsPage";
import NewsletterPage from "./portal/pages/NewsletterPage";
import NewsletterIssuePage from "./portal/pages/NewsletterIssuePage";
import AccountPage from "./portal/pages/AccountPage";
import CatalogPage from "./portal/pages/CatalogPage";
import CatalogCategoryPage from "./portal/pages/CatalogCategoryPage";
import CatalogTypePage from "./portal/pages/CatalogTypePage";
import InstitutionProfilePage from "./portal/pages/InstitutionProfilePage";
import InstitutionComparePage from "./portal/pages/InstitutionComparePage";
import ProductComparePage from "./portal/pages/ProductComparePage";
import GovBranchDetailPage from "./portal/pages/GovBranchDetailPage";
import ConsultantPage from "./portal/pages/ConsultantPage";
import NotFound from "./pages/NotFound";
import PublicBooking from "./pages/PublicBooking";
import SubscribeInvitePage from "./pages/SubscribeInvitePage";
import { NetworkBridge } from "./modules/network/bridge/NetworkBridge";
import PublicRequisitesPage from "./pages/PublicRequisitesPage";
import PublicReceiptPage from "./pages/PublicReceiptPage";
import TaxRefundPitchPage from "./pages/TaxRefundPitchPage";
import ConsumerInboxPage from "./pages/ConsumerInboxPage";
import ScrollToTopOnNavigate from "./components/ScrollToTopOnNavigate";

// Admin CMS
import AdminRoute from "./admin/components/AdminRoute";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import NewsletterAdmin from "./admin/pages/NewsletterAdmin";
import CoursesAdmin from "./admin/pages/CoursesAdmin";
import CatalogAdmin from "./admin/pages/CatalogAdmin";
import AdminUsersPage from "./admin/pages/AdminUsersPage";
import SiteConfigPage from "./admin/pages/SiteConfigPage";
import ArticlesAdmin from "./admin/pages/ArticlesAdmin";

import DeadlinesAdmin from "./admin/pages/DeadlinesAdmin";
import ToolsAdmin from "./admin/pages/ToolsAdmin";
import LawsAdmin from "./admin/pages/LawsAdmin";
import KnowledgeAdmin from "./admin/pages/KnowledgeAdmin";
import ConsultationsAdmin from "./admin/pages/ConsultationsAdmin";
import SubscriptionsAdmin from "./admin/pages/SubscriptionsAdmin";
import ContentAnalytics from "./admin/pages/ContentAnalytics";
import GrantsAdmin from "./admin/pages/GrantsAdmin";
import PenaltiesAdmin from "./admin/pages/PenaltiesAdmin";
import LicensesAdmin from "./admin/pages/LicensesAdmin";
import KvedAdmin from "./admin/pages/KvedAdmin";

import QuestionsAdmin from "./admin/pages/QuestionsAdmin";
import HubsAdmin from "./admin/pages/HubsAdmin";
import AccountantsAdmin from "./admin/pages/AccountantsAdmin";
import TemplatesAdmin from "./admin/pages/TemplatesAdmin";
import RegistersAdmin from "./admin/pages/RegistersAdmin";
import RatesAdmin from "./admin/pages/RatesAdmin";
import BusinessFormsAdmin from "./admin/pages/BusinessFormsAdmin";
import ComparisonsAdmin from "./admin/pages/ComparisonsAdmin";
import LaborMarketAdmin from "./admin/pages/LaborMarketAdmin";
import MortgageAdmin from "./admin/pages/MortgageAdmin";
import AdminPartnerCommissionsPage from "./admin/pages/AdminPartnerCommissionsPage";
import AdminPartnerPayoutsPage from "./admin/pages/AdminPartnerPayoutsPage";
import CategoriesAdmin from "./admin/pages/CategoriesAdmin";
import DovidnykyAdmin from "./admin/pages/DovidnykyAdmin";
import CourtCasesAdmin from "./admin/pages/CourtCasesAdmin";
import ClarificationsAdmin from "./admin/pages/ClarificationsAdmin";
import AgenciesAdmin from "./admin/pages/AgenciesAdmin";
import BudgetAccountsAdmin from "./admin/pages/BudgetAccountsAdmin";
import AtskAdmin from "./admin/pages/AtskAdmin";
import KatottgAdmin from "./admin/pages/KatottgAdmin";
import ProfesiiAdmin from "./admin/pages/ProfesiiAdmin";
import PlanRakhunkivAdmin from "./admin/pages/PlanRakhunkivAdmin";
import UktZedAdmin from "./admin/pages/UktZedAdmin";
import ViyskovyyOblikAdmin from "./admin/pages/ViyskovyyOblikAdmin";
import PdvPilhyAdmin from "./admin/pages/PdvPilhyAdmin";
import RankingsAdmin from "./admin/pages/RankingsAdmin";
import ContentAuditAdmin from "./admin/pages/ContentAuditAdmin";

import AIConsultationsAdmin from "./admin/pages/AIConsultationsAdmin";
import AIAgentAdmin from "./admin/pages/AIAgentAdmin";
import AiCmsAdmin from "./admin/pages/AiCmsAdmin";
import AiCmsEditor from "./admin/pages/AiCmsEditor";
import ContentCalendarAdmin from "./admin/pages/ContentCalendarAdmin";
import TaxCalendarAdmin from "./admin/pages/TaxCalendarAdmin";
import AutoContentAdmin from "./admin/pages/AutoContentAdmin";
import EditorialSettingsAdmin from "./admin/pages/EditorialSettingsAdmin";
import AdminTopUp from "./admin/pages/AdminTopUp";
import AdminTopUpSuccess from "./admin/pages/AdminTopUpSuccess";
import AdminTopUpError from "./admin/pages/AdminTopUpError";
import FinderAdmin from "./admin/pages/FinderAdmin";
import InstitutionProfilesAdmin from "./admin/pages/InstitutionProfilesAdmin";
import GovBranchesAdmin from "./admin/pages/GovBranchesAdmin";
import GovServicesAdmin from "./admin/pages/GovServicesAdmin";
import GovReviewsAdmin from "./admin/pages/GovReviewsAdmin";
import ContentDetailRoute from "./admin/pages/ContentDetailRoute";
import AIConsultationDetailRoute from "./admin/pages/AIConsultationDetailRoute";
import SeoPortalAdmin from "./admin/pages/SeoPortalAdmin";

// System admin pages
import SystemOverviewPage from "./admin/pages/system/SystemOverviewPage";
import SystemPlansPage from "./admin/pages/system/SystemPlansPage";
import SystemAiGatewayPage from "./admin/pages/system/SystemAiGatewayPage";
import SystemEdgeFunctionsPage from "./admin/pages/system/SystemEdgeFunctionsPage";
import SystemCapabilitiesPage from "./admin/pages/system/SystemCapabilitiesPage";
import SystemConnectionsPage from "./admin/pages/system/SystemConnectionsPage";
import SystemHealthPage from "./admin/pages/system/SystemHealthPage";
import SystemUsersPage from "./admin/pages/system/SystemUsersPage";
import SystemUserDetailPage from "./admin/pages/system/SystemUserDetailPage";
import SystemCabinetsPage from "./admin/pages/system/SystemCabinetsPage";
import SystemCabinetDetailPage from "./admin/pages/system/SystemCabinetDetailPage";
import SystemAiQaPage from "./admin/pages/system/SystemAiQaPage";
import SystemIncidentsPage from "./admin/pages/system/SystemIncidentsPage";
import SystemRulesLabPage from "./admin/pages/system/SystemRulesLabPage";
import { SystemStubPage } from "./admin/pages/system/SystemStubPage";
import SystemKnowledgePage from "./admin/pages/system/SystemKnowledgePage";
import SystemChatOrchestrationPage from "./admin/pages/system/SystemChatOrchestrationPage";
import SystemVoicePage from "./admin/pages/system/SystemVoicePage";
import SystemConnectorsPage from "./admin/pages/system/SystemConnectorsPage";
import SystemAuditPage from "./admin/pages/system/SystemAuditPage";
import SystemRulesAssistantPage from "./admin/pages/system/SystemRulesAssistantPage";
import SystemRbacPage from "./admin/pages/system/SystemRbacPage";
import SystemBillingTransactionsPage from "./admin/pages/system/SystemBillingTransactionsPage";
import SystemBillingAnomaliesPage from "./admin/pages/system/SystemBillingAnomaliesPage";
import SystemTicketsPage from "./admin/pages/system/SystemTicketsPage";
import SystemIntentsPage from "./admin/pages/system/SystemIntentsPage";
import SystemCommsAnalyticsPage from "./admin/pages/system/SystemCommsAnalyticsPage";
import SystemSubscriptionsPage from "./admin/pages/system/SystemSubscriptionsPage";
import SystemPartnersPage from "./admin/pages/system/SystemPartnersPage";
import SystemAiCostPage from "./admin/pages/system/SystemAiCostPage";


// Dovidnyky pages
import DovidnykyPage from "./portal/pages/dovidnyky/DovidnykyPage";
import KvedPage from "./portal/pages/dovidnyky/KvedPage";
import KvedEntryPage from "./portal/pages/dovidnyky/KvedEntryPage";
import LawsPage from "./portal/pages/dovidnyky/LawsPage";
import LawEntryPage from "./portal/pages/dovidnyky/LawEntryPage";
import CourtCasesPage from "./portal/pages/dovidnyky/CourtCasesPage";
import CourtCaseEntryPage from "./portal/pages/dovidnyky/CourtCaseEntryPage";
import ClarificationsPage from "./portal/pages/dovidnyky/ClarificationsPage";
import ClarificationEntryPage from "./portal/pages/dovidnyky/ClarificationEntryPage";
import AgenciesPage from "./portal/pages/dovidnyky/AgenciesPage";
import AgencyEntryPage from "./portal/pages/dovidnyky/AgencyEntryPage";
import BudgetAccountsPage from "./portal/pages/dovidnyky/BudgetAccountsPage";
import BudgetAccountEntryPage from "./portal/pages/dovidnyky/BudgetAccountEntryPage";
import AtskPage from "./portal/pages/dovidnyky/AtskPage";
import AtskEntryPage from "./portal/pages/dovidnyky/AtskEntryPage";
import KatottgPage from "./portal/pages/dovidnyky/KatottgPage";
import KatottgEntryPage from "./portal/pages/dovidnyky/KatottgEntryPage";
import ProfesiiPage from "./portal/pages/dovidnyky/ProfesiiPage";
import ProfesiaEntryPage from "./portal/pages/dovidnyky/ProfesiaEntryPage";
import PlanRakhunkivPage from "./portal/pages/dovidnyky/PlanRakhunkivPage";
import PlanRakhunkuEntryPage from "./portal/pages/dovidnyky/PlanRakhunkuEntryPage";
import UktZedPage from "./portal/pages/dovidnyky/UktZedPage";
import UktZedEntryPage from "./portal/pages/dovidnyky/UktZedEntryPage";
import ViyskovyyOblikPage from "./portal/pages/dovidnyky/ViyskovyyOblikPage";
import ViyskovyyEntryPage from "./portal/pages/dovidnyky/ViyskovyyEntryPage";
import PdvPilhyPage from "./portal/pages/dovidnyky/PdvPilhyPage";
import PdvPilhaEntryPage from "./portal/pages/dovidnyky/PdvPilhaEntryPage";
import NbuRatesPage from "./portal/pages/dovidnyky/NbuRatesPage";
import InflationIndexPage from "./portal/pages/dovidnyky/InflationIndexPage";
import RegionalContactsPage from "./portal/pages/dovidnyky/RegionalContactsPage";
import LimityPage from "./portal/pages/dovidnyky/LimityPage";
import ReportingFormsPage from "./portal/pages/dovidnyky/ReportingFormsPage";
import DttPage from "./portal/pages/dovidnyky/DttPage";
import IncotermsPage from "./portal/pages/dovidnyky/IncotermsPage";
import BanksMfoPage from "./portal/pages/dovidnyky/BanksMfoPage";
import CurrenciesPage from "./portal/pages/dovidnyky/CurrenciesPage";
import KkdCodesPage from "./portal/pages/dovidnyky/KkdCodesPage";
import IncomeCodesPage from "./portal/pages/dovidnyky/IncomeCodesPage";
import CountryCodesPage from "./portal/pages/dovidnyky/CountryCodesPage";
import PspPilhyPage from "./portal/pages/dovidnyky/PspPilhyPage";
import TaxBenefitCodesPage from "./portal/pages/dovidnyky/TaxBenefitCodesPage";
import CurrencyOpCodesPage from "./portal/pages/dovidnyky/CurrencyOpCodesPage";
import PrimaryDocumentsPage from "./portal/pages/dovidnyky/PrimaryDocumentsPage";
import CustomsDocsPage from "./portal/pages/dovidnyky/CustomsDocsPage";
import VatDocCodesPage from "./portal/pages/dovidnyky/VatDocCodesPage";
import RroDevicesPage from "./portal/pages/dovidnyky/RroDevicesPage";
import LaborPaymentsPage from "./portal/pages/dovidnyky/LaborPaymentsPage";
import TcoRulesPage from "./portal/pages/dovidnyky/TcoRulesPage";
import DiiaCityPage from "./portal/pages/dovidnyky/DiiaCityPage";
import SanctionsPage from "./portal/pages/dovidnyky/SanctionsPage";
import BusinessAuditsPage from "./portal/pages/dovidnyky/BusinessAuditsPage";
import CashLimitsPage from "./portal/pages/dovidnyky/CashLimitsPage";
import CurrencyControlPage from "./portal/pages/dovidnyky/CurrencyControlPage";
import ContractTypesPage from "./portal/pages/dovidnyky/ContractTypesPage";
import CorporateLawPage from "./portal/pages/dovidnyky/CorporateLawPage";
import IpRightsPage from "./portal/pages/dovidnyky/IpRightsPage";
import PostalOperatorsPage from "./portal/pages/dovidnyky/PostalOperatorsPage";
import PostalIndicesPage from "./portal/pages/dovidnyky/PostalIndicesPage";
import FuelStationsPage from "./portal/pages/dovidnyky/FuelStationsPage";
import FuelPricesPage from "./portal/pages/dovidnyky/FuelPricesPage";
import EduCentersPage from "./portal/pages/dovidnyky/EduCentersPage";
import CertificationsPage from "./portal/pages/dovidnyky/CertificationsPage";
import EduGrantsPage from "./portal/pages/dovidnyky/EduGrantsPage";
import UtilityTariffsPage from "./portal/pages/dovidnyky/UtilityTariffsPage";
import CommercialRentPage from "./portal/pages/dovidnyky/CommercialRentPage";
import GrantsPage from "./portal/pages/dovidnyky/GrantsPage";
import GrantEntryPage from "./portal/pages/dovidnyky/GrantEntryPage";
import PenaltiesPage from "./portal/pages/dovidnyky/PenaltiesPage";
import PenaltyEntryPage from "./portal/pages/dovidnyky/PenaltyEntryPage";
import LicensesPage from "./portal/pages/dovidnyky/LicensesPage";
import LicenseEntryPage from "./portal/pages/dovidnyky/LicenseEntryPage";
import TaxCalendarPage from "./portal/pages/dovidnyky/TaxCalendarPage";
import AccountantsPage from "./portal/pages/dovidnyky/AccountantsPage";
import AccountantProfilePage from "./portal/pages/dovidnyky/AccountantProfilePage";
import TemplatesPage from "./portal/pages/dovidnyky/TemplatesPage";
import TemplateEntryPage from "./portal/pages/dovidnyky/TemplateEntryPage";
import RegistersPage from "./portal/pages/dovidnyky/RegistersPage";
import RegisterEntryPage from "./portal/pages/dovidnyky/RegisterEntryPage";
import RatesPage from "./portal/pages/dovidnyky/RatesPage";
import RateEntryPage from "./portal/pages/dovidnyky/RateEntryPage";
import BusinessFormsPage from "./portal/pages/dovidnyky/BusinessFormsPage";
import BusinessFormEntryPage from "./portal/pages/dovidnyky/BusinessFormEntryPage";
import CustomsTariffPage from "./portal/pages/dovidnyky/CustomsTariffPage";
import CustomsSanctionsPage from "./portal/pages/dovidnyky/CustomsSanctionsPage";
import IntlCarriersPage from "./portal/pages/dovidnyky/IntlCarriersPage";
import DomesticCarriersB2BPage from "./portal/pages/dovidnyky/DomesticCarriersB2BPage";
import HrTemplatesPage from "./portal/pages/dovidnyky/HrTemplatesPage";
import SalaryGridsPage from "./portal/pages/dovidnyky/SalaryGridsPage";
import MobilizationBookingPage from "./portal/pages/dovidnyky/MobilizationBookingPage";
import TrafficFinesPage from "./portal/pages/dovidnyky/TrafficFinesPage";
import OsagoTariffsPage from "./portal/pages/dovidnyky/OsagoTariffsPage";
import VehicleCustomsPage from "./portal/pages/dovidnyky/VehicleCustomsPage";
import NotaryFeesPage from "./portal/pages/dovidnyky/NotaryFeesPage";
import LawyerFeesPage from "./portal/pages/dovidnyky/LawyerFeesPage";
import CourtFeesPage from "./portal/pages/dovidnyky/CourtFeesPage";
import CnapServicesPage from "./portal/pages/dovidnyky/CnapServicesPage";
import DbnNormsPage from "./portal/pages/dovidnyky/DbnNormsPage";
import ConstructionCostsPage from "./portal/pages/dovidnyky/ConstructionCostsPage";
import LandValuationPage from "./portal/pages/dovidnyky/LandValuationPage";
import MarketingBenchmarksPage from "./portal/pages/dovidnyky/MarketingBenchmarksPage";
import ItServiceRatesPage from "./portal/pages/dovidnyky/ItServiceRatesPage";
import MarketingItContractsPage from "./portal/pages/dovidnyky/MarketingItContractsPage";

// Learn pages
import LearnPage from "./portal/pages/learn/LearnPage";
import LearnCategoryPage from "./portal/pages/learn/LearnCategoryPage";
import LearnCoursePage from "./portal/pages/learn/LearnCoursePage";
import LearnLessonPage from "./portal/pages/learn/LearnLessonPage";
import LearnCourseCertificatePage from "./portal/pages/learn/LearnCourseCertificatePage";
import CourseCheckout from "./pages/CourseCheckout";
import CourseCheckoutSuccess from "./pages/CourseCheckoutSuccess";
import LearnWebinarsPage from "./portal/pages/learn/LearnWebinarsPage";
import LearnCertificationPage from "./portal/pages/learn/LearnCertificationPage";
import CertVerifyPage from "./portal/pages/learn/CertVerifyPage";

// Publications pages
import PublicationsPage from "./portal/pages/publications/PublicationsPage";
import PublicationsNewsPage from "./portal/pages/publications/PublicationsNewsPage";
import PublicationsGuidesPage from "./portal/pages/publications/PublicationsGuidesPage";
import PublicationsPodcastsPage from "./portal/pages/publications/PublicationsPodcastsPage";
import PublicationsVideosPage from "./portal/pages/publications/PublicationsVideosPage";

import PublicationsConsultationsPage from "./portal/pages/publications/PublicationsConsultationsPage";
import PublicationsReviewsPage from "./portal/pages/publications/PublicationsReviewsPage";


// Redirect components for old URLs
import {
  RedirectRankingsCat,
  RedirectRankingsItem,
  RedirectKnowledgeSlug,
  RedirectCatalogCat,
  RedirectCatalogType,
  RedirectInstitutionProfile,
} from "./portal/pages/dovidnyky/redirects";

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={routerBasename}>
          <AudienceProvider>
          <ScrollToTopOnNavigate />
          <NetworkBridge />
          <Routes>
          <Route path="/" element={<LandingBusinessPage />} />
          {/* === FINTODO OS — єдиний маркетинговий сайт з перемикачем аудиторії === */}
          <Route
            path="/os"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <OsLayout />
              </Suspense>
            }
          >
            <Route index element={<Suspense fallback={null}><OsHomePage /></Suspense>} />
            <Route path="modules" element={<Suspense fallback={null}><OsModulesIndexPage /></Suspense>} />
            <Route path="modules/:id" element={<Suspense fallback={null}><OsModulePage /></Suspense>} />
            <Route path="scenarios" element={<Suspense fallback={null}><OsScenariosIndexPage /></Suspense>} />
            <Route path="scenarios/:id" element={<Suspense fallback={null}><OsScenarioPage /></Suspense>} />
            <Route path="pricing" element={<Suspense fallback={null}><OsPricingPage /></Suspense>} />
            <Route path="security" element={<Suspense fallback={null}><OsSecurityPage /></Suspense>} />
          </Route>

          <Route path="/individuals" element={<LandingIndividualPage />} />
          <Route path="/partners" element={<LandingPartnersPage />} />
          <Route path="/partners/program" element={<PartnerProgramPitchPage />} />
          <Route path="/for-accountants" element={<Navigate to="/partners" replace />} />
          <Route path="/pros" element={<Navigate to="/partners" replace />} />
          <Route path="/overview" element={<PortalHome />} />
          <Route path="/me/overview" element={<Navigate to="/dashboard?tab=cabinets" replace />} />
          <Route path="/me" element={<Navigate to="/dashboard?tab=cabinets" replace />} />

          <Route path="/product" element={<Navigate to="/" replace />} />
          <Route path="/taxes" element={<TaxesHub />} />
          <Route path="/fop" element={<FopHub />} />
           <Route path="/personal" element={<PersonalHub />} />
           <Route path="/wartime" element={<WartimeHub />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/radar" element={<RadarPage />} />
          <Route path="/reklama" element={<ReklamaPage />} />
          <Route path="/partner-cabinet" element={<Navigate to="/dashboard?tab=cabinets" replace />} />
           <Route path="/ai-consultations" element={<Navigate to="/consultant?tab=forum" replace />} />
           <Route path="/ai-consultations/:slug" element={<AIConsultationDetailPage />} />
           <Route path="/analytics" element={<AnalyticsPage />} />
           <Route path="/analytics/currency" element={<AnalyticsCurrencyPage />} />
           <Route path="/analytics/deposits" element={<AnalyticsDepositsPage />} />
           <Route path="/analytics/cards" element={<AnalyticsCardsPage />} />
           <Route path="/analytics/insurance" element={<AnalyticsInsurancePage />} />
           <Route path="/analytics/fees" element={<AnalyticsFeesPage />} />
           <Route path="/analytics/indices" element={<AnalyticsIndicesPage />} />
           <Route path="/analytics/labor" element={<AnalyticsLaborPage />} />
           <Route path="/analytics/mortgage" element={<AnalyticsMortgagePage />} />
          <Route path="/analytics/archive" element={<AnalyticsArchivePage />} />
           {/* Legacy /finder redirects */}
           <Route path="/finder" element={<Navigate to="/analytics" replace />} />
           <Route path="/finder/currency" element={<Navigate to="/analytics/currency" replace />} />
           <Route path="/finder/deposits" element={<Navigate to="/analytics/deposits" replace />} />
           <Route path="/finder/cards" element={<Navigate to="/analytics/cards" replace />} />
           <Route path="/finder/insurance" element={<Navigate to="/analytics/insurance" replace />} />
           <Route path="/finder/fees" element={<Navigate to="/analytics/fees" replace />} />
           <Route path="/finder/indices" element={<Navigate to="/analytics/indices" replace />} />
           {/* ═══ Публікації ═══ */}
           <Route path="/publications" element={<PublicationsPage />} />
           <Route path="/publications/news" element={<PublicationsNewsPage />} />
           <Route path="/publications/guides" element={<PublicationsGuidesPage />} />
            <Route path="/publications/podcasts" element={<PublicationsPodcastsPage />} />
            <Route path="/publications/videos" element={<PublicationsVideosPage />} />
            <Route path="/publications/ratings" element={<RankingsPage />} />
            <Route path="/publications/ratings/:categorySlug/:itemSlug" element={<RankingItemPage />} />
            <Route path="/publications/ratings/:categorySlug" element={<RankingCategoryPage />} />
           <Route path="/publications/consultations" element={<PublicationsConsultationsPage />} />
           <Route path="/publications/reviews" element={<PublicationsReviewsPage />} />
           <Route path="/publications/digest" element={<Navigate to="/newsletter" replace />} />

           <Route path="/tools" element={<ToolsHub />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/accounting" element={<AccountingHub />} />
          <Route path="/law" element={<LawHub />} />

          {/* ═══ Довідники hub ═══ */}
          <Route path="/dovidnyky" element={<DovidnykyPage />} />

          {/* Установи (was /catalog) */}
          <Route path="/dovidnyky/ustanovy" element={<CatalogPage />} />
          <Route path="/dovidnyky/ustanovy/gov/branch/:id" element={<GovBranchDetailPage />} />
          <Route path="/dovidnyky/ustanovy/profile/:slug" element={<InstitutionProfilePage />} />
          <Route path="/dovidnyky/ustanovy/compare/:slug1/:slug2" element={<InstitutionComparePage />} />
          <Route path="/dovidnyky/ustanovy/compare-products/:slug1/:productId1/:slug2/:productId2" element={<ProductComparePage />} />
          <Route path="/dovidnyky/ustanovy/:categorySlug/:typeSlug" element={<CatalogTypePage />} />
          <Route path="/dovidnyky/ustanovy/:categorySlug" element={<CatalogCategoryPage />} />

          {/* Рейтинги — redirect old paths */}
          <Route path="/dovidnyky/reytynh" element={<Navigate to="/publications/ratings" replace />} />
          <Route path="/dovidnyky/reytynh/:categorySlug/:itemSlug" element={<RedirectRankingsItem />} />
          <Route path="/dovidnyky/reytynh/:categorySlug" element={<RedirectRankingsCat />} />

          {/* Словник (was /knowledge) */}
          <Route path="/dovidnyky/slovnyk" element={<KnowledgePage />} />
          <Route path="/dovidnyky/slovnyk/:slug" element={<KnowledgeEntryPage />} />

          {/* Нові підрозділи */}
          <Route path="/dovidnyky/kved" element={<KvedPage />} />
          <Route path="/dovidnyky/kved/:code" element={<KvedEntryPage />} />
          <Route path="/dovidnyky/zakony" element={<LawsPage />} />
          <Route path="/dovidnyky/zakony/:slug" element={<LawEntryPage />} />
          <Route path="/dovidnyky/granty" element={<GrantsPage />} />
          <Route path="/dovidnyky/granty/:slug" element={<GrantEntryPage />} />
          <Route path="/dovidnyky/sudy" element={<CourtCasesPage />} />
          <Route path="/dovidnyky/sudy/:slug" element={<CourtCaseEntryPage />} />
          <Route path="/dovidnyky/rozyasnennia" element={<ClarificationsPage />} />
          <Route path="/dovidnyky/rozyasnennia/:slug" element={<ClarificationEntryPage />} />
          <Route path="/dovidnyky/derzhorgany" element={<AgenciesPage />} />
          <Route path="/dovidnyky/derzhorgany/:slug" element={<AgencyEntryPage />} />
          <Route path="/dovidnyky/biudzhetni-rakhunky" element={<BudgetAccountsPage />} />
          <Route path="/dovidnyky/biudzhetni-rakhunky/:slug" element={<BudgetAccountEntryPage />} />
          <Route path="/dovidnyky/atsk-kep" element={<AtskPage />} />
          <Route path="/dovidnyky/atsk-kep/:slug" element={<AtskEntryPage />} />
          <Route path="/dovidnyky/katottg" element={<KatottgPage />} />
          <Route path="/dovidnyky/katottg/:slug" element={<KatottgEntryPage />} />
          <Route path="/dovidnyky/profesii" element={<ProfesiiPage />} />
          <Route path="/dovidnyky/profesii/:slug" element={<ProfesiaEntryPage />} />
          <Route path="/dovidnyky/plan-rakhunkiv" element={<PlanRakhunkivPage />} />
          <Route path="/dovidnyky/plan-rakhunkiv/:slug" element={<PlanRakhunkuEntryPage />} />
          <Route path="/dovidnyky/ukt-zed" element={<UktZedPage />} />
          <Route path="/dovidnyky/ukt-zed/:slug" element={<UktZedEntryPage />} />
          <Route path="/dovidnyky/viyskovyy-oblik" element={<ViyskovyyOblikPage />} />
          <Route path="/dovidnyky/viyskovyy-oblik/:slug" element={<ViyskovyyEntryPage />} />
          <Route path="/dovidnyky/pdv-pilhy" element={<PdvPilhyPage />} />
          <Route path="/dovidnyky/pdv-pilhy/:slug" element={<PdvPilhaEntryPage />} />
          <Route path="/dovidnyky/kursy-nbu" element={<NbuRatesPage />} />
          <Route path="/dovidnyky/indeks-infliatsii" element={<InflationIndexPage />} />
          <Route path="/dovidnyky/regionalni-kontakty" element={<RegionalContactsPage />} />
          <Route path="/dovidnyky/limity" element={<LimityPage />} />
          <Route path="/dovidnyky/zvitni-formy" element={<ReportingFormsPage />} />
          <Route path="/dovidnyky/dpo" element={<DttPage />} />
          <Route path="/dovidnyky/incoterms" element={<IncotermsPage />} />
          <Route path="/dovidnyky/banky-mfo" element={<BanksMfoPage />} />
          <Route path="/dovidnyky/valyuty" element={<CurrenciesPage />} />
          <Route path="/dovidnyky/kkd" element={<KkdCodesPage />} />
          <Route path="/dovidnyky/oznaky-dohodu" element={<IncomeCodesPage />} />
          <Route path="/dovidnyky/krayiny" element={<CountryCodesPage />} />
          <Route path="/dovidnyky/psp" element={<PspPilhyPage />} />
          <Route path="/dovidnyky/kody-pilg" element={<TaxBenefitCodesPage />} />
          <Route path="/dovidnyky/kvo" element={<CurrencyOpCodesPage />} />
          <Route path="/dovidnyky/pervynni-dokumenty" element={<PrimaryDocumentsPage />} />
          <Route path="/dovidnyky/mytni-dokumenty" element={<CustomsDocsPage />} />
          <Route path="/dovidnyky/kody-pdv" element={<VatDocCodesPage />} />
          <Route path="/dovidnyky/rro-pprro" element={<RroDevicesPage />} />
          <Route path="/dovidnyky/trudovi-vyplaty" element={<LaborPaymentsPage />} />
          <Route path="/dovidnyky/tco" element={<TcoRulesPage />} />
          <Route path="/dovidnyky/diia-city" element={<DiiaCityPage />} />
          <Route path="/dovidnyky/sanctions" element={<SanctionsPage />} />
          <Route path="/dovidnyky/perevirky-biznesu" element={<BusinessAuditsPage />} />
          <Route path="/dovidnyky/kasovi-limity" element={<CashLimitsPage />} />
          <Route path="/dovidnyky/valyutnyy-kontrol" element={<CurrencyControlPage />} />
          <Route path="/dovidnyky/dohovory" element={<ContractTypesPage />} />
          <Route path="/dovidnyky/korporatyvne-pravo" element={<CorporateLawPage />} />
          <Route path="/dovidnyky/ip-prava" element={<IpRightsPage />} />
          <Route path="/dovidnyky/poshtovi-operatory" element={<PostalOperatorsPage />} />
          <Route path="/dovidnyky/poshtovi-indeksy" element={<PostalIndicesPage />} />
          <Route path="/dovidnyky/azs" element={<FuelStationsPage />} />
          <Route path="/dovidnyky/tsiny-palyva" element={<FuelPricesPage />} />
          <Route path="/dovidnyky/navchalni-tsentry" element={<EduCentersPage />} />
          <Route path="/dovidnyky/sertyfikatsii" element={<CertificationsPage />} />
          <Route path="/dovidnyky/granty-na-navchannya" element={<EduGrantsPage />} />
          <Route path="/dovidnyky/komunalni-taryfy" element={<UtilityTariffsPage />} />
          <Route path="/dovidnyky/komertsiyna-orenda" element={<CommercialRentPage />} />
          <Route path="/dovidnyky/penalties" element={<PenaltiesPage />} />
          <Route path="/dovidnyky/penalties/:id" element={<PenaltyEntryPage />} />
          <Route path="/dovidnyky/litsenziyi" element={<LicensesPage />} />
          <Route path="/dovidnyky/litsenziyi/:slug" element={<LicenseEntryPage />} />
          <Route path="/dovidnyky/kalendar" element={<TaxCalendarPage />} />
          <Route path="/dovidnyky/accountants" element={<AccountantsPage />} />
          <Route path="/dovidnyky/accountants/:slug" element={<AccountantProfilePage />} />
          <Route path="/dovidnyky/templates" element={<TemplatesPage />} />
          <Route path="/dovidnyky/templates/:slug" element={<TemplateEntryPage />} />
          <Route path="/dovidnyky/reestry" element={<RegistersPage />} />
          <Route path="/dovidnyky/reestry/:slug" element={<RegisterEntryPage />} />
          <Route path="/dovidnyky/stavky" element={<RatesPage />} />
          <Route path="/dovidnyky/stavky/:slug" element={<RateEntryPage />} />
          <Route path="/dovidnyky/formy-biznesu" element={<BusinessFormsPage />} />
          <Route path="/dovidnyky/formy-biznesu/:slug" element={<BusinessFormEntryPage />} />
          <Route path="/dovidnyky/customs-tariff" element={<CustomsTariffPage />} />
          <Route path="/dovidnyky/customs-sanctions" element={<CustomsSanctionsPage />} />
          <Route path="/dovidnyky/intl-carriers" element={<IntlCarriersPage />} />
          <Route path="/dovidnyky/domestic-carriers-b2b" element={<DomesticCarriersB2BPage />} />
          <Route path="/dovidnyky/hr-shablony" element={<HrTemplatesPage />} />
          <Route path="/dovidnyky/zarplaty" element={<SalaryGridsPage />} />
          <Route path="/dovidnyky/mobilizatsiya-bronyuvannya" element={<MobilizationBookingPage />} />
          <Route path="/dovidnyky/shtrafy-pdr" element={<TrafficFinesPage />} />
          <Route path="/dovidnyky/osago" element={<OsagoTariffsPage />} />
          <Route path="/dovidnyky/rozmytnennya-avto" element={<VehicleCustomsPage />} />
          <Route path="/dovidnyky/notariusy" element={<NotaryFeesPage />} />
          <Route path="/dovidnyky/advokaty" element={<LawyerFeesPage />} />
          <Route path="/dovidnyky/sudovyj-zbir" element={<CourtFeesPage />} />
          <Route path="/dovidnyky/tsnap" element={<CnapServicesPage />} />
          <Route path="/dovidnyky/dbn" element={<DbnNormsPage />} />
          <Route path="/dovidnyky/vartist-budivnytstva" element={<ConstructionCostsPage />} />
          <Route path="/dovidnyky/otsinka-zemli" element={<LandValuationPage />} />
          <Route path="/dovidnyky/marketingovi-benchmarky" element={<MarketingBenchmarksPage />} />
          <Route path="/dovidnyky/it-stavky" element={<ItServiceRatesPage />} />
          <Route path="/dovidnyky/it-shablony-dohovoriv" element={<MarketingItContractsPage />} />
          {/* ═══ Навчання ═══ */}
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/webinars/archive" element={<LearnWebinarsPage archive />} />
          <Route path="/learn/webinars" element={<LearnWebinarsPage />} />
          <Route path="/learn/certification" element={<LearnCertificationPage />} />
          <Route path="/verify/:certId" element={<CertVerifyPage />} />
          <Route path="/learn/checkout/success" element={<CourseCheckoutSuccess />} />
          <Route path="/learn/checkout/:courseSlug" element={<CourseCheckout />} />
          <Route path="/learn/:category/:courseSlug/certificate" element={<LearnCourseCertificatePage />} />
          <Route path="/learn/:category/:courseSlug/:lessonId" element={<LearnLessonPage />} />
          <Route path="/learn/:category/:courseSlug" element={<LearnCoursePage />} />
          <Route path="/learn/:category" element={<LearnCategoryPage />} />

          {/* ═══ 301 Redirects from old URLs ═══ */}
          <Route path="/rankings" element={<Navigate to="/publications/ratings" replace />} />
          <Route path="/rankings/:categorySlug/:itemSlug" element={<RedirectRankingsItem />} />
          <Route path="/rankings/:categorySlug" element={<RedirectRankingsCat />} />
          <Route path="/knowledge" element={<Navigate to="/dovidnyky/slovnyk" replace />} />
          <Route path="/knowledge/:slug" element={<RedirectKnowledgeSlug />} />
          <Route path="/catalog" element={<Navigate to="/dovidnyky/ustanovy" replace />} />
          <Route path="/catalog/:categorySlug/:typeSlug" element={<RedirectCatalogType />} />
          <Route path="/catalog/:categorySlug" element={<RedirectCatalogCat />} />
          <Route path="/institutions/profile/:slug" element={<RedirectInstitutionProfile />} />

          {/* Old category slug redirects (renamed) */}
          <Route path="/dovidnyky/ustanovy/banking" element={<Navigate to="/dovidnyky/ustanovy/banks" replace />} />
          <Route path="/dovidnyky/ustanovy/funds" element={<Navigate to="/dovidnyky/ustanovy/invest" replace />} />
          <Route path="/dovidnyky/ustanovy/logistics-customs" element={<Navigate to="/dovidnyky/ustanovy/logistics" replace />} />

          {/* Old /institutions/* redirects */}
          <Route path="/institutions/startups" element={<Navigate to="/dovidnyky/ustanovy/fintech" replace />} />
          <Route path="/institutions/insurance" element={<Navigate to="/dovidnyky/ustanovy/insurance" replace />} />
          <Route path="/institutions/leasing" element={<Navigate to="/dovidnyky/ustanovy/credit" replace />} />
          <Route path="/institutions/legal" element={<Navigate to="/dovidnyky/ustanovy/legal" replace />} />
          <Route path="/institutions/digital_tools" element={<Navigate to="/dovidnyky/ustanovy/digital_tools" replace />} />
          <Route path="/institutions/payments" element={<Navigate to="/dovidnyky/ustanovy/payments" replace />} />
          <Route path="/institutions/investment_biz" element={<Navigate to="/dovidnyky/ustanovy/invest" replace />} />
          <Route path="/institutions/logistics" element={<Navigate to="/dovidnyky/ustanovy/logistics" replace />} />
          <Route path="/institutions/personal" element={<Navigate to="/dovidnyky/ustanovy/banks" replace />} />
          <Route path="/institutions/pension" element={<Navigate to="/dovidnyky/ustanovy/invest" replace />} />
          <Route path="/institutions/credit" element={<Navigate to="/dovidnyky/ustanovy/credit" replace />} />
          <Route path="/institutions/property" element={<Navigate to="/dovidnyky/ustanovy/credit" replace />} />
          <Route path="/institutions/broker" element={<Navigate to="/dovidnyky/ustanovy/invest" replace />} />
          <Route path="/institutions/acquiring" element={<Navigate to="/dovidnyky/ustanovy/payments" replace />} />
          <Route path="/institutions/reporting" element={<Navigate to="/dovidnyky/ustanovy/accounting" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/audits/:auditId" element={<AuditDetailPage />} />
          <Route path="/appeals/:auditId" element={<AppealDetailPage />} />
          <Route path="/notifications" element={<Navigate to="/dashboard" replace state={{ tab: "notifications" }} />} />
          <Route path="/faq" element={<Navigate to="/dashboard" replace state={{ tab: "faq" }} />} />
          <Route path="/pricing" element={<Navigate to="/dashboard" replace state={{ tab: "pricing" }} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/error" element={<CheckoutError />} />
          <Route path="/top-up" element={<TopUp />} />
          <Route path="/top-up/success" element={<TopUpSuccess />} />
          <Route path="/top-up/error" element={<TopUpError />} />
          
          <Route path="/change-plan" element={<ChangePlan />} />
          <Route path="/contractor-onboarding" element={<ContractorOnboarding />} />
          <Route path="/specialist-onboarding" element={<SpecialistOnboarding />} />
          <Route path="/add-cabinet" element={<AddCabinet />} />
          <Route path="/invite/:code" element={<InviteLanding />} />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/consultations/:slug" element={<ConsultationPage />} />
          <Route path="/blog" element={<Navigate to="/#ai-consultant" replace />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
           <Route path="/consultant" element={<ConsultantPage />} />
           {/* analytics route defined above (line ~202) */}
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/newsletter/:issueId" element={<NewsletterIssuePage />} />
           <Route path="/account" element={<AccountPage />} />
            {/* AI CMS — full-screen, outside AdminLayout */}
           <Route path="/admin/ai-cms" element={<AdminRoute><AiCmsEditor /></AdminRoute>} />
           <Route path="/admin/ai-cms/:threadId" element={<AdminRoute><AiCmsEditor /></AdminRoute>} />
           {/* ═══ Адмін CMS ═══ */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="articles" element={<ArticlesAdmin />} />
              
              <Route path="consultations" element={<ConsultationsAdmin />} />
              <Route path="knowledge" element={<KnowledgeAdmin />} />
              <Route path="newsletter" element={<NewsletterAdmin />} />
              <Route path="courses" element={<CoursesAdmin />} />
              <Route path="deadlines" element={<Navigate to="/admin/tax-calendar" replace />} />
              <Route path="tax-calendar" element={<TaxCalendarAdmin />} />
              <Route path="content-calendar" element={<ContentCalendarAdmin />} />
              <Route path="laws" element={<LawsAdmin />} />
              <Route path="tools" element={<ToolsAdmin />} />
              <Route path="catalog" element={<CatalogAdmin />} />
              <Route path="grants" element={<GrantsAdmin />} />
              <Route path="penalties" element={<PenaltiesAdmin />} />
              <Route path="kved" element={<KvedAdmin />} />
              <Route path="licenses" element={<LicensesAdmin />} />
              
              <Route path="questions" element={<QuestionsAdmin />} />
              <Route path="hubs" element={<HubsAdmin />} />
              <Route path="accountants" element={<AccountantsAdmin />} />
              <Route path="templates" element={<TemplatesAdmin />} />
              <Route path="registers" element={<RegistersAdmin />} />
              <Route path="rates" element={<RatesAdmin />} />
              <Route path="business-forms" element={<BusinessFormsAdmin />} />
              <Route path="comparisons" element={<ComparisonsAdmin />} />
              <Route path="labor-market" element={<LaborMarketAdmin />} />
              <Route path="mortgage" element={<MortgageAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="dovidnyky" element={<DovidnykyAdmin />} />
              <Route path="court-cases" element={<CourtCasesAdmin />} />
              <Route path="clarifications" element={<ClarificationsAdmin />} />
              <Route path="agencies" element={<AgenciesAdmin />} />
              <Route path="budget-accounts" element={<BudgetAccountsAdmin />} />
              <Route path="atsk" element={<AtskAdmin />} />
              <Route path="katottg" element={<KatottgAdmin />} />
              <Route path="profesii" element={<ProfesiiAdmin />} />
              <Route path="plan-rakhunkiv" element={<PlanRakhunkivAdmin />} />
              <Route path="ukt-zed" element={<UktZedAdmin />} />
              <Route path="viyskovyy-oblik" element={<ViyskovyyOblikAdmin />} />
              <Route path="pdv-pilhy" element={<PdvPilhyAdmin />} />
              <Route path="rankings" element={<RankingsAdmin />} />
              
              <Route path="ai-consultations" element={<AIConsultationsAdmin />} />
              <Route path="ai-agent" element={<AIAgentAdmin />} />
              <Route path="ai-cms/settings" element={<AiCmsAdmin />} />
              <Route path="autocontent" element={<AutoContentAdmin />} />
              <Route path="editorial-settings" element={<EditorialSettingsAdmin />} />
              <Route path="top-up" element={<AdminTopUp />} />
              <Route path="top-up/success" element={<AdminTopUpSuccess />} />
              <Route path="top-up/error" element={<AdminTopUpError />} />
              <Route path="finder" element={<FinderAdmin />} />
              <Route path="institution-profiles" element={<InstitutionProfilesAdmin />} />
              <Route path="gov-branches" element={<GovBranchesAdmin />} />
              <Route path="gov-services" element={<GovServicesAdmin />} />
              <Route path="gov-reviews" element={<GovReviewsAdmin />} />
              <Route path="content/ai-consultation/:id" element={<AIConsultationDetailRoute />} />
              <Route path="content/:type/:id" element={<ContentDetailRoute />} />
              <Route path="analytics/content" element={<ContentAnalytics />} />
              <Route path="analytics/subscriptions" element={<SubscriptionsAdmin />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="config" element={<SiteConfigPage />} />
              <Route path="content-audit" element={<ContentAuditAdmin />} />
              <Route path="seo" element={<SeoPortalAdmin />} />
              <Route path="partner-commissions" element={<AdminPartnerCommissionsPage />} />
              <Route path="partner-payouts" element={<AdminPartnerPayoutsPage />} />
              {/* Система — Platform Ops */}
              <Route path="system" element={<SystemOverviewPage />} />
              <Route path="system/users" element={<SystemUsersPage />} />
              <Route path="system/users/:userId" element={<SystemUserDetailPage />} />
              <Route path="system/cabinets" element={<SystemCabinetsPage />} />
              <Route path="system/cabinets/:cabinetId" element={<SystemCabinetDetailPage />} />
              <Route path="system/integrations" element={<SystemStubPage title="Інтеграції та дані" description="Каталог, стан конекторів, журнали синхронізацій, якість даних." features={["Каталог інтеграцій (банки, ЕДО, ДПС, КЕП)", "Глобальна статистика помилок конекторів", "Журнали синхронізацій з фільтрами", "% некласифікованих транзакцій / документів без контрагентів"]} />} />
              <Route path="system/integrations/catalog" element={<SystemStubPage title="Каталог інтеграцій" features={["Список доступних інтеграцій", "Статус стабільності (OK / Degraded)", "Coverage по типах кабінетів"]} />} />
              <Route path="system/integrations/connectors" element={<SystemConnectorsPage />} />
              <Route path="system/integrations/sync-logs" element={<SystemStubPage title="Журнали синхронізацій" features={["Фільтр за клієнтом / кабінетом / інтеграцією", "Експорт логів"]} />} />
              <Route path="system/integrations/data-quality" element={<SystemStubPage title="Якість даних" features={["% некласифікованих транзакцій", "% документів без контрагентів", "% конфліктів між джерелами"]} />} />
              <Route path="system/ai" element={<SystemStubPage title="AI та база знань" features={["Статті, категорії, теги-інтенти", "Шаблони відповідей", "AI політики (тон, формальність, дисклеймери)", "AI QA — черга діалогів"]} />} />
              <Route path="system/ai/knowledge" element={<SystemKnowledgePage />} />
              <Route path="system/ai/templates" element={<SystemStubPage title="Шаблони відповідей AI" features={["Короткі відповіді", "Покрокові пояснення", "Юридичні дисклеймери"]} />} />
              <Route path="system/ai/policies" element={<SystemStubPage title="AI політики" features={["Тон голосу: формальний / дружній / нейтральний", "Рівень формальності", "Допустимий ступінь автоматизації", "Safe-mode перемикач"]} />} />
              <Route path="system/ai/qa" element={<SystemAiQaPage />} />
              <Route path="system/comms" element={<SystemStubPage title="AI Комунікації (Chat + Voice)" features={["Оркестрація сценаріїв чату", "AI-телефонія / IVR", "Єдина бібліотека інтентів", "Ескалації та SLA", "Аналітика комунікацій", "Дисклеймери та комплаєнс"]} />} />
              <Route path="system/comms/chat" element={<SystemChatOrchestrationPage />} />
              <Route path="system/comms/voice" element={<SystemVoicePage />} />
              <Route path="system/comms/intents" element={<SystemIntentsPage />} />
              <Route path="system/comms/escalations" element={<SystemStubPage title="Ескалації та SLA" features={["Правила ескалації за темою", "Створення тікетів з транскриптом", "Привʼязка до інцидентів"]} />} />
              <Route path="system/comms/analytics" element={<SystemCommsAnalyticsPage />} />
              <Route path="system/comms/compliance" element={<SystemStubPage title="Дисклеймери та комплаєнс" features={["Глобальні дисклеймери для чату й дзвінків", "Правила показу", "Журнал змін комплаєнсу"]} />} />
              <Route path="system/rules" element={<SystemRulesLabPage />} />
              <Route path="system/rules/assistant" element={<SystemRulesAssistantPage />} />
              <Route path="system/incidents" element={<SystemIncidentsPage />} />
              <Route path="system/incidents/tickets" element={<SystemTicketsPage />} />
              <Route path="system/billing/plans" element={<SystemPlansPage />} />
              <Route path="system/plans" element={<SystemPlansPage />} />
              <Route path="system/billing/transactions" element={<SystemBillingTransactionsPage />} />
              <Route path="system/billing/anomalies" element={<SystemBillingAnomaliesPage />} />
              <Route path="system/billing/subscriptions" element={<SystemSubscriptionsPage />} />
              <Route path="system/billing/ai-cost" element={<SystemAiCostPage />} />
              <Route path="system/partners" element={<SystemPartnersPage />} />
              <Route path="system/audit" element={<SystemAuditPage />} />
              <Route path="system/settings/roles" element={<SystemRbacPage />} />
              <Route path="system/settings/flags" element={<SystemStubPage title="Фіче-флаги" features={["Глобальні експерименти", "Per-cabinet toggles"]} />} />
              <Route path="system/settings/status-page" element={<SystemStubPage title="Статус-сторінка платформи" features={["Поточні інциденти", "Заплановані роботи"]} />} />
              {/* Інфраструктура */}
              <Route path="system/ai-gateway" element={<SystemAiGatewayPage />} />
              <Route path="system/edge-functions" element={<SystemEdgeFunctionsPage />} />
              <Route path="system/capabilities" element={<SystemCapabilitiesPage />} />
              <Route path="system/connections" element={<SystemConnectionsPage />} />
              <Route path="system/health" element={<SystemHealthPage />} />

            </Route>

           {/* Public share page for cabinet requisites */}
            <Route path="/r/:shareId" element={<PublicRequisitesPage />} />

           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="/book/:slug" element={<PublicBooking />} />
             <Route path="/subscribe/:code" element={<SubscribeInvitePage />} />
            <Route path="/receipt/:token" element={<PublicReceiptPage />} />
            <Route path="/tax-refund-pitch" element={<TaxRefundPitchPage />} />
            <Route path="/me/inbox" element={<ConsumerInboxPage />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
          </AudienceProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CategorizedNavigation } from "@/components/CategorizedNavigation";
import { lazy, Suspense } from "react";

// Lazy load 3D/WebGL components to prevent module initialization errors
const QuantumWarRoom = lazy(() => import("@/pages/QuantumWarRoom"));
import Dashboard from "@/pages/dashboard";
import PlatformsPage from "@/pages/platforms";
import AIAnalysisPage from "@/pages/ai-analysis";
import ContentReviewPage from "@/pages/content-review";
import LiveMonitoringPage from "@/pages/live-monitoring";
import AnalyticsPage from "@/pages/analytics";
import SettingsPage from "@/pages/settings";
import UsersPage from "@/pages/users";
import RiskManagementPage from "@/pages/risk-management";
import CrisisManagementPage from "@/pages/crisis-management";
import AdvancedAnalyticsPage from "@/pages/advanced-analytics";
import PredictiveAnalyticsPage from "@/pages/predictive-analytics";
import ComplianceReportingPage from "@/pages/compliance-reporting";
import VaultPage from "@/pages/vault";
import AuditPage from "@/pages/audit";
import ThreatsPage from "@/pages/threats";
import DataPage from "@/pages/data";
import LandingHub from "@/pages/landing-hub";
import Verification2257 from "@/pages/verification-2257";
import ChatSystem from "@/pages/chat-system";
import StreamManagement from "@/pages/stream-management";
import PaymentManagement from "@/pages/payment-management";
import PaymentProcessorManagement from "@/pages/payment-processor-management";
import TaxManagement from "@/pages/tax-management";
import AdvertisingManagement from "@/pages/advertising-management";
import AudioCallSettings from "@/pages/audio-call-settings";
import BlogManagement from "@/pages/blog-management";
import BlogCreate from "@/pages/blog-create";
import BlogEdit from "@/pages/blog-edit";
import DepositsManagement from "@/pages/deposits-management";
import DepositView from "@/pages/deposit-view";
import LocationManagement from "@/pages/location-management";
import CronManagement from "@/pages/cron-management";
import ShopManagement from "@/pages/shop-management";
import StoriesManagement from "@/pages/stories-management";
import SocialLoginSettings from "@/pages/social-login-settings";
import StorageSettings from "@/pages/storage-settings";
import TaxRateManagement from "@/pages/tax-rate-management";
import ThemeSettings from "@/pages/theme-settings";
import WithdrawalManagement from "@/pages/withdrawal-management";
import WithdrawalView from "@/pages/withdrawal-view";
import EmailManagement from "@/pages/email-management";
import UserManagement from "@/pages/user-management";
import SEOConfiguration from "@/pages/seo-configuration";
import AEOConfiguration from "@/pages/aeo-configuration";
import ContactManagement from "@/pages/contact-management";
import VideoEncodingPage from "@/pages/video-encoding";
import StickersManagementPage from "@/pages/stickers-management";
import WebSocketSettingsPage from "@/pages/websocket-settings";
import StarzStudioAdmin from "@/pages/StarzStudioAdmin";
import TransactionManagementPage from "@/pages/transaction-management";
import VerificationManagementPage from "@/pages/verification-management";
import SubscriptionManagementPage from "@/pages/subscription-management";
import ThemeGeneratorPage from "@/pages/theme-generator";
import RadioBroadcastingPage from "@/pages/radio-broadcasting";
import PodcastManagementPage from "@/pages/podcast-management";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import PasswordReset from "@/pages/auth/password-reset";
import NotFound404 from "@/pages/error/404";
import ServerError500 from "@/pages/error/500";
import Maintenance503 from "@/pages/error/503";
import ProfileDisabled from "@/pages/error/profile-disabled";
import DemoUIShowcase from "@/pages/demo-ui-showcase";
import NotFound from "@/pages/not-found";
import ContentModerationHub from "@/pages/content-moderation-hub";
import PluginManagement from "@/pages/plugin-management";
import APIIntegrationManagement from "@/pages/api-integration-management";
import PlatformModeration from "@/pages/platform-moderation";
import ComplianceMonitoring from "@/pages/compliance-monitoring";
import IntelligentModerationPage from "@/pages/intelligent-moderation";
import VRRenderingEngine from "@/pages/VRRenderingEngine";
import FutureTechManager from "@/pages/FutureTechManager";
import AICFODashboard from "@/pages/AICFODashboard";
import ComplianceCenter from "@/pages/ComplianceCenter";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Statement2257 from "@/pages/Statement2257";
import LegalLibrary from "@/pages/legal-library";
// QuantumWarRoom is lazy-loaded above
import CommandCenterDashboard from "@/pages/CommandCenterDashboard";
import CreatorsPage from "@/pages/CreatorsPage";
import ExplorePage from "@/pages/ExplorePage";
import CategoriesPage from "@/pages/CategoriesPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import HomePage from "@/pages/HomePage";
import ContactPage from "@/pages/ContactPage";
import GenericPage from "@/pages/GenericPage";
import SystemConfiguration from "@/pages/system-configuration";
import PaymentGatewaySetup from "@/pages/payment-gateway-setup";
import LogoFaviconManagement from "@/pages/logo-favicon-management";
import KYCVerificationSetup from "@/pages/kyc-verification-setup";
import KnowledgeBase from "@/pages/KnowledgeBase";

function Router() {
  return (
    <div className="flex min-h-screen cyber-bg">
      <CategorizedNavigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={LandingHub} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/platforms" component={PlatformsPage} />
          <Route path="/ai-analysis" component={AIAnalysisPage} />
          <Route path="/content-review" component={ContentReviewPage} />
          <Route path="/live-monitoring" component={LiveMonitoringPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/risk-management" component={RiskManagementPage} />
          <Route path="/crisis-management" component={CrisisManagementPage} />
          <Route path="/advanced-analytics" component={AdvancedAnalyticsPage} />
          <Route
            path="/predictive-analytics"
            component={PredictiveAnalyticsPage}
          />
          <Route
            path="/compliance-reporting"
            component={ComplianceReportingPage}
          />
          <Route path="/vault" component={VaultPage} />
          <Route path="/audit" component={AuditPage} />
          <Route path="/threats" component={ThreatsPage} />
          <Route path="/data" component={DataPage} />
          <Route path="/verification-2257" component={Verification2257} />
          <Route path="/chat-system" component={ChatSystem} />
          <Route path="/stream-management" component={StreamManagement} />
          <Route path="/payment-management" component={PaymentManagement} />
          <Route
            path="/payment-processors"
            component={PaymentProcessorManagement}
          />
          <Route path="/tax-management" component={TaxManagement} />
          <Route path="/advertising" component={AdvertisingManagement} />
          <Route path="/audio-calls" component={AudioCallSettings} />
          <Route path="/radio-broadcasting" component={RadioBroadcastingPage} />
          <Route path="/podcast-management" component={PodcastManagementPage} />
          <Route
            path="/content-moderation-hub"
            component={ContentModerationHub}
          />
          <Route path="/plugin-management" component={PluginManagement} />
          <Route
            path="/api-integration-management"
            component={APIIntegrationManagement}
          />
          <Route path="/platform-moderation" component={PlatformModeration} />
          <Route
            path="/compliance-monitoring"
            component={ComplianceMonitoring}
          />
          <Route
            path="/intelligent-moderation"
            component={IntelligentModerationPage}
          />
          <Route path="/vr-rendering" component={VRRenderingEngine} />
          <Route path="/future-tech" component={FutureTechManager} />
          <Route path="/ai-cfo" component={AICFODashboard} />
          <Route path="/starz-studio" component={StarzStudioAdmin} />
          <Route path="/compliance-center" component={ComplianceCenter} />
          <Route path="/compliance-dashboard" component={ComplianceDashboard} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/2257-statement" component={Statement2257} />
          <Route path="/legal-library" component={LegalLibrary} />
          <Route path="/quantum-war-room">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}><QuantumWarRoom /></Suspense>}</Route>
          <Route path="/command-center" component={CommandCenterDashboard} />
          <Route path="/blog" component={BlogManagement} />
          <Route path="/blog/create" component={BlogCreate} />
          <Route path="/blog/edit/:id" component={BlogEdit} />
          <Route path="/deposits" component={DepositsManagement} />
          <Route path="/deposits/:id" component={DepositView} />
          <Route path="/locations" component={LocationManagement} />
          <Route path="/cron-jobs" component={CronManagement} />
          <Route path="/shop-management" component={ShopManagement} />
          <Route path="/stories-management" component={StoriesManagement} />
          <Route
            path="/social-login-settings"
            component={SocialLoginSettings}
          />
          <Route path="/storage-settings" component={StorageSettings} />
          <Route path="/tax-rate-management" component={TaxRateManagement} />
          <Route path="/theme-settings" component={ThemeSettings} />
          <Route
            path="/withdrawal-management"
            component={WithdrawalManagement}
          />
          <Route path="/withdrawal-view/:id" component={WithdrawalView} />
          <Route path="/email-management" component={EmailManagement} />
          <Route path="/user-management" component={UserManagement} />
          <Route path="/contact-management" component={ContactManagement} />
          <Route path="/video-encoding" component={VideoEncodingPage} />
          <Route
            path="/stickers-management"
            component={StickersManagementPage}
          />
          <Route path="/websocket-settings" component={WebSocketSettingsPage} />
          <Route
            path="/transaction-management"
            component={TransactionManagementPage}
          />
          <Route
            path="/verification-management"
            component={VerificationManagementPage}
          />
          <Route
            path="/subscription-management"
            component={SubscriptionManagementPage}
          />
          <Route path="/theme-generator" component={ThemeGeneratorPage} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/signup" component={Register} />
          <Route path="/password/reset" component={PasswordReset} />
          <Route path="/creators" component={CreatorsPage} />
          <Route path="/explore" component={ExplorePage} />
          <Route path="/categories" component={CategoriesPage} />
          <Route path="/blog-public" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          <Route path="/home" component={HomePage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/page/:slug" component={GenericPage} />
          <Route path="/system-configuration" component={SystemConfiguration} />
          <Route path="/payment-gateway-setup" component={PaymentGatewaySetup} />
          <Route path="/logo-favicon-management" component={LogoFaviconManagement} />
          <Route path="/kyc-verification-setup" component={KYCVerificationSetup} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route path="/kb" component={KnowledgeBase} />
          <Route path="/error/404" component={NotFound404} />
          <Route path="/error/500" component={ServerError500} />
          <Route path="/error/503" component={Maintenance503} />
          <Route path="/error/profile-disabled" component={ProfileDisabled} />
          <Route path="/demo-ui" component={DemoUIShowcase} />
          <Route path="/seo-configuration" component={SEOConfiguration} />
          <Route path="/aeo-configuration" component={AEOConfiguration} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

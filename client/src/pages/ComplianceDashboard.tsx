import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Eye,
  FileText,
  CreditCard,
  Globe,
  TrendingUp,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  Scale,
  Flag,
} from "lucide-react";

interface ComplianceStats {
  ageVerification: {
    totalChecks: number;
    verified: number;
    pending: number;
    failed: number;
    byJurisdiction: Record<string, number>;
  };
  csamDetection: {
    totalScans: number;
    detectionsBlocked: number;
    reportsToNCMEC: number;
    reportsToIWF: number;
  };
  paymentProcessor: {
    totalReviews: number;
    approved: number;
    flagged: number;
    blocked: number;
    avgRiskScore: number;
  };
  gdpr: {
    accessRequests: number;
    erasureRequests: number;
    pending: number;
    completed: number;
  };
  dsa: {
    noticesReceived: number;
    noticesProcessed: number;
    complaintsReceived: number;
    complaintsResolved: number;
  };
  trafficking: {
    assessments: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    criticalRisk: number;
    actionsTaken: number;
  };
}

interface RecentAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  status: string;
}

export default function ComplianceDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch compliance health check
  const { data: healthCheck } = useQuery({
    queryKey: ["/api/compliance/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch CSAM stats
  const { data: csamStats } = useQuery({
    queryKey: ["/api/compliance/csam/stats"],
    refetchInterval: 60000,
  });

  // Fetch trafficking stats
  const { data: traffickingStats } = useQuery({
    queryKey: ["/api/compliance/trafficking/stats"],
    refetchInterval: 60000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "error":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">CRITICAL</Badge>;
      case "high":
        return <Badge className="bg-orange-500">HIGH</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">MEDIUM</Badge>;
      case "low":
        return <Badge variant="outline">LOW</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Legal Compliance Command Center
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time monitoring of legal compliance systems for Fanz Dash
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Badge
            variant="outline"
            className="px-3 py-1 text-sm flex items-center gap-2"
          >
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {healthCheck?.services && Object.entries(healthCheck.services).map(([key, service]: [string, any]) => (
          <Card key={key} className={`border-2 ${getStatusColor(service.status)}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {service.status === "healthy" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {key.replace(/([A-Z])/g, " $1").trim()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold capitalize">{service.status}</div>
              {service.responseTime && (
                <p className="text-xs text-muted-foreground">
                  {service.responseTime}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Alerts */}
      {healthCheck?.criticalAlerts && healthCheck.criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{healthCheck.criticalAlerts.length} Critical Alerts:</strong>{" "}
            {healthCheck.criticalAlerts.map((alert: RecentAlert) => alert.message).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="csam">CSAM Detection</TabsTrigger>
          <TabsTrigger value="age-verification">Age Verification</TabsTrigger>
          <TabsTrigger value="payment">Payment Compliance</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR/DSA</TabsTrigger>
          <TabsTrigger value="trafficking">Trafficking</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CSAM Detection Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  CSAM Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Scans</span>
                  <span className="font-bold">{csamStats?.totalScans || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Blocked</span>
                  <span className="font-bold text-red-500">
                    {csamStats?.detectionsBlocked || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">NCMEC Reports</span>
                  <span className="font-bold">{csamStats?.reportsToNCMEC || 0}</span>
                </div>
                <Progress
                  value={
                    csamStats?.totalScans
                      ? ((csamStats.totalScans - csamStats.detectionsBlocked) /
                          csamStats.totalScans) *
                        100
                      : 100
                  }
                  className="h-2"
                />
                <p className="text-xs text-green-600 dark:text-green-400">
                  {csamStats?.totalScans
                    ? (
                        ((csamStats.totalScans - csamStats.detectionsBlocked) /
                          csamStats.totalScans) *
                        100
                      ).toFixed(2)
                    : 100}
                  % Clean Content
                </p>
              </CardContent>
            </Card>

            {/* Payment Processor Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  Payment Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Reviews (24h)
                  </span>
                  <span className="font-bold">
                    {healthCheck?.stats?.paymentProcessor?.reviews24h || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <span className="font-bold text-green-500">
                    {healthCheck?.stats?.paymentProcessor?.approved || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Blocked</span>
                  <span className="font-bold text-red-500">
                    {healthCheck?.stats?.paymentProcessor?.blocked || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Risk Score</span>
                  <span className="font-bold">
                    {healthCheck?.stats?.paymentProcessor?.avgRiskScore?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trafficking Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-purple-500" />
                  Trafficking Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Assessments</span>
                  <span className="font-bold">{traffickingStats?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Critical Risk</span>
                  <Badge variant="destructive">
                    {traffickingStats?.criticalRisk || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">High Risk</span>
                  <Badge className="bg-orange-500">
                    {traffickingStats?.highRisk || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Actions Taken</span>
                  <span className="font-bold text-blue-500">
                    {traffickingStats?.actionsTaken || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Compliance Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthCheck?.recentActivity?.map((activity: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{activity.system}</TableCell>
                      <TableCell>{activity.event}</TableCell>
                      <TableCell>{getSeverityBadge(activity.severity)}</TableCell>
                      <TableCell>
                        {activity.status === "resolved" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSAM Detection Tab */}
        <TabsContent value="csam" className="space-y-4">
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Federal Law Requirement:</strong> 18 U.S.C. § 2258A mandates
              immediate reporting to NCMEC for all CSAM detections. All scans are
              logged and preserved for law enforcement.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Scans (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{csamStats?.totalScans || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-500" />
                  Blocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {csamStats?.detectionsBlocked || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  NCMEC Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{csamStats?.reportsToNCMEC || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">IWF Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{csamStats?.reportsToIWF || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detection Method Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">PhotoDNA Hash Matching</span>
                    <span className="text-sm text-muted-foreground">
                      {csamStats?.photoDNAScans || 0} scans
                    </span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">PDQ Perceptual Hash</span>
                    <span className="text-sm text-muted-foreground">
                      {csamStats?.pdqScans || 0} scans
                    </span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Age Verification Tab */}
        <TabsContent value="age-verification" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {healthCheck?.stats?.ageVerification?.total || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Verified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {healthCheck?.stats?.ageVerification?.verified || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {healthCheck?.stats?.ageVerification?.pending || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {healthCheck?.stats?.ageVerification?.failed || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Verification by Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Legal Reference</TableHead>
                    <TableHead>Verifications</TableHead>
                    <TableHead>Compliance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">United Kingdom</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      Online Safety Act 2023
                    </TableCell>
                    <TableCell>
                      {healthCheck?.stats?.ageVerification?.byJurisdiction?.GB || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        98.5%
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Louisiana, USA</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      LA Act 440 (2023)
                    </TableCell>
                    <TableCell>
                      {healthCheck?.stats?.ageVerification?.byJurisdiction?.["US-LA"] || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        97.2%
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Texas, USA</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      TX HB 1181 (2023)
                    </TableCell>
                    <TableCell>
                      {healthCheck?.stats?.ageVerification?.byJurisdiction?.["US-TX"] || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        96.8%
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Compliance Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Business Critical:</strong> Visa/Mastercard GBPP compliance
              prevents payment processor termination. All content is automatically
              screened for prohibited categories.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prohibited Content Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Non-Consensual Content</span>
                  <Badge variant="destructive">0 Violations</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Minors or Apparent Minors</span>
                  <Badge variant="destructive">0 Violations</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Incest</span>
                  <Badge variant="outline">0 Violations</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bestiality</span>
                  <Badge variant="outline">0 Violations</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Score Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Low Risk (0-30)</span>
                    <span className="font-medium">
                      {healthCheck?.stats?.paymentProcessor?.lowRisk || 0}
                    </span>
                  </div>
                  <Progress value={70} className="h-2 bg-green-100" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Medium Risk (30-80)</span>
                    <span className="font-medium">
                      {healthCheck?.stats?.paymentProcessor?.mediumRisk || 0}
                    </span>
                  </div>
                  <Progress value={20} className="h-2 bg-yellow-100" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>High Risk (80+)</span>
                    <span className="font-medium text-red-500">
                      {healthCheck?.stats?.paymentProcessor?.highRisk || 0}
                    </span>
                  </div>
                  <Progress value={5} className="h-2 bg-red-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quarterly Reporting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Report</span>
                  <span className="text-sm font-medium">Q4 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next Report Due</span>
                  <span className="text-sm font-medium">Q1 2025</span>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2">
                  <Download className="h-4 w-4 mr-2" />
                  Download Q4 Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* GDPR/DSA Tab */}
        <TabsContent value="gdpr" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  GDPR Data Subject Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Access Requests</span>
                  <span className="font-bold">
                    {healthCheck?.stats?.gdpr?.accessRequests || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Erasure Requests
                  </span>
                  <span className="font-bold">
                    {healthCheck?.stats?.gdpr?.erasureRequests || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Pending (under 30 days)
                  </span>
                  <Badge variant="outline">
                    {healthCheck?.stats?.gdpr?.pending || 0}
                  </Badge>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    All requests must be completed within 30 days per GDPR Article 12.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  EU DSA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Notices Received
                  </span>
                  <span className="font-bold">
                    {healthCheck?.stats?.dsa?.noticesReceived || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Notices Processed
                  </span>
                  <span className="font-bold text-green-500">
                    {healthCheck?.stats?.dsa?.noticesProcessed || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Complaints Filed
                  </span>
                  <span className="font-bold">
                    {healthCheck?.stats?.dsa?.complaintsReceived || 0}
                  </span>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    DSA Article 6: Notices must be processed within 24h for illegal
                    content, 7 days for ToS violations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trafficking Tab */}
        <TabsContent value="trafficking" className="space-y-4">
          <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950">
            <Flag className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 dark:text-purple-200">
              <strong>FOSTA-SESTA Compliance:</strong> All content and messages are
              monitored for trafficking indicators. Critical risks trigger immediate
              action and reporting to FBI/NCMEC.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {traffickingStats?.total || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Critical Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {traffickingStats?.criticalRisk || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  High Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {traffickingStats?.highRisk || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Actions Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  {traffickingStats?.actionsTaken || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trafficking Indicators Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between p-2 border rounded">
                  <span className="text-sm">Third-party control language</span>
                  <Badge variant="destructive">
                    {traffickingStats?.indicators?.thirdPartyControl || 0}
                  </Badge>
                </div>
                <div className="flex justify-between p-2 border rounded">
                  <span className="text-sm">Escort services solicitation</span>
                  <Badge variant="destructive">
                    {traffickingStats?.indicators?.escortServices || 0}
                  </Badge>
                </div>
                <div className="flex justify-between p-2 border rounded">
                  <span className="text-sm">External contact sharing</span>
                  <Badge className="bg-orange-500">
                    {traffickingStats?.indicators?.externalContact || 0}
                  </Badge>
                </div>
                <div className="flex justify-between p-2 border rounded">
                  <span className="text-sm">Financial coercion indicators</span>
                  <Badge className="bg-yellow-500">
                    {traffickingStats?.indicators?.financialCoercion || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

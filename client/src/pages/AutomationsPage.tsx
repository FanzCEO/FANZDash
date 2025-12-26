/**
 * FanzDash Automations Admin Page
 * Version: 1.0.0
 *
 * Admin UI for managing automation workflows (Pabbly-style).
 */

import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Zap,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============================================
// Types
// ============================================

interface TriggerCondition {
  [field: string]: {
    eq?: string | number;
    neq?: string | number;
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
    contains?: string;
  };
}

interface AutomationAction {
  type: string;
  [key: string]: any;
}

interface Workflow {
  id?: number;
  name: string;
  description?: string;
  pack?: string;
  platform?: string;
  trigger_event: string;
  trigger_condition?: TriggerCondition | null;
  actions: AutomationAction[];
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

interface WorkflowRun {
  id: number;
  workflow_id: number;
  workflow_name: string;
  trigger_event: string;
  status: string;
  run_at: string;
  trigger_data?: Record<string, any>;
  result_data?: any[];
  error_message?: string;
}

interface AutomationStats {
  workflows: { total: number; active: number };
  runs_24h: Record<string, number>;
  queue: Record<string, number>;
  top_triggers_7d: Array<{ trigger_event: string; count: number }>;
}

// ============================================
// Constants
// ============================================

const API_BASE = "/api/automation/index.php";

const TRIGGER_OPTIONS = [
  { value: "user.created", label: "User Created", category: "User" },
  { value: "user.login", label: "User Login", category: "User" },
  { value: "creator.verified", label: "Creator Verified", category: "Creator" },
  { value: "creator.new_follower", label: "New Follower", category: "Creator" },
  { value: "subscription.started", label: "Subscription Started", category: "Subscription" },
  { value: "subscription.renewed", label: "Subscription Renewed", category: "Subscription" },
  { value: "subscription.cancelled", label: "Subscription Cancelled", category: "Subscription" },
  { value: "subscription.failed", label: "Payment Failed", category: "Subscription" },
  { value: "custom_request.created", label: "Custom Request Created", category: "Content" },
  { value: "content.uploaded", label: "Content Uploaded", category: "Content" },
  { value: "content.flagged", label: "Content Flagged", category: "Content" },
  { value: "order.placed", label: "Order Placed", category: "Shop" },
  { value: "order.shipped", label: "Order Shipped", category: "Shop" },
  { value: "payout.requested", label: "Payout Requested", category: "Finance" },
];

const ACTION_TYPES = [
  { value: "send_email", label: "Send Email", icon: "mail" },
  { value: "send_webhook", label: "Send Webhook", icon: "globe" },
  { value: "delay", label: "Delay", icon: "clock" },
  { value: "admin_notify", label: "Admin Notification", icon: "bell" },
  { value: "creator_notify", label: "Creator Notification", icon: "user" },
  { value: "db_write", label: "Write to Database", icon: "database" },
  { value: "custom_code", label: "Custom Code", icon: "code" },
];

const PACK_OPTIONS = [
  { value: "", label: "All Packs" },
  { value: "onboarding", label: "Onboarding" },
  { value: "retention", label: "Retention" },
  { value: "moderation", label: "Moderation" },
  { value: "pod_store", label: "POD Store" },
  { value: "creator_ops", label: "Creator Ops" },
];

const PLATFORM_OPTIONS = [
  { value: "", label: "All Platforms" },
  { value: "global", label: "Global" },
  { value: "BoyFanz", label: "BoyFanz" },
  { value: "GirlFanz", label: "GirlFanz" },
  { value: "GayFanz", label: "GayFanz" },
  { value: "TransFanz", label: "TransFanz" },
  { value: "PupFanz", label: "PupFanz" },
  { value: "CougarFanz", label: "CougarFanz" },
  { value: "BearFanz", label: "BearFanz" },
];

// ============================================
// API Functions
// ============================================

async function fetchWorkflows(pack?: string, platform?: string): Promise<Workflow[]> {
  const params = new URLSearchParams({ action: "list-workflows" });
  if (pack) params.append("pack", pack);
  if (platform) params.append("platform", platform);

  const res = await fetch(`${API_BASE}?${params}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.workflows || [];
}

async function fetchRuns(limit = 50): Promise<WorkflowRun[]> {
  const res = await fetch(`${API_BASE}?action=list-runs&limit=${limit}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.runs || [];
}

async function fetchStats(): Promise<AutomationStats> {
  const res = await fetch(`${API_BASE}?action=stats`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.stats;
}

async function saveWorkflow(workflow: Workflow): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}?action=save-workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workflow),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

async function toggleWorkflow(id: number, isActive: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}?action=toggle-workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, is_active: isActive ? 1 : 0 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
}

async function deleteWorkflow(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}?action=delete-workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
}

async function testDispatch(event: string, payload: Record<string, any>): Promise<{ workflows_triggered: number }> {
  const res = await fetch(`${API_BASE}?action=test-dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, payload }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ============================================
// Main Component
// ============================================

export default function AutomationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [packFilter, setPackFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Test event state
  const [testEventName, setTestEventName] = useState("subscription.started");
  const [testPayload, setTestPayload] = useState(
    JSON.stringify({ user_id: 123, user_email: "test@example.com", price: 39.99 }, null, 2)
  );

  // Queries
  const { data: workflows = [], isLoading: loadingWorkflows, refetch: refetchWorkflows } = useQuery({
    queryKey: ["automationWorkflows", packFilter, platformFilter],
    queryFn: () => fetchWorkflows(packFilter, platformFilter),
  });

  const { data: runs = [], isLoading: loadingRuns, refetch: refetchRuns } = useQuery({
    queryKey: ["automationRuns"],
    queryFn: () => fetchRuns(50),
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ["automationStats"],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => toggleWorkflow(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automationWorkflows"] });
      toast({ title: "Workflow updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automationWorkflows"] });
      toast({ title: "Workflow deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: ({ event, payload }: { event: string; payload: Record<string, any> }) =>
      testDispatch(event, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automationRuns"] });
      toast({
        title: "Test event sent",
        description: `${data.workflows_triggered} workflow(s) triggered`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const openCreate = () => {
    setEditingWorkflow({
      name: "",
      description: "",
      pack: "",
      platform: "global",
      trigger_event: "user.created",
      trigger_condition: null,
      actions: [],
    });
    setIsEditorOpen(true);
  };

  const openEdit = (wf: Workflow) => {
    setEditingWorkflow({ ...wf });
    setIsEditorOpen(true);
  };

  const handleTestDispatch = () => {
    try {
      const payload = JSON.parse(testPayload);
      testMutation.mutate({ event: testEventName, payload });
    } catch {
      toast({ title: "Invalid JSON", description: "Please check your payload syntax", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            FanzDash Automations
          </h1>
          <p className="text-muted-foreground">
            Event-based workflows powering the FANZ ecosystem
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.workflows.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.workflows.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Runs (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(stats.runs_24h || {}).reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-xs text-green-500">
                {stats.runs_24h?.success || 0} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.queue?.queued || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.queue?.running || 0} running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Trigger (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">
                {stats.top_triggers_7d?.[0]?.trigger_event || "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.top_triggers_7d?.[0]?.count || 0} runs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="runs">Recent Runs</TabsTrigger>
          <TabsTrigger value="test">Test Event</TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={packFilter} onValueChange={setPackFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by pack" />
              </SelectTrigger>
              <SelectContent>
                {PACK_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => refetchWorkflows()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Workflows Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingWorkflows ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : workflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No workflows found. Create your first automation.
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map((wf) => (
                    <TableRow key={wf.id}>
                      <TableCell>
                        <div className="font-medium">{wf.name}</div>
                        {wf.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {wf.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wf.trigger_event}</Badge>
                      </TableCell>
                      <TableCell>
                        {wf.pack && <Badge variant="secondary">{wf.pack}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wf.platform || "global"}</Badge>
                      </TableCell>
                      <TableCell>{wf.actions?.length || 0}</TableCell>
                      <TableCell>
                        <Switch
                          checked={Boolean(wf.is_active)}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: wf.id!, isActive: checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(wf)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this workflow?")) {
                                deleteMutation.mutate(wf.id!);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => refetchRuns()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Run At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRuns ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : runs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No recent runs.
                    </TableCell>
                  </TableRow>
                ) : (
                  runs.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-mono text-xs">#{run.id}</TableCell>
                      <TableCell>{run.workflow_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{run.trigger_event}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            run.status === "success"
                              ? "default"
                              : run.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className="flex items-center gap-1 w-fit"
                        >
                          {run.status === "success" && <CheckCircle className="h-3 w-3" />}
                          {run.status === "failed" && <XCircle className="h-3 w-3" />}
                          {run.status === "pending" && <Clock className="h-3 w-3" />}
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {run.run_at}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Test Event Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Event Dispatch</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fire a test event to verify your workflows are working correctly.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Select value={testEventName} onValueChange={setTestEventName}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleTestDispatch}
                    disabled={testMutation.isPending}
                  >
                    {testMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Fire Test Event
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payload (JSON)</Label>
                <Textarea
                  className="font-mono text-sm h-48"
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  placeholder='{"user_id": 123, "price": 39.99}'
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workflow Editor Dialog */}
      <WorkflowEditor
        open={isEditorOpen}
        workflow={editingWorkflow}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingWorkflow(null);
        }}
        onSaved={() => {
          setIsEditorOpen(false);
          setEditingWorkflow(null);
          refetchWorkflows();
        }}
      />
    </div>
  );
}

// ============================================
// Workflow Editor Component
// ============================================

interface WorkflowEditorProps {
  open: boolean;
  workflow: Workflow | null;
  onClose: () => void;
  onSaved: () => void;
}

function WorkflowEditor({ open, workflow, onClose, onSaved }: WorkflowEditorProps) {
  const { toast } = useToast();
  const [wf, setWf] = useState<Workflow | null>(null);
  const [conditionJson, setConditionJson] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workflow) {
      setWf({ ...workflow });
      setConditionJson(
        workflow.trigger_condition
          ? JSON.stringify(workflow.trigger_condition, null, 2)
          : ""
      );
    }
  }, [workflow]);

  const updateField = (field: keyof Workflow, value: any) => {
    setWf((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const addAction = () => {
    setWf((prev) =>
      prev
        ? {
            ...prev,
            actions: [
              ...prev.actions,
              { type: "send_email", to: "{user_email}", template: "default" },
            ],
          }
        : null
    );
  };

  const updateAction = (index: number, patch: Partial<AutomationAction>) => {
    setWf((prev) => {
      if (!prev) return null;
      const actions = [...prev.actions];
      actions[index] = { ...actions[index], ...patch };
      return { ...prev, actions };
    });
  };

  const removeAction = (index: number) => {
    setWf((prev) => {
      if (!prev) return null;
      const actions = [...prev.actions];
      actions.splice(index, 1);
      return { ...prev, actions };
    });
  };

  const handleSave = async () => {
    if (!wf) return;

    // Validate
    if (!wf.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (wf.actions.length === 0) {
      toast({ title: "Add at least one action", variant: "destructive" });
      return;
    }

    // Parse condition
    let condition = null;
    if (conditionJson.trim()) {
      try {
        condition = JSON.parse(conditionJson);
      } catch {
        toast({ title: "Invalid condition JSON", variant: "destructive" });
        return;
      }
    }

    setSaving(true);
    try {
      await saveWorkflow({ ...wf, trigger_condition: condition });
      toast({ title: "Workflow saved" });
      onSaved();
    } catch (error) {
      toast({
        title: "Error saving workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!wf) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {wf.id ? "Edit Workflow" : "New Workflow"}
          </DialogTitle>
          <DialogDescription>
            Configure the trigger, conditions, and actions for this automation.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={wf.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="High-Value Subscriber Welcome"
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select
                  value={wf.trigger_event}
                  onValueChange={(v) => updateField("trigger_event", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pack</Label>
                <Select
                  value={wf.pack || ""}
                  onValueChange={(v) => updateField("pack", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pack" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACK_OPTIONS.slice(1).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={wf.platform || "global"}
                  onValueChange={(v) => updateField("platform", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.slice(1).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={wf.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={2}
              />
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <Label>Trigger Conditions (JSON)</Label>
              <Textarea
                className="font-mono text-sm"
                value={conditionJson}
                onChange={(e) => setConditionJson(e.target.value)}
                placeholder='{"price": {"gt": 29}}'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Example: {`{"price": {"gt": 29}, "country": {"eq": "US"}}`}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Actions</Label>
                <Button variant="outline" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </Button>
              </div>

              {wf.actions.length === 0 ? (
                <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground">
                  No actions yet. Add at least one action.
                </div>
              ) : (
                <div className="space-y-3">
                  {wf.actions.map((action, idx) => (
                    <ActionEditor
                      key={idx}
                      index={idx}
                      action={action}
                      onUpdate={(patch) => updateAction(idx, patch)}
                      onRemove={() => removeAction(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Action Editor Component
// ============================================

interface ActionEditorProps {
  index: number;
  action: AutomationAction;
  onUpdate: (patch: Partial<AutomationAction>) => void;
  onRemove: () => void;
}

function ActionEditor({ index, action, onUpdate, onRemove }: ActionEditorProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Step {index + 1}</Badge>
            <Select
              value={action.type}
              onValueChange={(v) => onUpdate({ type: v })}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {action.type === "send_email" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">To</Label>
                <Input
                  value={action.to || ""}
                  onChange={(e) => onUpdate({ to: e.target.value })}
                  placeholder="{user_email}"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Template</Label>
                <Input
                  value={action.template || ""}
                  onChange={(e) => onUpdate({ template: e.target.value })}
                  placeholder="welcome_email"
                />
              </div>
            </div>
          )}

          {action.type === "send_webhook" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">URL</Label>
                <Input
                  value={action.url || ""}
                  onChange={(e) => onUpdate({ url: e.target.value })}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Body (JSON)</Label>
                <Textarea
                  className="font-mono text-xs"
                  value={
                    typeof action.body === "object"
                      ? JSON.stringify(action.body, null, 2)
                      : action.body || "{}"
                  }
                  onChange={(e) => {
                    try {
                      onUpdate({ body: JSON.parse(e.target.value) });
                    } catch {
                      // Keep as string if invalid JSON
                    }
                  }}
                  rows={4}
                />
              </div>
            </div>
          )}

          {action.type === "delay" && (
            <div className="space-y-2">
              <Label className="text-xs">Delay (seconds)</Label>
              <Input
                type="number"
                value={action.seconds || 0}
                onChange={(e) => onUpdate({ seconds: parseInt(e.target.value) || 0 })}
                placeholder="86400"
              />
              <p className="text-xs text-muted-foreground">
                86400 = 24 hours, 3600 = 1 hour
              </p>
            </div>
          )}

          {action.type === "admin_notify" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Message</Label>
                <Textarea
                  value={action.message || ""}
                  onChange={(e) => onUpdate({ message: e.target.value })}
                  placeholder="New event: {user_email}"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Level</Label>
                <Select
                  value={action.level || "info"}
                  onValueChange={(v) => onUpdate({ level: v })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {action.type === "creator_notify" && (
            <div className="space-y-2">
              <Label className="text-xs">Message</Label>
              <Textarea
                value={action.message || ""}
                onChange={(e) => onUpdate({ message: e.target.value })}
                placeholder="You have a new custom request from {user_name}!"
                rows={2}
              />
            </div>
          )}

          {action.type === "custom_code" && (
            <div className="space-y-2">
              <Label className="text-xs">Function Key</Label>
              <Input
                value={action.function || ""}
                onChange={(e) => onUpdate({ function: e.target.value })}
                placeholder="calculate_loyalty_bonus"
              />
              <p className="text-xs text-muted-foreground">
                Maps to a predefined server-side function
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

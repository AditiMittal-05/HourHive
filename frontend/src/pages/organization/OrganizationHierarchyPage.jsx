import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Search, ChevronDown, Users, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SkeletonTable } from "@/components/shared/PageLoader";
import { usersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";

export function OrganizationHierarchyPage() {
  const [search, setSearch] = useState("");
  const [managerFilter, setManagerFilter] = useState("all");
  const [assignModal, setAssignModal] = useState(null);
  const [selectedManager, setSelectedManager] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["org-tree"],
    queryFn: usersService.orgTree,
  });

  const setManagerMutation = useMutation({
    mutationFn: ({ userId, managerId }) => usersService.setManager(userId, managerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-tree"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      setAssignModal(null);
      toast.success("Manager updated");
    },
    onError: (e) => toast.error("Failed", e?.response?.data?.detail),
  });

  const handleAssignManager = () => {
    if (!assignModal) return;
    const managerId = selectedManager === "none" ? null : parseInt(selectedManager, 10);
    setManagerMutation.mutate({ userId: assignModal.id, managerId });
  };

  const managers = users.filter((u) => u.direct_report_count > 0 || u.can_approve_timesheets);

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.employee_code.toLowerCase().includes(search.toLowerCase());
    const matchManager = managerFilter === "all" ||
      (managerFilter === "unassigned" && !u.manager_id) ||
      String(u.manager_id) === managerFilter;
    return matchSearch && matchManager;
  });

  const uniqueManagers = users.filter((u) => users.some((emp) => emp.manager_id === u.id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Hierarchy</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Manage reporting lines — assign managers to employees
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Total Employees" value={users.length} color="blue" />
        <SummaryCard icon={GitBranch} label="With Manager" value={users.filter((u) => u.manager_id).length} color="green" />
        <SummaryCard icon={UserCheck} label="Managers" value={users.filter((u) => u.can_approve_timesheets).length} color="amber" />
        <SummaryCard icon={Users} label="No Manager" value={users.filter((u) => !u.manager_id).length} color="red" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
              <Input placeholder="Search employees..." className="pl-9" value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by Manager" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="unassigned">No Manager Assigned</SelectItem>
                {uniqueManagers.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchy Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><SkeletonTable /></div>
          ) : (
            <>
              <table className="enterprise-table w-full">
                <thead>
                  <tr>
                    {["Employee", "Department", "Designation", "Manager", "Reports To", "Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <GitBranch className="h-10 w-10 text-border-color mx-auto mb-3" />
                        <p className="text-text-secondary font-medium">No employees found</p>
                        <p className="text-text-secondary text-sm mt-1">
                          {users.length === 0
                            ? "Add employees in User Management first"
                            : "Try adjusting your filters"}
                        </p>
                      </td>
                    </tr>
                  ) : filtered.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
                            {emp.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{emp.full_name}</p>
                            <p className="text-xs text-text-secondary font-mono">{emp.employee_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-text-secondary">{emp.department || <span className="opacity-40">—</span>}</td>
                      <td className="text-sm text-text-secondary">{emp.designation || <span className="opacity-40">—</span>}</td>
                      <td>
                        {emp.manager_name ? (
                          <span className="text-sm font-medium text-text-primary">{emp.manager_name}</span>
                        ) : (
                          <span className="text-xs text-text-secondary/50 italic">Not assigned</span>
                        )}
                      </td>
                      <td>
                        {emp.direct_report_count > 0 && (
                          <Badge className="text-[10px]" style={{ background: "rgba(20,87,232,0.10)", color: "#1457E8" }}>
                            {emp.direct_report_count} report{emp.direct_report_count !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        {emp.can_approve_timesheets && (
                          <Badge className="text-[10px] ml-1" style={{ background: "rgba(0,200,130,0.14)", color: "#006646" }}>
                            Manager
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Button size="sm" variant="outline"
                          onClick={() => {
                            setAssignModal(emp);
                            setSelectedManager(emp.manager_id ? String(emp.manager_id) : "none");
                          }}>
                          <GitBranch className="h-3 w-3 mr-1" /> Set Manager
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-border-color">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-semibold text-text-primary">{filtered.length}</span> of{" "}
                    <span className="font-semibold text-text-primary">{users.length}</span> employees
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign Manager Dialog */}
      {assignModal && (
        <Dialog open={!!assignModal} onOpenChange={(o) => { if (!o) setAssignModal(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Manager for {assignModal.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-light-bg border border-border-color">
                <p className="text-sm font-semibold text-text-primary">{assignModal.full_name}</p>
                <p className="text-xs text-text-secondary">{assignModal.employee_code} · {assignModal.department || "No department"}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Reporting Manager</label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No Manager —</SelectItem>
                    {users
                      .filter((u) => u.id !== assignModal.id)
                      .map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.full_name} {u.can_approve_timesheets ? "· Manager" : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignModal(null)}>Cancel</Button>
              <Button onClick={handleAssignManager} loading={setManagerMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: { bg: "rgba(20,87,232,0.08)", text: "#1457E8" },
    green: { bg: "rgba(16,185,129,0.08)", text: "#065F46" },
    amber: { bg: "rgba(217,119,6,0.08)", text: "#92400E" },
    red: { bg: "rgba(239,68,68,0.08)", text: "#991B1B" },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
          <Icon className="h-4 w-4" style={{ color: c.text }} />
        </div>
        <div>
          <p className="text-xs text-text-secondary">{label}</p>
          <p className="text-xl font-bold text-text-primary">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

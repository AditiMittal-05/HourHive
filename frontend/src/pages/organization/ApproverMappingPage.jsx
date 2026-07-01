import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCog, Search, CheckCircle, XCircle, Users, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/shared/PageLoader";
import { usersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";

export function ApproverMappingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["org-tree"],
    queryFn: usersService.orgTree,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, canApprove }) => usersService.toggleApprover(userId, canApprove),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["org-tree"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(vars.canApprove ? "Approver access granted" : "Approver access removed");
    },
    onError: (e) => toast.error("Failed", e?.response?.data?.detail),
  });

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.employee_code.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "approvers" && u.can_approve_timesheets) ||
      (filter === "non-approvers" && !u.can_approve_timesheets);
    return matchSearch && matchFilter;
  });

  const approverCount = users.filter((u) => u.can_approve_timesheets).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Manager Assignment</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Designate employees as team managers who can approve their team's timesheets
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border p-4 flex items-start gap-3"
        style={{ background: "rgba(20,87,232,0.04)", borderColor: "rgba(20,87,232,0.16)" }}>
        <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-text-primary">How manager permissions work</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Employees designated as managers can approve, reject, and unlock timesheets submitted by their
            direct reports (employees assigned under them in Org Hierarchy). Super Admin can
            manage all timesheets regardless of this setting.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Employees" value={users.length} icon={Users} />
        <StatCard label="Managers" value={approverCount} icon={CheckCircle} color="green" />
        <StatCard label="Regular Employees" value={users.length - approverCount} icon={XCircle} color="slate" />
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
            <div className="flex gap-2">
              {[
                { key: "all", label: "All" },
                { key: "approvers", label: "Managers" },
                { key: "non-approvers", label: "Regular Employees" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.key
                      ? "bg-primary text-white"
                      : "bg-light-bg text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><SkeletonTable /></div>
          ) : (
            <>
              <table className="enterprise-table w-full">
                <thead>
                  <tr>
                    {["Employee", "Department", "Manager", "Direct Reports", "Manager Role", "Action"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <UserCog className="h-10 w-10 text-border-color mx-auto mb-3" />
                        <p className="text-text-secondary font-medium">No employees found</p>
                        {users.length === 0 && (
                          <p className="text-text-secondary text-sm mt-1">
                            Add employees in User Management to get started
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : filtered.map((emp) => (
                    <tr key={emp.id} className={emp.can_approve_timesheets ? "bg-green-50/30" : ""}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              background: emp.can_approve_timesheets
                                ? "linear-gradient(135deg, #10B981, #059669)"
                                : "linear-gradient(135deg, #2563EB, #1D4ED8)"
                            }}>
                            {emp.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{emp.full_name}</p>
                            <p className="text-xs text-text-secondary font-mono">{emp.employee_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-text-secondary">{emp.department || <span className="opacity-40">—</span>}</td>
                      <td className="text-sm text-text-secondary">{emp.manager_name || <span className="opacity-40">—</span>}</td>
                      <td>
                        {emp.direct_report_count > 0 ? (
                          <Badge style={{ background: "rgba(20,87,232,0.10)", color: "#1457E8" }}>
                            {emp.direct_report_count} employee{emp.direct_report_count !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-xs text-text-secondary/50">None</span>
                        )}
                      </td>
                      <td>
                        {emp.can_approve_timesheets ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(0,200,130,0.15)", color: "#006646" }}>
                            <CheckCircle className="h-3 w-3" /> Manager
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-text-secondary/60 bg-light-bg">
                            <XCircle className="h-3 w-3" /> Employee
                          </span>
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant={emp.can_approve_timesheets ? "destructive" : "success"}
                          onClick={() => toggleMutation.mutate({ userId: emp.id, canApprove: !emp.can_approve_timesheets })}
                          disabled={toggleMutation.isPending}
                          className="min-w-[110px]"
                        >
                          {emp.can_approve_timesheets ? (
                            <><XCircle className="h-3.5 w-3.5" /> Remove Role</>
                          ) : (
                            <><CheckCircle className="h-3.5 w-3.5" /> Set as Manager</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-border-color">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-semibold text-text-primary">{filtered.length}</span> employees
                    {approverCount > 0 && (
                      <span className="ml-2 text-xs" style={{ color: "#006646" }}>
                        · {approverCount} manager{approverCount !== 1 ? "s" : ""} configured
                      </span>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: { bg: "rgba(20,87,232,0.08)", text: "#1457E8" },
    green: { bg: "rgba(0,200,130,0.12)", text: "#006646" },
    slate: { bg: "rgba(100,116,139,0.08)", text: "#475569" },
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

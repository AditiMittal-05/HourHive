import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send, Plus, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonTable } from "@/components/shared/PageLoader";
import { timesheetsService } from "@/services/timesheets.service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function TimesheetListPage() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["timesheets-list", page],
    queryFn: () => timesheetsService.listTimesheets({ page, page_size: 10 }),
    placeholderData: (prev) => prev,
  });

  const submitMutation = useMutation({
    mutationFn: (id) => timesheetsService.submitTimesheet(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timesheets-list"] });
      toast.success("Timesheet submitted for approval");
    },
    onError: (e) => toast.error("Failed", e?.response?.data?.detail),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Timesheets</h1>
          <p className="text-text-secondary text-sm mt-0.5">Weekly timesheet submissions and approval status</p>
        </div>
        <Button onClick={() => navigate("/timesheets/entry")}>
          <Plus className="h-4 w-4" /> Log Time
        </Button>
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <SkeletonTable />
            </div>
          ) : (
            <>
              <table className="enterprise-table w-full">
                <thead>
                  <tr>
                    {["Week Period", "Total Hours", "Status", "Submitted", "Approval", "Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(!data?.items || data.items.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="w-12 h-12 rounded-xl bg-light-bg flex items-center justify-center mx-auto mb-3">
                          <Clock className="h-5 w-5 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-text-secondary">No timesheets found</p>
                        <p className="text-xs text-text-secondary/60 mt-1">Start logging time to see your timesheets here</p>
                      </td>
                    </tr>
                  ) : data.items.map((ts) => (
                    <tr key={ts.id}>
                      <td>
                        <p className="text-sm font-semibold text-text-primary">
                          {ts.week_start_date} – {ts.week_end_date}
                        </p>
                      </td>
                      <td>
                        <span className="text-sm font-bold text-text-primary tabular-nums">
                          {Number(ts.total_hours).toFixed(2)}h
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={ts.status} />
                      </td>
                      <td className="text-xs text-text-secondary">
                        {ts.submitted_at
                          ? format(new Date(ts.submitted_at), "MMM d, yyyy HH:mm")
                          : <span className="text-text-secondary/40">—</span>}
                      </td>
                      <td>
                        {ts.approved_at && (
                          <span className="text-xs font-semibold text-emerald-600">
                            ✓ {format(new Date(ts.approved_at), "MMM d, yyyy")}
                          </span>
                        )}
                        {ts.rejection_reason && (
                          <div>
                            <span className="text-xs font-semibold text-danger">Rejected</span>
                            <p className="text-xs text-text-secondary/70 mt-0.5 max-w-[180px] truncate">
                              {ts.rejection_reason}
                            </p>
                          </div>
                        )}
                        {!ts.approved_at && !ts.rejection_reason && (
                          <span className="text-text-secondary/40 text-xs">—</span>
                        )}
                      </td>
                      <td>
                        {(ts.status === "draft" || ts.status === "rejected") && (
                          <Button
                            size="sm"
                            onClick={() => submitMutation.mutate(ts.id)}
                            loading={submitMutation.isPending && submitMutation.variables === ts.id}
                          >
                            <Send className="h-3 w-3" /> Submit
                          </Button>
                        )}
                        {ts.status === "submitted" && (
                          <span className="text-xs text-text-secondary italic">Pending review</span>
                        )}
                        {ts.status === "approved" && (
                          <span className="text-xs font-semibold text-emerald-600">Locked ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data && data.total > 10 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border-color">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-semibold text-text-primary">{(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)}</span> of{" "}
                    <span className="font-semibold text-text-primary">{data.total}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button size="sm" variant="outline" disabled={page * 10 >= data.total} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

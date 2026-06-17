import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    mutationFn: (id: number) => timesheetsService.submitTimesheet(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timesheets-list"] }); toast.success("Timesheet submitted for approval"); },
    onError: (e: any) => toast.error("Failed", e?.response?.data?.detail),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Timesheets</h1>
          <p className="text-text-secondary text-sm mt-0.5">Weekly timesheet submissions and status</p>
        </div>
        <Button onClick={() => navigate("/timesheets/entry")}>
          <ChevronRight className="h-4 w-4" /> Log Time
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6"><SkeletonTable /></div> : (
            <>
              <table className="w-full">
                <thead className="bg-light-bg border-b border-border-color">
                  <tr>
                    {["Week", "Total Hours", "Status", "Submitted", "Approved/Rejected", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-text-secondary px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {(!data?.items || data.items.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-text-secondary text-sm">No timesheets found</td>
                    </tr>
                  ) : data.items.map((ts) => (
                    <tr key={ts.id} className="hover:bg-light-bg transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-text-primary">{ts.week_start_date} – {ts.week_end_date}</p>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-text-primary tabular-nums">{Number(ts.total_hours).toFixed(2)}h</td>
                      <td className="px-5 py-3"><StatusBadge status={ts.status} /></td>
                      <td className="px-5 py-3 text-xs text-text-secondary">
                        {ts.submitted_at ? format(new Date(ts.submitted_at), "MMM d, yyyy HH:mm") : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-text-secondary">
                        {ts.approved_at && <span className="text-success">{format(new Date(ts.approved_at), "MMM d, yyyy")}</span>}
                        {ts.rejection_reason && (
                          <div>
                            <span className="text-danger">Rejected</span>
                            <p className="text-text-secondary/70 mt-0.5 max-w-[200px] truncate">{ts.rejection_reason}</p>
                          </div>
                        )}
                        {!ts.approved_at && !ts.rejection_reason && "—"}
                      </td>
                      <td className="px-5 py-3">
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
                          <span className="text-xs text-success font-medium">Locked ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data && data.total > 10 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border-color">
                  <p className="text-sm text-text-secondary">
                    Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} of {data.total}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <Button size="sm" variant="outline" disabled={page * 10 >= data.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
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

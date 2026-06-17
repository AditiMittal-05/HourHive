import { Badge } from "@/components/ui/badge";
import type { TimesheetStatus } from "@/types";

const labels: Record<TimesheetStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  resubmitted: "Resubmitted",
};

const variants: Record<TimesheetStatus, any> = {
  draft: "draft",
  submitted: "submitted",
  approved: "approved",
  rejected: "rejected",
  resubmitted: "resubmitted",
};

export function StatusBadge({ status }: { status: TimesheetStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

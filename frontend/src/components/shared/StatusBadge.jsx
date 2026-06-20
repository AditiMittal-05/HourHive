import { Badge } from "@/components/ui/badge";

const labels = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  resubmitted: "Resubmitted",
};

const variants = {
  draft: "draft",
  submitted: "submitted",
  approved: "approved",
  rejected: "rejected",
  resubmitted: "resubmitted",
};

export function StatusBadge({ status }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

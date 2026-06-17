import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, parseISO } from "date-fns";
import { Plus, Trash2, Copy, CheckCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { timesheetsService } from "@/services/timesheets.service";
import { projectsService } from "@/services/projects.service";
import { activitiesService } from "@/services/activities.service";
import { useToast } from "@/hooks/use-toast";
import type { TimesheetEntry, TimesheetStatus } from "@/types";

const HOUR_OPTIONS = [0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00, 5.25, 5.50, 5.75, 6.00, 6.25, 6.50, 6.75, 7.00, 7.25, 7.50, 7.75, 8.00, 8.25, 8.50, 8.75, 9.00, 9.25, 9.50, 9.75, 10.00, 10.25, 10.50, 10.75, 11.00, 11.25, 11.50, 11.75, 12.00];

const entrySchema = z.object({
  project_id: z.number({ required_error: "Project required" }),
  activity_id: z.number({ required_error: "Activity required" }),
  hours_worked: z.number().min(0.25).max(12),
  description: z.string().optional(),
  is_billable: z.boolean().optional(),
});

type EntryForm = z.infer<typeof entrySchema>;

export function TimesheetEntryPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimesheetEntry | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["timesheet-daily", selectedDate],
    queryFn: () => timesheetsService.dailyEntries(selectedDate),
  });

  const { data: projects = [] } = useQuery({ queryKey: ["projects-dropdown"], queryFn: projectsService.dropdown });
  const { data: activities = [] } = useQuery({ queryKey: ["activities-active"], queryFn: activitiesService.active });

  const addMutation = useMutation({
    mutationFn: (d: EntryForm) => timesheetsService.addEntry({ ...d, work_date: selectedDate }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timesheet-daily"] }); setAddOpen(false); toast.success("Entry added"); },
    onError: (e: any) => toast.error("Failed", e?.response?.data?.detail),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: Partial<EntryForm> }) => timesheetsService.updateEntry(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timesheet-daily"] }); setEditEntry(null); toast.success("Entry updated"); },
    onError: (e: any) => toast.error("Failed", e?.response?.data?.detail),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => timesheetsService.deleteEntry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timesheet-daily"] }); toast.success("Entry deleted"); },
    onError: (e: any) => toast.error("Failed", e?.response?.data?.detail),
  });

  const copyMutation = useMutation({
    mutationFn: (toDate: string) => timesheetsService.copyDay({ from_date: selectedDate, to_date: toDate }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timesheet-daily"] }); setCopyOpen(false); toast.success("Entries copied!"); },
    onError: (e: any) => toast.error("Failed", e?.response?.data?.detail),
  });

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours_worked), 0);
  const maxHours = 12;

  const changeDate = (days: number) => {
    const d = parseISO(selectedDate);
    const newDate = format(days > 0 ? new Date(d.getTime() + days * 86400000) : new Date(d.getTime() + days * 86400000), "yyyy-MM-dd");
    if (newDate <= format(new Date(), "yyyy-MM-dd")) setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Log Time</h1>
          <p className="text-text-secondary text-sm mt-0.5">Record your daily work hours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCopyOpen(true)} disabled={entries.length === 0}>
            <Copy className="h-4 w-4" /> Copy Day
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Date selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button size="icon" variant="outline" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-text-primary">{format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}</p>
              <p className="text-xs text-text-secondary mt-0.5">{format(parseISO(selectedDate), "yyyy-MM-dd")}</p>
            </div>
            <Button size="icon" variant="outline" onClick={() => changeDate(1)} disabled={selectedDate >= format(new Date(), "yyyy-MM-dd")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Input type="date" value={selectedDate} onChange={(e) => e.target.value <= format(new Date(), "yyyy-MM-dd") && setSelectedDate(e.target.value)} className="w-44" max={format(new Date(), "yyyy-MM-dd")} />
          </div>

          {/* Hours bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-text-secondary">Daily Progress</span>
              <span className="text-sm font-bold text-text-primary">{totalHours.toFixed(2)}h / {maxHours}h</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((totalHours / maxHours) * 100, 100)}%`,
                  background: totalHours >= maxHours ? "#EF4444" : totalHours >= 8 ? "#00A86B" : "#0F4C81",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Time Entries
          </CardTitle>
          <Badge variant="outline">{entries.length} entries</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-text-secondary text-sm">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-text-secondary font-medium">No entries for this day</p>
              <p className="text-text-secondary text-sm mt-1">Click "Add Entry" to log your time</p>
            </div>
          ) : (
            <div className="divide-y divide-border-color">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 px-6 py-4 hover:bg-light-bg transition-colors group">
                  <div className="w-16 h-16 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">{Number(entry.hours_worked).toFixed(2)}</span>
                    <span className="text-[10px] text-text-secondary font-medium">hrs</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-text-primary">{entry.project_name}</span>
                      <span className="text-text-secondary">·</span>
                      <span className="text-sm text-text-secondary">{entry.activity_name}</span>
                      <Badge variant={entry.is_billable ? "success" : "outline"} className="text-[10px] py-0">
                        {entry.is_billable ? "Billable" : "Non-billable"}
                      </Badge>
                    </div>
                    {entry.description && <p className="text-xs text-text-secondary mt-1 truncate">{entry.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" onClick={() => setEditEntry(entry)} title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete this entry?")) deleteMutation.mutate(entry.id); }} title="Delete">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <EntryDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(d) => addMutation.mutate(d)}
        loading={addMutation.isPending}
        title="Add Time Entry"
        projects={projects}
        activities={activities}
      />

      {/* Edit Entry Dialog */}
      {editEntry && (
        <EntryDialog
          open={!!editEntry}
          onClose={() => setEditEntry(null)}
          onSubmit={(d) => updateMutation.mutate({ id: editEntry.id, d })}
          loading={updateMutation.isPending}
          title="Edit Time Entry"
          projects={projects}
          activities={activities}
          defaultValues={{ ...editEntry, project_id: editEntry.project_id, activity_id: editEntry.activity_id, hours_worked: Number(editEntry.hours_worked), is_billable: editEntry.is_billable }}
        />
      )}

      {/* Copy Day Dialog */}
      <CopyDayDialog
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        fromDate={selectedDate}
        onCopy={(toDate) => copyMutation.mutate(toDate)}
        loading={copyMutation.isPending}
      />
    </div>
  );
}

function EntryDialog({ open, onClose, onSubmit, loading, title, projects, activities, defaultValues }: any) {
  const { register, handleSubmit, control, reset } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: defaultValues || { hours_worked: 1.0, is_billable: true },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Project *</Label>
            <Controller name="project_id" control={control} render={({ field }) => (
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.project_name} ({p.project_code})</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>Activity Type *</Label>
            <Controller name="activity_id" control={control} render={({ field }) => (
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                <SelectContent>
                  {activities.map((a: any) => <SelectItem key={a.id} value={a.id.toString()}>{a.activity_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>Hours Worked *</Label>
            <Controller name="hours_worked" control={control} render={({ field }) => (
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(parseFloat(v))}>
                <SelectTrigger><SelectValue placeholder="Select hours" /></SelectTrigger>
                <SelectContent className="max-h-52">
                  {HOUR_OPTIONS.map((h) => <SelectItem key={h} value={h.toString()}>{h.toFixed(2)} hrs</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>Billable</Label>
            <Controller name="is_billable" control={control} render={({ field }) => (
              <Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Billable</SelectItem>
                  <SelectItem value="false">Non-billable</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea className="w-full border border-border-color rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="What did you work on?" {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CopyDayDialog({ open, onClose, fromDate, onCopy, loading }: any) {
  const tomorrow = format(new Date(parseISO(fromDate).getTime() + 86400000), "yyyy-MM-dd");
  const [toDate, setToDate] = useState(tomorrow);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Copy Day Entries</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Copy all entries from <strong>{format(parseISO(fromDate), "MMM d")}</strong> to another date.
          </p>
          <div className="space-y-1.5">
            <Label>Copy to Date</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} max={format(new Date(), "yyyy-MM-dd")} min={fromDate} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={() => onCopy(toDate)}>
            <Copy className="h-4 w-4" /> Copy Entries
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

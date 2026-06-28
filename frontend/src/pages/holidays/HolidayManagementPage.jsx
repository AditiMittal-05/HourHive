import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarDays, Plus, Trash2, Upload, FileText, ExternalLink,
  ChevronLeft, ChevronRight, AlertCircle, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import { useToast } from "@/hooks/use-toast";
import { holidayService } from "@/services/holiday.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  name: z.string().min(2, "Holiday name must be at least 2 characters"),
});

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HolidayManagementPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["holidays", selectedYear],
    queryFn: () => holidayService.list(selectedYear),
    staleTime: 1000 * 60 * 5,
  });

  const holidays = data?.items || [];
  const pdfUrl = data?.pdf_url || null;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const addMutation = useMutation({
    mutationFn: (body) => holidayService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays", selectedYear] });
      toast.success("Holiday added", "The holiday has been added to the calendar.");
      reset();
      setShowAddForm(false);
    },
    onError: (err) => {
      toast.error("Failed to add holiday", err?.response?.data?.detail || "Something went wrong");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => holidayService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays", selectedYear] });
      toast.success("Holiday removed", "The holiday has been deleted.");
    },
    onError: () => toast.error("Failed to delete holiday"),
  });

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await holidayService.uploadPdf(selectedYear, file);
      qc.invalidateQueries({ queryKey: ["holidays", selectedYear] });
      toast.success("PDF uploaded", `Holiday PDF for ${selectedYear} has been uploaded.`);
    } catch {
      toast.error("Upload failed", "Could not upload the PDF. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Holiday Management
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage company holidays. Employees cannot log timesheets on holidays or weekends.
          </p>
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Holiday
        </Button>
      </div>

      {/* Year Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedYear((y) => y - 1)}
          className="p-1.5 rounded-lg border border-border-color hover:bg-light-bg text-text-secondary hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                selectedYear === y
                  ? "text-white"
                  : "text-text-secondary hover:bg-light-bg border border-border-color"
              )}
              style={selectedYear === y ? { background: "linear-gradient(135deg, #2563EB, #10B981)" } : undefined}
            >
              {y}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSelectedYear((y) => y + 1)}
          className="p-1.5 rounded-lg border border-border-color hover:bg-light-bg text-text-secondary hover:text-primary transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-text-secondary ml-1" />}
      </div>

      {/* Add Holiday Form */}
      {showAddForm && (
        <div className="bg-white border border-border-color rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary mb-4">Add Holiday for {selectedYear}</h3>
          <form
            onSubmit={handleSubmit((d) => addMutation.mutate(d))}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date</Label>
              <Input
                type="date"
                min={`${selectedYear}-01-01`}
                max={`${selectedYear}-12-31`}
                defaultValue={`${selectedYear}-01-01`}
                {...register("date")}
                className="h-9 text-sm"
              />
              {errors.date && (
                <p className="text-xs text-danger">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Holiday Name</Label>
              <Input
                placeholder="e.g. Diwali"
                {...register("name")}
                className="h-9 text-sm"
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={addMutation.isPending} className="h-9 text-sm flex-1">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 text-sm"
                onClick={() => { setShowAddForm(false); reset(); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holiday List */}
        <div className="lg:col-span-2 bg-white border border-border-color rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border-color flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              Holidays for {selectedYear}
            </h3>
            <span className="text-xs text-text-secondary font-medium bg-light-bg px-2.5 py-1 rounded-full">
              {holidays.length} holidays
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
            </div>
          ) : holidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
              <CalendarDays className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No holidays added for {selectedYear}</p>
              <p className="text-xs mt-1 opacity-70">Click "Add Holiday" to add one.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-color">
              {holidays.map((holiday) => {
                const d = new Date(holiday.date + "T00:00:00");
                const dayName = WEEKDAY[d.getDay()];
                const isWeekendDay = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div key={holiday.id} className="flex items-center px-5 py-3.5 gap-4 hover:bg-light-bg/50 group">
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}>
                      <span className="text-lg font-black leading-none">{format(d, "d")}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{format(d, "MMM")}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{holiday.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {dayName}
                        {isWeekendDay && (
                          <span className="ml-1.5 text-danger text-[10px] font-semibold bg-danger/10 px-1.5 py-0.5 rounded-full">
                            Weekend
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={() => deleteMutation.mutate(holiday.id)}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/8 transition-all"
                      title="Remove holiday"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PDF Upload Panel */}
        <div className="bg-white border border-border-color rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-border-color">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Holiday PDF Reference
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Upload the official holiday list PDF for {selectedYear} as a reference document.
            </p>
          </div>

          <div className="p-5 space-y-4">
            {/* Current PDF status */}
            {pdfUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-800">PDF uploaded for {selectedYear}</p>
                  <p className="text-[11px] text-green-600 mt-0.5">Click to view the document</p>
                </div>
                <a
                  href={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors flex-shrink-0"
                  title="View PDF"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-light-bg border border-border-color rounded-lg">
                <AlertCircle className="h-5 w-5 text-text-secondary flex-shrink-0" />
                <p className="text-xs text-text-secondary">No PDF uploaded for {selectedYear} yet.</p>
              </div>
            )}

            {/* Upload drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-color rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-primary-50/30 transition-all group"
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-text-secondary group-hover:text-primary transition-colors" />
              )}
              <p className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors text-center">
                {uploading ? "Uploading…" : pdfUrl ? `Replace ${selectedYear} PDF` : `Upload ${selectedYear} Holiday PDF`}
              </p>
              <p className="text-[11px] text-text-secondary/60 text-center">PDF only · Max 10 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />

            {/* Note */}
            <p className="text-[11px] text-text-secondary/70 leading-relaxed">
              The PDF is stored as a reference only. Holidays must be added individually using the form on the left so they appear in the calendar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, UserCheck, UserX, Edit, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";
import { SkeletonTable } from "@/components/shared/PageLoader";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", search, statusFilter, page],
    queryFn: () => usersService.list({
      search,
      status: statusFilter || undefined,
      page,
      page_size: 15,
    }),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (d) => usersService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setCreateOpen(false); toast.success("User created"); },
    onError: (e) => toast.error("Failed", e?.response?.data?.detail),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }) => usersService.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setEditUser(null); toast.success("User updated"); },
    onError: (e) => toast.error("Failed", e?.response?.data?.detail),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, active }) =>
      active ? usersService.activate(id) : usersService.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Status updated"); },
    onError: (e) => toast.error("Failed", e?.response?.data?.detail || "Cannot modify this user"),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">User Management</h1>
          <p className="text-text-secondary text-sm mt-0.5">Create and manage employee accounts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
                    {["Code", "Name", "Email", "Department", "Manager", "Status", "Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(!data?.items || data.items.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-light-bg flex items-center justify-center">
                            <Search className="h-5 w-5 text-text-secondary/40" />
                          </div>
                          <p className="text-text-secondary font-medium">No users found</p>
                          <p className="text-text-secondary text-sm">Add users to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : data.items.map((user) => {
                    const isProtected = user.role === "super_admin";
                    return (
                      <tr key={user.id}>
                        <td className="text-sm font-mono text-text-secondary">{user.employee_code}</td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{
                                background: isProtected
                                  ? "linear-gradient(135deg, #D97706, #B45309)"
                                  : "linear-gradient(135deg, #0B2E59, #123D72)"
                              }}
                            >
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                                {user.full_name}
                                {isProtected && <Shield className="h-3.5 w-3.5" style={{ color: "#D97706" }} />}
                                {user.can_approve_timesheets && !isProtected && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(167,206,57,0.15)", color: "#527A0F" }}>
                                    Approver
                                  </span>
                                )}
                              </p>
                              {user.designation && (
                                <p className="text-xs text-text-secondary">{user.designation}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-text-secondary">{user.email}</td>
                        <td className="text-sm text-text-secondary">{user.department || <span className="text-text-secondary/40">—</span>}</td>
                        <td className="text-sm text-text-secondary">{user.manager_name || <span className="text-text-secondary/40">—</span>}</td>
                        <td>
                          <Badge variant={user.status === "active" ? "success" : "destructive"} className="capitalize">
                            {user.status}
                          </Badge>
                        </td>
                        <td>
                          {isProtected ? (
                            <span className="text-xs text-text-secondary/50 px-1">Protected</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon" variant="ghost" className="h-8 w-8"
                                onClick={() => setEditUser(user)} title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon" variant="ghost" className="h-8 w-8"
                                onClick={() => toggleStatus.mutate({ id: user.id, active: user.status === "inactive" })}
                                title={user.status === "active" ? "Deactivate" : "Activate"}
                              >
                                {user.status === "active"
                                  ? <UserX className="h-3.5 w-3.5 text-danger" />
                                  : <UserCheck className="h-3.5 w-3.5 text-emerald-600" />}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {data && data.total > 15 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border-color">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-semibold text-text-primary">{(page - 1) * 15 + 1}–{Math.min(page * 15, data.total)}</span> of{" "}
                    <span className="font-semibold text-text-primary">{data.total}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <Button size="sm" variant="outline" disabled={page * 15 >= data.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <UserFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(d) => createMutation.mutate(d)}
        loading={createMutation.isPending}
        title="Create New User"
      />

      {/* Edit Dialog */}
      {editUser && (
        <UserFormDialog
          open={!!editUser}
          onClose={() => setEditUser(null)}
          onSubmit={(d) => updateMutation.mutate({ id: editUser.id, d })}
          loading={updateMutation.isPending}
          title="Edit User"
          defaultValues={editUser}
          isEdit
        />
      )}
    </div>
  );
}

const createSchema = z.object({
  employee_code: z.string().min(1),
  full_name: z.string().min(2),
  email: z.string().email(),
  department: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
});

const editSchema = createSchema.partial().extend({
  status: z.enum(["active", "inactive"]).optional(),
});

function UserFormDialog({ open, onClose, onSubmit, loading, title, defaultValues, isEdit = false }) {
  const schema = isEdit ? editSchema : createSchema;
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {},
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Employee Code *</Label>
                <Input placeholder="EMP001" {...register("employee_code")} />
                {errors.employee_code && <p className="text-xs text-danger">{String(errors.employee_code.message)}</p>}
              </div>
            )}
            <div className={isEdit ? "col-span-2" : ""}>
              <Label className="text-sm font-semibold">Full Name *</Label>
              <Input placeholder="John Doe" className="mt-1.5" {...register("full_name")} />
              {errors.full_name && <p className="text-xs text-danger mt-1">{String(errors.full_name.message)}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Email *</Label>
            <Input type="email" placeholder="john@gnxtsystems.com" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{String(errors.email.message)}</p>}
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Department</Label>
              <Input placeholder="Engineering" {...register("department")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Designation</Label>
              <Input placeholder="Developer" {...register("designation")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Phone</Label>
            <Input placeholder="+91 98765 43210" {...register("phone")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

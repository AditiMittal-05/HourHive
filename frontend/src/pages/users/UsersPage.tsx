import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, UserCheck, UserX, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";
import { SkeletonTable } from "@/components/shared/PageLoader";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User, UserCreate, UserUpdate } from "@/types";

const createSchema = z.object({
  employee_code: z.string().min(1),
  full_name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["employee", "admin"]),
  department: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({ status: z.enum(["active", "inactive"]).optional() });

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", search, roleFilter, statusFilter, page],
    queryFn: () => usersService.list({ search, role: roleFilter || undefined, status: statusFilter || undefined, page, page_size: 15 }),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (d: UserCreate) => usersService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setCreateOpen(false); toast.success("User created"); },
    onError: (e: any) => toast.error("Failed", e?.response?.data?.detail),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: UserUpdate }) => usersService.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setEditUser(null); toast.success("User updated"); },
    onError: (e: any) => toast.error("Failed", e?.response?.data?.detail),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? usersService.activate(id) : usersService.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Status updated"); },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary text-sm mt-0.5">Manage team members and permissions</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
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
          {isLoading ? <div className="p-6"><SkeletonTable /></div> : (
            <>
              <table className="w-full">
                <thead className="bg-light-bg border-b border-border-color">
                  <tr>
                    {["Code", "Name", "Email", "Department", "Role", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-text-secondary px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {data?.items.map((user) => (
                    <tr key={user.id} className="hover:bg-light-bg transition-colors">
                      <td className="px-5 py-3 text-sm font-mono text-text-secondary">{user.employee_code}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {user.full_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-text-primary">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{user.email}</td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{user.department || "—"}</td>
                      <td className="px-5 py-3">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">{user.role}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={user.status === "active" ? "success" : "destructive"} className="capitalize">{user.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setEditUser(user)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleStatus.mutate({ id: user.id, active: user.status === "inactive" })}
                            title={user.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {user.status === "active" ? <UserX className="h-4 w-4 text-danger" /> : <UserCheck className="h-4 w-4 text-success" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data && data.total > 15 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border-color">
                  <p className="text-sm text-text-secondary">
                    Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, data.total)} of {data.total}
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
        onSubmit={(d) => createMutation.mutate(d as UserCreate)}
        loading={createMutation.isPending}
        title="Create New User"
      />

      {/* Edit Dialog */}
      {editUser && (
        <UserFormDialog
          open={!!editUser}
          onClose={() => setEditUser(null)}
          onSubmit={(d) => updateMutation.mutate({ id: editUser.id, d: d as UserUpdate })}
          loading={updateMutation.isPending}
          title="Edit User"
          defaultValues={editUser}
          isEdit
        />
      )}
    </div>
  );
}

function UserFormDialog({ open, onClose, onSubmit, loading, title, defaultValues, isEdit = false }: {
  open: boolean; onClose: () => void; onSubmit: (data: any) => void;
  loading: boolean; title: string; defaultValues?: Partial<User>; isEdit?: boolean;
}) {
  const schema = isEdit ? updateSchema : createSchema;
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { role: "employee" },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div className="space-y-1.5">
                <Label>Employee Code *</Label>
                <Input placeholder="EMP001" {...register("employee_code")} />
                {errors.employee_code && <p className="text-xs text-danger">{String(errors.employee_code.message)}</p>}
              </div>
            )}
            <div className={isEdit ? "col-span-2" : ""} style={{ gridColumn: isEdit ? "1 / -1" : undefined }}>
              <Label>Full Name *</Label>
              <Input placeholder="John Doe" {...register("full_name")} />
              {errors.full_name && <p className="text-xs text-danger">{String(errors.full_name.message)}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" placeholder="john@gnxtsystems.com" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{String(errors.email.message)}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Controller name="role" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            {isEdit && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input placeholder="Engineering" {...register("department")} />
            </div>
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Input placeholder="Developer" {...register("designation")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input placeholder="+91 98765 43210" {...register("phone")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{isEdit ? "Save Changes" : "Create User"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Key } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  old_password: z.string().min(1, "Current password required"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
}).refine((d) => d.new_password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export function ChangePasswordPage() {
  const [showPw, setShowPw] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) => authService.changePassword(data.old_password, data.new_password),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      reset();
    },
    onError: (err) => {
      toast.error("Failed to change password", err?.response?.data?.detail || "Something went wrong");
    },
  });

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Change Password</h1>
        <p className="text-text-secondary text-sm mt-1">Update your account password</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" /> Security Settings
          </CardTitle>
          <CardDescription>Enter your current password and choose a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} placeholder="Your current password" className="pr-10" {...register("old_password")} />
                <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.old_password && <p className="text-xs text-danger">{errors.old_password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type={showPw ? "text" : "password"} placeholder="Min. 8 characters" {...register("new_password")} />
              {errors.new_password && <p className="text-xs text-danger">{errors.new_password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type={showPw ? "text" : "password"} placeholder="Repeat new password" {...register("confirm")} />
              {errors.confirm && <p className="text-xs text-danger">{errors.confirm.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={mutation.isPending}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
}).refine((d) => d.new_password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) => authService.resetPassword(token, data.new_password),
    onSuccess: () => {
      toast.success("Password reset!", "You can now sign in with your new password.");
      navigate("/login");
    },
    onError: (err) => {
      toast.error("Reset failed", err?.response?.data?.detail || "Invalid or expired token");
    },
  });

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Set New Password</h2>
      <p className="text-text-secondary text-sm mb-6">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <div className="space-y-1.5">
          <Label>New Password</Label>
          <div className="relative">
            <Input type={showPw ? "text" : "password"} placeholder="Min. 8 characters" className="pr-10" {...register("new_password")} />
            <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.new_password && <p className="text-xs text-danger">{errors.new_password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Confirm Password</Label>
          <Input type={showPw ? "text" : "password"} placeholder="Repeat password" {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-danger">{errors.confirm.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          <CheckCircle className="h-4 w-4" /> Reset Password
        </Button>
      </form>
    </div>
  );
}

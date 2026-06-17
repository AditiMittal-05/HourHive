import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const tokens = await authService.login(data);
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const user = await authService.me();
      return { tokens, user };
    },
    onSuccess: ({ tokens, user }) => {
      setAuth(user, tokens.access_token, tokens.refresh_token);
      toast.success("Welcome back!", `Logged in as ${user.full_name}`);
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast.error("Login failed", err?.response?.data?.detail || "Invalid credentials");
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Sign In</h2>
        <p className="text-text-secondary text-sm mt-1">Enter your credentials to access HourHive</p>
      </div>

      <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              id="email"
              type="email"
              placeholder="you@gnxtsystems.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loginMutation.isPending}>
          <LogIn className="h-4 w-4" />
          Sign In to HourHive
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border-color text-center space-y-2">
        <p className="text-sm text-text-secondary">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
        <p className="text-xs text-text-secondary">
          Having trouble? Contact{" "}
          <a href="mailto:admin@gnxtsystems.com" className="text-primary hover:underline font-medium">
            your administrator
          </a>
        </p>
      </div>
    </div>
  );
}

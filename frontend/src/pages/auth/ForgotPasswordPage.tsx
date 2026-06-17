import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authService.forgotPassword(data.email),
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Check your email</h2>
        <p className="text-text-secondary text-sm mb-6">
          If an account exists with that email, we've sent a password reset link.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
      <h2 className="text-2xl font-bold text-text-primary mb-1">Forgot Password?</h2>
      <p className="text-text-secondary text-sm mb-6">Enter your email and we'll send a reset link.</p>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input id="email" type="email" placeholder="you@gnxtsystems.com" className="pl-10" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}

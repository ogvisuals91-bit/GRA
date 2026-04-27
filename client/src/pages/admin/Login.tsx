import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema } from "@shared/schema";
import type { AdminLogin } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminLogin() {
  const { login, isLoggingIn, loginError, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.loggedIn) {
      setLocation("/admin/dashboard");
    }
  }, [user, setLocation]);

  const form = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: AdminLogin) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-sm">Restricted Access Only</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input 
              {...form.register("email")} 
              type="email"
              className="bg-black/50 border-white/10" 
              placeholder="admin@ghostawards.com"
            />
            {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input 
              {...form.register("password")} 
              type="password"
              className="bg-black/50 border-white/10" 
              placeholder="••••••••"
            />
            {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
          </div>

          {loginError && <p className="text-red-500 text-sm text-center">{loginError.message}</p>}

          <Button 
            type="submit" 
            className="w-full bg-primary text-white hover:bg-white hover:text-primary font-bold"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate"}
          </Button>
        </form>
      </div>
    </div>
  );
}

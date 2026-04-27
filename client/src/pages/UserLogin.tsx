import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useToast } from "@/hooks/use-toast";
import { Trophy, User, Lock, ArrowRight } from "lucide-react";

const schema = z.object({
  emailOrUsername: z.string().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

type FormData = z.infer<typeof schema>;

export default function UserLogin() {
  const [, navigate] = useLocation();
  const { loginMutation } = useUserAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { emailOrUsername: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    try {
      await loginMutation.mutateAsync(data);
      toast({ title: "Welcome back!", description: "You're now signed in" });
      navigate("/tickets");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Check your details and try again", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Sign In</h1>
          <p className="text-muted-foreground mt-2">Access your Ghost Awards account</p>
        </div>

        <div className="bg-card/60 border border-border/40 rounded-2xl p-6 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="emailOrUsername" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Email or Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input data-testid="input-email-or-username" placeholder="email@gmail.com or username" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input data-testid="input-password" type="password" placeholder="Your password" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button data-testid="button-login" type="submit" className="w-full h-12 text-base font-bold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
                {!loginMutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline" data-testid="link-signup">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

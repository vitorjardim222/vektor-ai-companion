import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — VEKTOR A.I" },
      { name: "description", content: "Start your VEKTOR A.I workspace in minutes." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="relative grid min-h-screen overflow-hidden lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <BrandLogo />
        <div className="space-y-4">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Launch your <span className="brand-gradient-text">AI workspace</span> in minutes.
          </h2>
          <p className="max-w-md text-muted-foreground">
            14-day free trial. No credit card required. Multi-tenant from day one.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} VEKTOR A.I</p>
      </div>

      <div className="relative flex items-center justify-center p-6">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><BrandLogo /></div>
          <div className="rounded-2xl border border-border glass-panel p-8 shadow-[var(--shadow-elevated)]">
            <h1 className="font-display text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start your 14-day free trial.</p>

            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Ada Lovelace" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="At least 8 characters" />
              </div>
              <Button asChild className="w-full bg-[var(--gradient-brand)] text-primary-foreground hover:opacity-90">
                <Link to="/dashboard">Create workspace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

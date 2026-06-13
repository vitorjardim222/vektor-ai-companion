import { Link } from "@tanstack/react-router";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex min-w-0 items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 shrink-0">
        <div className="absolute inset-0 rounded-lg bg-[var(--gradient-brand)] blur-md opacity-60" />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gradient-brand)] font-display text-sm font-bold text-primary-foreground">
          V
        </div>
      </div>
      <span className="truncate font-display text-base font-bold tracking-tight group-data-[collapsible=icon]:hidden">
        VEKTOR <span className="brand-gradient-text">A.I</span>
      </span>
    </Link>
  );
}

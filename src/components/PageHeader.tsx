import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-teal-deep pt-32 pb-16 text-center text-white plus-pattern-dark">
      <div className="absolute -top-24 right-1/4 size-72 rounded-full bg-teal/40 blur-[100px]" />
      <div className="absolute -bottom-24 left-1/4 size-72 rounded-full bg-gold/20 blur-[100px]" />
      <div className="relative mx-auto max-w-3xl px-4">
        <h1 className="font-display text-4xl font-black sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 leading-8 text-cream/70">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}

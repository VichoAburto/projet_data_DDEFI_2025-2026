import React from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700 mb-3">
          {eyebrow}
        </p>
      )}

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
        {title}
      </h1>

      {description && (
        <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
          {description}
        </p>
      )}

      {actions && <div className="mt-6">{actions}</div>}
    </div>
  );
}
import React from 'react';

export default function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-12">
      <div className="mx-auto w-full max-w-3xl bg-white text-neutral-900">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center mb-6">{title}</h1>
        <div className="prose prose-neutral max-w-none mx-auto text-[17px] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

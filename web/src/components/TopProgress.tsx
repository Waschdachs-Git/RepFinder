"use client";
import { createPortal } from 'react-dom';

export default function TopProgress({ active }: { active: boolean }) {
  if (!active) return null;
  const bar = (
    <div className="fixed top-0 left-0 right-0 z-[80]">
      <div className="h-0.5 w-full bg-[hsl(var(--accent)/0.2)]">
        <div className="h-full w-1/3 bg-[hsl(var(--accent))] animate-pulse" />
      </div>
    </div>
  );
  return typeof window !== 'undefined' ? createPortal(bar, document.body) : null;
}

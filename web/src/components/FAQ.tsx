"use client";

import Link from 'next/link';
import { useAgent } from '@/providers/AgentProvider';
import { SHOPS } from '@/lib/data';

type FAQItem = { icon: string; title: string; desc: React.ReactNode };

export default function FAQ() {
  const { agent } = useAgent();
  const shop = SHOPS[agent];

  const agentNames = Object.values(SHOPS)
    .map((s) => s.name)
    .join(', ');

  const items: FAQItem[] = [
    {
      icon: '🔎',
      title: 'What is RepFinder?',
      desc:
        'RepFinder is a simple product search across multiple shopping agents. You pick an agent and browse items with clear info and links.',
    },
    {
      icon: '⚡',
      title: 'Why is it better than a spreadsheet?',
      desc:
        'Spreadsheets get outdated and hard to navigate. RepFinder stays organized, updates faster, and lets you filter by categories and agents.',
    },
    {
      icon: '�',
      title: 'Which agents are supported?',
      desc: `Currently supported: ${agentNames}. We may add more over time.`,
    },
    {
      icon: '✉️',
      title: 'How can I contact support or send feedback?',
      desc: (
        <span>
          Tell us what you need or suggest a feature anytime. Go to{' '}
          <Link href="/contact" className="underline hover:no-underline">
            the contact page
          </Link>{' '}
          and send a short message.
        </span>
      ),
    },
  ];

  return (
    <section className="my-12 anim-fade-up">
      <h2 className="text-3xl font-semibold tracking-tight text-center mb-6">Frequently asked questions</h2>
      <div className="max-w-3xl mx-auto space-y-2">
        {items.map((it) => (
          <details
            key={it.title}
            className="group rounded-xl border border-neutral-200 bg-white transition-colors group-open:bg-neutral-50"
          >
            <summary className="list-none cursor-pointer flex items-center justify-between gap-3 px-4 py-3">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="text-lg">{it.icon}</span>
                <span className="text-base font-medium">{it.title}</span>
              </span>
              <span className="text-neutral-400 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-neutral-600 leading-relaxed">{it.desc}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

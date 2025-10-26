import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — RepFinder',
  description: 'Ask a question or send feedback about RepFinder. We read every message.',
  robots: { index: true, follow: true },
};

export default function Contact() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-semibold mb-2">Contact</h1>
      <p className="text-neutral-600 mb-6">
        Have a question or a feature idea? Send us a short note and we will get back to you.
      </p>

      <ContactForm />
    </div>
  );
}

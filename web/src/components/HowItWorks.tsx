export default function HowItWorks() {
  const steps = [
    { title: '1. Pick your agent', desc: 'Choose your preferred purchasing agent for tailored results.' },
    { title: '2. Find items fast', desc: 'Browse or search the catalog and view detailed product cards.' },
    { title: '3. Buy on the agent', desc: 'Click the link to finish checkout safely on the agent site.' },
  ];
  return (
  <section className="my-12 anim-fade-up">
      <h2 className="text-2xl font-semibold mb-4 text-center">How it works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.title} className="rounded-2xl border border-neutral-200 bg-white p-5 text-center u-hover-lift">
            <h3 className="font-medium mb-1">{s.title}</h3>
            <p className="text-neutral-600 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

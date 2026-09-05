import { SectionHeading } from "@/components/marketing/section-heading";

const PROBLEMS = [
  "Feedback gets scattered across email, chat, tickets and spreadsheets.",
  "The most popular request isn't always the right one to build.",
  "Teams struggle to tell real demand from a loud minority.",
  "People who ask for something rarely find out what happened to it.",
];

export function ProblemSection() {
  return (
    <section className="border-t py-16 sm:py-20">
      <SectionHeading
        eyebrow="The problem"
        title="Collecting feedback is easy. Doing something useful with it isn't."
      />
      <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {PROBLEMS.map((problem) => (
          <li
            key={problem}
            className="border-border bg-card rounded-xl border p-5 text-sm"
          >
            {problem}
          </li>
        ))}
      </ul>
    </section>
  );
}

import { Shuffle, TrendingUp, Megaphone, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const PROBLEMS: { icon: LucideIcon; text: string }[] = [
  {
    icon: Shuffle,
    text: "Feedback gets scattered across email, chat, tickets and spreadsheets.",
  },
  {
    icon: TrendingUp,
    text: "The most popular request isn't always the right one to build.",
  },
  {
    icon: Megaphone,
    text: "Teams struggle to tell real demand from a loud minority.",
  },
  {
    icon: HelpCircle,
    text: "People who ask for something rarely find out what happened to it.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-secondary border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="The problem"
          title="Collecting feedback is easy. Doing something useful with it isn't."
        />
        <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {PROBLEMS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="border-border bg-card flex items-start gap-4 rounded-xl border p-5"
            >
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <p className="text-sm leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

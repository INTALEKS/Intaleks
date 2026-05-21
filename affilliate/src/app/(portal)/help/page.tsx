"use client";

import Link from "next/link";

import { Panel } from "@/components/affiliate/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useFaq } from "@/hooks/use-affiliate-data";

export default function HelpPage() {
  const { data } = useFaq();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Panel title="Email support">
          <p className="text-sm text-[var(--affiliate-muted)]">Reach our team for account queries.</p>
          <p className="mt-2 text-sm text-[var(--affiliate-blue)]">affiliates@intaleks.com</p>
        </Panel>
        <Panel title="Live chat">
          <p className="text-sm text-[var(--affiliate-muted)]">Chat during AEST business hours.</p>
          <Link href="/chat" className="mt-2 inline-block text-sm text-[var(--affiliate-blue)]">Open chat</Link>
        </Panel>
        <Panel title="Affiliate guide">
          <p className="text-sm text-[var(--affiliate-muted)]">Full docs on maximizing affiliate earnings.</p>
          <Button variant="outline" className="mt-3">View guide</Button>
        </Panel>
      </div>

      <Panel title="Frequently asked questions">
        <Accordion className="w-full">
          {data?.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Panel>
    </div>
  );
}

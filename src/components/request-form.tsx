"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMAIL = "jasper.mceligott@gmail.com";

const EMAIL_TEMPLATE = `hi jasper,

i'd love to see an icon for:
[describe what you want]

thanks!`;

interface RequestFormProps {
  heading?: string;
  subheading?: string;
}

export function RequestForm({
  heading = "send an email",
  subheading = "request an icon or just say hi",
}: RequestFormProps) {
  const [subject, setSubject] = useState("icon request");
  const [message, setMessage] = useState(EMAIL_TEMPLATE);

  const canSubmit = message.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const subj = subject.trim() || "icon request";
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(message.trim())}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
        <p className="text-[12px] text-muted-foreground">
          {subheading}
        </p>
      </div>

      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="subject (optional)"
        className="h-11 w-full rounded-lg border border-border bg-sidebar px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors duration-[180ms] focus:border-foreground/30"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        required
        className="scrollbar-custom w-full resize-none rounded-lg border border-border bg-sidebar px-3 py-2.5 text-[13px] leading-[1.55] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors duration-[180ms] focus:border-foreground/30"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        leadingIcon={Send}
        disabled={!canSubmit}
        className="h-11 w-full px-5 text-[14px]"
      >
        send an email
      </Button>
    </form>
  );
}

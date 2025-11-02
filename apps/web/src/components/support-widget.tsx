import { useMemo, useState } from "react";

import { trackConversion } from "../lib/analytics";

type SupportChannel = {
  label: string;
  description: string;
  href: string;
};

const supportChannels: SupportChannel[] = [
  {
    label: "FAQ",
    description: "Most common questions and quick answers",
    href: "https://help.vivaform.app/faq"
  },
  {
    label: "Chat on Telegram",
    description: "@vivaform_support",
    href: "https://t.me/vivaform_support"
  },
  {
    label: "Email",
    description: "hello@vivaform.app",
    href: "mailto:hello@vivaform.app"
  }
];

export const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    setIsOpen((prev) => !prev);
    trackConversion("support_widget_toggle", { open: !isOpen });
  };

  const channels = useMemo(() => supportChannels, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="mb-3 w-72 max-w-sm rounded-3xl border border-border/70 bg-background p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Need a hand?</p>
              <p className="text-xs text-muted-foreground">The VivaForm team will help you get started and answer questions.</p>
            </div>
            <button
              type="button"
              onClick={toggleWidget}
              className="rounded-full border border-border p-2 text-xs transition hover:bg-muted"
              aria-label="Hide support widget"
            >
              ×
            </button>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {channels.map((channel) => (
              <li key={channel.label}>
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col rounded-2xl border border-border/60 px-3 py-2 transition hover:border-primary hover:text-primary"
                  onClick={() => trackConversion("support_widget_click", { channel: channel.label })}
                >
                  <span className="font-medium">{channel.label}</span>
                  <span className="text-xs text-muted-foreground">{channel.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        onClick={toggleWidget}
        className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:-translate-y-0.5"
        aria-expanded={isOpen}
        aria-label="Open VivaForm support"
      >
        <span role="img" aria-hidden="true">
          💬
        </span>
        Support
      </button>
    </div>
  );
};

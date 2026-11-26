"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const I = {
  overview: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  guests: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.3 0 4 1.4 4.6 4" /></>,
  grid: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>,
  send: <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />,
  ceremonies: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  checklists: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5L7.5 17" /></>,
  expenses: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  family: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  site: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
};

const LINKS: { href: string; label: string; icon: keyof typeof I; exact?: boolean }[] = [
  { href: "/admin", label: "Overview", icon: "overview", exact: true },
  { href: "/admin/guests", label: "Guests & invites", icon: "guests" },
  { href: "/admin/matrix", label: "Who's invited where", icon: "grid" },
  { href: "/admin/send", label: "Send on WhatsApp", icon: "send" },
  { href: "/admin/ceremonies", label: "Ceremonies", icon: "ceremonies" },
  { href: "/admin/checklists", label: "Checklists", icon: "checklists" },
  { href: "/admin/expenses", label: "Expenses", icon: "expenses" },
  { href: "/admin/members", label: "Family", icon: "family" },
];

function Icon({ name }: { name: keyof typeof I }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[name]}</svg>;
}

export default function AdminNav({ title, signOutSlot }: { title: string; signOutSlot: React.ReactNode }) {
  const path = usePathname();
  const active = (l: (typeof LINKS)[number]) => (l.exact ? path === l.href : path === l.href || path.startsWith(l.href + "/"));
  const item = "flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] no-underline transition-colors";
  return (
    <aside className="adm-nav bg-maroon px-[18px] py-7 text-[#EBD9B6] lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-[260px] lg:shrink-0 lg:flex-col lg:gap-1.5 lg:overflow-y-auto">
      <Link href="/admin" className="flex items-center gap-3 px-2.5 pb-6 no-underline">
        <Image src="/images/kalash.webp" alt="" width={40} height={40} />
        <span className="flex flex-col">
          <span className="font-display text-2xl leading-none text-[#FFF7E8]">{title}</span>
          <span className="text-xs text-[#D9BE86]">Family dashboard</span>
        </span>
      </Link>
      <nav aria-label="Admin" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {LINKS.map((l) => {
          const on = active(l);
          return (
            <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined}
              className={`${item} shrink-0 ${on ? "bg-[rgba(243,217,155,.16)] font-semibold text-[#FFF7E8]" : "text-[#EBD9B6] hover:bg-[rgba(243,217,155,.10)] hover:text-[#FFF7E8]"}`}>
              <Icon name={l.icon} />{l.label}
            </Link>
          );
        })}
        <Link href="/" className={`${item} shrink-0 text-[#EBD9B6] hover:bg-[rgba(243,217,155,.10)] hover:text-[#FFF7E8] lg:mt-3`}><Icon name="site" />Wedding site</Link>
      </nav>
      <div className="mt-auto hidden pt-6 lg:block">{signOutSlot}</div>
    </aside>
  );
}

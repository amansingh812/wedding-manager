import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/data/store";
import { isPreviewBot, isRsvpLocked, seenCookie } from "@/lib/rsvp";
import { formatAdLong } from "@/lib/format";
import InviteExperience from "@/components/invite/InviteExperience";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const view = await getStore().getInvite(slug);
  if (!view) return { title: "Invitation" };
  const { wedding, household } = view;
  const title = `Special invitation for ${household.displayName}`;
  const description = `${wedding.title} · ${wedding.mainDateBs} · ${formatAdLong(wedding.mainDate)}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Wedding invitation" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/images/og.jpg"] },
  };
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;
  const store = getStore();
  const ua = (await headers()).get("user-agent");
  if (!isPreviewBot(ua)) await store.markOpened(slug);
  const view = await store.getInvite(slug);
  if (!view) notFound();

  const seenBefore = (await cookies()).has(seenCookie(slug));

  return <InviteExperience initialView={view} locked={isRsvpLocked(view.wedding.rsvpDeadline)} seenBefore={seenBefore} />;
}

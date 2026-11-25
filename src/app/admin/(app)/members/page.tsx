import type { Metadata } from "next";
import { removeInvite, removeMember } from "@/app/admin/actions";
import InviteMemberForm from "@/components/admin/InviteMemberForm";
import { createAuthClient, getMembership } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Family members" };

export default async function MembersPage() {
  const { member } = await getMembership();
  if (!member) return null;
  const isAdmin = member.role === "admin";
  const sb = await createAuthClient();
  const { data: { user } } = await sb.auth.getUser();
  const [{ data: members }, { data: invites }] = await Promise.all([
    sb.from("members").select("user_id, name, role").eq("wedding_id", member.weddingId).order("name"),
    sb.from("member_invites").select("email, name, role").eq("wedding_id", member.weddingId).order("invited_at"),
  ]);

  return (
    <>
      <h1 className="font-display text-4xl text-maroon">Family</h1>
      <p className="mt-1 text-quiet">People who can sign in. Admins can edit ceremonies and add family.</p>

      {isAdmin && <div className="mt-6"><InviteMemberForm /></div>}

      <ul className="mt-6 divide-y divide-sand/70 rounded-2xl border border-sand bg-white">
        {members?.map((m) => (
          <li key={m.user_id} className="flex items-center justify-between px-5 py-3.5">
            <span className="font-semibold text-ink">{m.name}{m.user_id === user?.id && <span className="ml-2 text-xs font-normal text-quiet">(you)</span>}</span>
            <span className="flex items-center gap-3">
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold capitalize text-muted">{m.role}</span>
              {isAdmin && m.user_id !== user?.id && (
                <form action={removeMember}><input type="hidden" name="userId" value={m.user_id} /><button className="text-xs text-sindoor">Remove</button></form>
              )}
            </span>
          </li>
        ))}
        {invites?.map((i) => (
          <li key={i.email} className="flex items-center justify-between px-5 py-3.5">
            <span><span className="font-semibold text-ink">{i.name}</span> <span className="text-sm text-quiet">{i.email}</span></span>
            <span className="flex items-center gap-3">
              <span className="rounded-full border border-dashed border-sand px-2.5 py-0.5 text-xs text-quiet">hasn&apos;t signed in yet</span>
              {isAdmin && (
                <form action={removeInvite}><input type="hidden" name="email" value={i.email} /><button className="text-xs text-sindoor">Remove</button></form>
              )}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

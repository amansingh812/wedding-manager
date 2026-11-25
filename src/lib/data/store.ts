import "server-only";
import type { InviteView, RsvpSubmission } from "@/lib/types";
import { mockStore } from "./mock-store";
import { supabaseStore } from "./supabase-store";

/**
 * Everything the guest invitation needs from storage.
 * Uses Supabase when its env vars are set, otherwise the in-memory demo store.
 */
export interface InviteStore {
  getInvite(slug: string): Promise<InviteView | null>;
  markOpened(slug: string): Promise<void>;
  saveRsvp(slug: string, submission: RsvpSubmission): Promise<InviteView>;
}

export function usingSupabase(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getStore(): InviteStore {
  return usingSupabase() ? supabaseStore : mockStore;
}

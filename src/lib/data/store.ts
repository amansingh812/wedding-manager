import "server-only";
import type { InviteView, RsvpSubmission } from "@/lib/types";
import { mockStore } from "./mock-store";

/**
 * Everything the guest invitation needs from storage.
 * Phase 1 uses the in-memory mock store. Phase 2 adds a Supabase store
 * with the same interface, selected when SUPABASE env vars are present.
 */
export interface InviteStore {
  getInvite(slug: string): Promise<InviteView | null>;
  markOpened(slug: string): Promise<void>;
  saveRsvp(slug: string, submission: RsvpSubmission): Promise<InviteView>;
}

export function getStore(): InviteStore {
  return mockStore;
}

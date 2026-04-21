import type {
  AuthCredentials,
  AuthSession,
  AuthSessionProvider,
} from "../application";
import {
  SupabaseAuthSessionProvider,
  supabaseClient,
  supabaseConfig,
  type WeeknarySupabaseClient,
} from "../infrastructure/supabase";

class UnconfiguredAuthSessionProvider implements AuthSessionProvider {
  async getCurrentSession(): Promise<AuthSession> {
    return {
      status: "unavailable",
      reason: "Supabase is not configured.",
    };
  }

  async signIn(_credentials: AuthCredentials): Promise<AuthSession> {
    return this.getCurrentSession();
  }

  async createAccount(_credentials: AuthCredentials): Promise<AuthSession> {
    return this.getCurrentSession();
  }

  async signOut(): Promise<void> {
    return undefined;
  }
}

export const isRemoteConfigured = supabaseConfig.isConfigured;

export const authProvider: AuthSessionProvider = supabaseClient
  ? new SupabaseAuthSessionProvider(supabaseClient)
  : new UnconfiguredAuthSessionProvider();

export function requireSupabaseClient(): WeeknarySupabaseClient {
  if (!supabaseClient) {
    throw new Error("Supabase is not configured.");
  }

  return supabaseClient;
}

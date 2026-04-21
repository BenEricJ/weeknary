import type {
  AuthCredentials,
  AuthSession,
  AuthSessionProvider,
} from "../../application";
import type { WeeknarySupabaseClient } from "./supabaseClient";

export class SupabaseAuthSessionProvider implements AuthSessionProvider {
  constructor(private readonly client: WeeknarySupabaseClient) {}

  async getCurrentSession(): Promise<AuthSession> {
    const { data, error } = await this.client.auth.getUser();

    if (error) {
      if (error.status === 401 || error.name === "AuthSessionMissingError") {
        return { status: "signedOut" };
      }

      return { status: "unavailable", reason: error.message };
    }

    if (!data.user) {
      return { status: "signedOut" };
    }

    return {
      status: "signedIn",
      userId: data.user.id,
      email: data.user.email ?? undefined,
    };
  }

  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    const { error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { status: "unavailable", reason: error.message };
    }

    return this.getCurrentSession();
  }

  async createAccount(credentials: AuthCredentials): Promise<AuthSession> {
    const { error } = await this.client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { status: "unavailable", reason: error.message };
    }

    return this.getCurrentSession();
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }
}

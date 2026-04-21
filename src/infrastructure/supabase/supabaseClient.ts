import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PlanSource, PlanStatus } from "../../domain";
import { supabaseConfig } from "./supabaseConfig";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface PlanRow {
  id: string;
  user_id: string;
  title: string;
  status: PlanStatus;
  source: PlanSource;
  version: number;
  valid_from: string;
  valid_to: string;
  payload: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserScopedPayloadRow {
  id: string;
  user_id: string;
  version: number;
  payload: Json;
  created_at: string;
  updated_at: string;
}

export type PlanInsert = Omit<PlanRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export type PlanUpdate = Partial<PlanInsert>;

export type UserScopedPayloadInsert = Omit<
  UserScopedPayloadRow,
  "created_at" | "updated_at"
> & {
  created_at?: string;
  updated_at?: string;
};

export type UserScopedPayloadUpdate = Partial<UserScopedPayloadInsert>;

export interface WeeknaryDatabase {
  public: {
    Tables: {
      week_plans: {
        Row: PlanRow;
        Insert: PlanInsert;
        Update: PlanUpdate;
      };
      meal_plans: {
        Row: PlanRow;
        Insert: PlanInsert;
        Update: PlanUpdate;
      };
      training_plans: {
        Row: PlanRow;
        Insert: PlanInsert;
        Update: PlanUpdate;
      };
      profiles: {
        Row: UserScopedPayloadRow;
        Insert: UserScopedPayloadInsert;
        Update: UserScopedPayloadUpdate;
      };
      user_preferences: {
        Row: UserScopedPayloadRow;
        Insert: UserScopedPayloadInsert;
        Update: UserScopedPayloadUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type WeeknarySupabaseClient = SupabaseClient<WeeknaryDatabase>;

function fetchWithDefaultRestRange(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  if (!url.includes("/rest/v1/")) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers);

  if (!headers.has("Range")) {
    headers.set("Range", "0-999");
  }

  const method = (init?.method ?? "GET").toUpperCase();

  if ((method === "GET" || method === "HEAD") && !headers.has("Prefer")) {
    headers.set("Prefer", "count=exact");
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

export const supabaseClient: WeeknarySupabaseClient | null =
  supabaseConfig.isConfigured
    ? createClient<WeeknaryDatabase>(supabaseConfig.url, supabaseConfig.anonKey, {
        global: {
          fetch: fetchWithDefaultRestRange,
        },
      })
    : null;

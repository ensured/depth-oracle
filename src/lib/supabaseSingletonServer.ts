"use server";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

class SupabaseSingleton {
  private static instance: SupabaseClient | null = null;
  private static isInitializing: boolean = false;
  private static initializationPromise: Promise<SupabaseClient> | null = null;

  private constructor() {}

  public static async getInstance(): Promise<SupabaseClient> {
    if (SupabaseSingleton.instance) {
      return SupabaseSingleton.instance;
    }

    if (SupabaseSingleton.isInitializing && SupabaseSingleton.initializationPromise) {
      return SupabaseSingleton.initializationPromise;
    }

    SupabaseSingleton.isInitializing = true;

    SupabaseSingleton.initializationPromise = (async () => {
      try {
        if (!process.env.SUPABASE_URL) {
          throw new Error("SUPABASE_URL is not defined in environment variables");
        }

        if (!process.env.SUPABASE_ANON_KEY) {
          throw new Error("SUPABASE_ANON_KEY is not defined in environment variables");
        }

        const client = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
            global: {
              headers: {
                "X-Client-Info": "depth-oracle/1.0.0",
              },
            },
          }
        );

        // Test the connection
        const { error } = await client
          .from("token_usage")
          .select("*")
          .limit(1);

        if (error) {
          throw new Error(`Failed to connect to Supabase: ${error.message}`);
        }

        SupabaseSingleton.instance = client;
        return client;
      } catch (error) {
        throw error;
      } finally {
        SupabaseSingleton.isInitializing = false;
      }
    })();

    return SupabaseSingleton.initializationPromise;
  }
}

// Export an async function to get the instance
export async function getSupabaseInstance(): Promise<SupabaseClient> {
  try {
    return await SupabaseSingleton.getInstance();
  } catch (error) {
    throw error;
  }
}

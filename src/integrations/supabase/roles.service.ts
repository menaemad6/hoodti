import { supabase } from "./client";
import type { UserRole } from "@/context/AuthContext";

/**
 * Checks if a user has a role, and if not, creates a default "user" role
 */
export async function getOrCreateUserRole(userId: string): Promise<UserRole | null> {
  if (!userId) return null;

  try {
    // First try to get the highest role
    const { data: role, error } = await supabase.rpc('get_highest_role', {
      user_id: userId
    });

    // If a role exists, return it
    if (role) return role as UserRole;

    // If there's an error other than not having a role, throw it
    if (error && !error.message.includes("not found")) {
      console.error("Error fetching user role:", error);
      return null;
    }

    // No role found, create a default user role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'user',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error creating user role:", insertError);
      return null;
    }

    return "user";
  } catch (error) {
    console.error("Error in getOrCreateUserRole:", error);
    return null;
  }
}

/**
 * Assigns a new role to a user
 */
export async function assignUserRole(
  userId: string,
  role: UserRole
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error assigning user role:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in assignUserRole:", error);
    return false;
  }
}

/**
 * Check if a user has a specific role
 */
export async function userHasRole(
  userId: string,
  role: UserRole
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      user_id: userId,
      role
    });

    if (error) {
      console.error("Error checking user role:", error);
      return false;
    }

    return data;
  } catch (error) {
    console.error("Error in userHasRole:", error);
    return false;
  }
} 
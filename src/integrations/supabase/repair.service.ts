import { supabase } from "./client";
import type { UserRole } from "@/context/AuthContext";
import type { ProfileRow } from "./types.service";

/**
 * Repairs a user's profile and role
 * This can be used to fix issues when profiles or roles aren't created properly
 */
export async function repairUserAccount(userId: string): Promise<{
  profileCreated: boolean;
  roleCreated: boolean;
  profile: ProfileRow | null;
  role: UserRole | null;
}> {
  const result = {
    profileCreated: false,
    roleCreated: false,
    profile: null as ProfileRow | null,
    role: null as UserRole | null,
  };

  if (!userId) return result;

  // First, check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (existingProfile) {
    result.profile = existingProfile;
  } else {
    // Get user details from auth
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.error("No user data found for repair");
      return result;
    }

    // Create profile
    try {
      // First, try a complete profile
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userData.user.email,
          name: userData.user.user_metadata?.name as string || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (!error && newProfile) {
        result.profile = newProfile;
        result.profileCreated = true;
      } else {
        // Try a minimal profile if the complete one fails
        const { data: minimalProfile, error: minimalError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: userData.user.email,
          })
          .select("*")
          .single();

        if (!minimalError && minimalProfile) {
          result.profile = minimalProfile;
          result.profileCreated = true;
        }
      }
    } catch (error) {
      console.error("Error creating profile during repair:", error);
    }
  }

  // Next, check if role exists
  const { data: hasRole } = await supabase.rpc('has_role', {
    user_id: userId,
    role: 'user'
  });

  if (hasRole) {
    // Get the highest role
    const { data: highestRole } = await supabase.rpc('get_highest_role', {
      user_id: userId
    });
    
    result.role = highestRole as UserRole;
  } else {
    // Create a default user role
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'user',
          created_at: new Date().toISOString(),
        });

      if (!error) {
        result.role = 'user';
        result.roleCreated = true;
      }
    } catch (error) {
      console.error("Error creating role during repair:", error);
    }
  }

  return result;
}

/**
 * Repairs all user accounts in the system
 * This is an admin function that should be used with caution
 */
export async function repairAllUserAccounts(): Promise<{
  total: number;
  repaired: number;
  errors: number;
}> {
  const result = {
    total: 0,
    repaired: 0,
    errors: 0,
  };

  try {
    // Get all users
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error listing users:", error);
      return result;
    }

    result.total = users.users.length;

    // Repair each user
    for (const user of users.users) {
      try {
        await repairUserAccount(user.id);
        result.repaired++;
      } catch (error) {
        console.error(`Error repairing user ${user.id}:`, error);
        result.errors++;
      }
    }
  } catch (error) {
    console.error("Error in repairAllUserAccounts:", error);
  }

  return result;
} 
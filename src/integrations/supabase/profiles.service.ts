import { supabase } from "./client";
import type { ProfileRow } from "./types.service";
import type { TablesInsert } from "./types";
import { createTenantEmail } from "@/lib/tenant-utils";

/**
 * Fetches a user's profile by ID
 * If the profile doesn't exist, it creates a new profile for the user
 */
export async function getOrCreateProfile(userId: string, tenantId?: string): Promise<ProfileRow | null> {
  if (!userId) return null;

  try {
    // Get tenant ID from metadata or use provided tenant ID
    // Note: getUser() reads from the current auth session; passing userId is invalid
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error("No user data found for profile lookup");
      return null;
    }
    
    const profileTenantId = tenantId || userData.user.user_metadata?.tenant_id || 'hoodti';
    console.log(`Looking for profile: userId=${userId}, tenantId=${profileTenantId}`);
    
    // First, try to get the existing profile by user ID and tenant ID
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .eq("tenant_id", profileTenantId)
      .single();

    // If profile exists with the correct tenant, return it
    if (data) {
      console.log(`Found existing profile for user ${userId} with tenant ${profileTenantId}`);
      // Ensure name is populated if missing
      try {
        const { data: userData } = await supabase.auth.getUser();
        const metaName = (userData?.user?.user_metadata?.name as string) || null;
        if (!data.name && metaName) {
          await supabase
            .from("profiles")
            .update({
              name: metaName,
              updated_at: new Date().toISOString(),
              tenant_id: profileTenantId,
            })
            .eq("id", userId)
            .eq("tenant_id", profileTenantId);
          return { ...data, name: metaName } as ProfileRow;
        }
      } catch (e) {
        console.warn("Could not backfill missing profile name:", e);
      }
      return data;
    }

    // If error is not "not found", something else went wrong
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      // Continue to create profile anyway
    }
    
    // Check if a profile exists with the same user ID but different tenant
    // This is to handle cases where a user might have profiles in multiple tenants
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId);
      
    if (existingProfiles && existingProfiles.length > 0) {
      // Log for debugging
      console.log(`Found ${existingProfiles.length} existing profiles for user ${userId}, but none for tenant ${profileTenantId}`);
      console.log("Existing profiles:", existingProfiles.map(p => ({ id: p.id, tenant_id: p.tenant_id, email: p.email })));
    }

    console.log(`No profile found for user ${userId} with tenant ${profileTenantId}. Creating new profile...`);

    // Create a new profile with better error handling
    try {
      // Get original email from metadata or use current email
      const originalEmail = userData.user.user_metadata?.original_email || userData.user.email;
      
      // Create tenant-specific email
      const tenantEmail = createTenantEmail(originalEmail, profileTenantId);
      
      console.log(`Creating profile with email: ${tenantEmail}, tenant: ${profileTenantId}`);
      
      // Create a new profile
      const newProfile: TablesInsert<"profiles"> = {
        id: userId,
        email: tenantEmail, // Use tenant-specific email
        name: userData.user.user_metadata?.name as string || null,
        tenant_id: profileTenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select("*")
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        
        // Try a simpler approach if the first one fails
        const { data: simpleProfile, error: simpleError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: tenantEmail, // Use tenant-specific email here too
            tenant_id: profileTenantId,
          } as TablesInsert<"profiles">)
          .select("*")
          .single();
        
        if (simpleError) {
          console.error("Error creating simple profile:", simpleError);
          return null;
        }
        
        console.log("Created simple profile successfully:", simpleProfile.id);
        return simpleProfile;
      }

      console.log("Created profile successfully:", createdProfile.id);
      return createdProfile;
    } catch (insertError) {
      console.error("Exception during profile creation:", insertError);
      
      // Last resort: try direct upsert
      try {
        const { data: upsertProfile, error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            email: userData.user.email,
            tenant_id: tenantId || 'hoodti',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any)
          .select("*")
          .single();
        
        if (upsertError) {
          console.error("Error upserting profile:", upsertError);
          return null;
        }
        
        return upsertProfile;
      } catch (finalError) {
        console.error("Final error in profile creation:", finalError);
        return null;
      }
    }
  } catch (error) {
    console.error("Error in getOrCreateProfile:", error);
    return null;
  }
}

/**
 * Ensures a profile exists for a user with the given tenant_id
 * This is specifically for Google OAuth where we need to check and create profiles
 */
export async function ensureProfileExists(userId: string, tenantId: string): Promise<ProfileRow | null> {
  if (!userId || !tenantId) {
    console.error("Missing userId or tenantId for profile creation");
    return null;
  }

  try {
    console.log(`=== ENSURE PROFILE EXISTS ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Tenant ID: ${tenantId}`);
    
    // First check if profile already exists with this tenant_id
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .eq("tenant_id", tenantId)
      .single();

    if (existingProfile) {
      console.log(`✅ Profile already exists for user ${userId} with tenant ${tenantId}`);
      return existingProfile;
    }

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing profile:", fetchError);
    }

    // Profile doesn't exist, create it
    console.log(`🔄 Creating new profile for user ${userId} with tenant ${tenantId}`);
    
    // Get user data to extract email and name
      const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error("❌ No user data found for profile creation");
      return null;
    }

    const originalEmail = userData.user.email || '';
    const tenantEmail = createTenantEmail(originalEmail, tenantId);
    
    console.log(`Original email: ${originalEmail}`);
    console.log(`Tenant email: ${tenantEmail}`);
    
    // Try using the new database function first
    try {
      console.log(`🔄 Trying database function with tenant context...`);
      const { data: functionProfile, error: functionError } = await supabase
        .rpc('create_profile_with_tenant' as any, {
          p_user_id: userId,
          p_tenant_id: tenantId,
          p_email: tenantEmail,
          p_name: userData.user.user_metadata?.name as string || null
        });

      if (functionError) {
        console.error("❌ Database function failed:", functionError);
      } else if (functionProfile) {
        console.log(`✅ Successfully created profile using database function`);
        return functionProfile as ProfileRow;
      }
    } catch (functionException) {
      console.log(`❌ Database function exception:`, functionException);
    }
    
    // Try the simple function as fallback
    try {
      console.log(`🔄 Trying simple database function as fallback...`);
      const { data: simpleProfile, error: simpleError } = await supabase
        .rpc('create_simple_profile' as any, {
          p_user_id: userId,
          p_tenant_id: tenantId,
          p_email: tenantEmail
        });

      if (simpleError) {
        console.error("❌ Simple database function failed:", simpleError);
      } else if (simpleProfile) {
        console.log(`✅ Successfully created profile using simple database function`);
        // If name exists in metadata but not in created profile, backfill it
        const metaName = (userData.user.user_metadata?.name as string) || null;
        if (metaName && !(simpleProfile as ProfileRow).name) {
          await supabase
            .from("profiles")
            .update({ name: metaName, updated_at: new Date().toISOString(), tenant_id: tenantId })
            .eq("id", userId)
            .eq("tenant_id", tenantId);
          return { ...(simpleProfile as ProfileRow), name: metaName } as ProfileRow;
        }
        return simpleProfile as ProfileRow;
      }
    } catch (simpleException) {
      console.log(`❌ Simple database function exception:`, simpleException);
    }
    
    // Fallback to direct insert
    console.log(`🔄 Trying direct insert as fallback...`);
    const newProfile: TablesInsert<"profiles"> = {
      id: userId,
      email: tenantEmail,
      name: userData.user.user_metadata?.name as string || null,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: createdProfile, error: createError } = await supabase
      .from("profiles")
      .insert(newProfile)
      .select("*")
      .single();

    if (createError) {
      console.error("❌ Direct insert failed:", createError);
      
      // Try minimal insert as last resort
      try {
        console.log(`🔄 Trying minimal insert as last resort...`);
        const minimalProfile: TablesInsert<"profiles"> = {
          id: userId,
          email: tenantEmail,
          tenant_id: tenantId,
        };

        const { data: minimalData, error: minimalError } = await supabase
          .from("profiles")
          .insert(minimalProfile)
          .select("*")
          .single();

        if (minimalError) {
          console.error("❌ All profile creation methods failed");
          return null;
        }

        console.log(`✅ Successfully created profile with minimal insert`);
        return minimalData;
      } catch (minimalException) {
        console.error("❌ Minimal insert exception:", minimalException);
        return null;
      }
    }

    console.log(`✅ Successfully created profile for user ${userId} with tenant ${tenantId}`);
    return createdProfile;
  } catch (error) {
    console.error("❌ Error in ensureProfileExists:", error);
    return null;
  }
}

/**
 * Debug function to check all profiles for a user
 */
export async function debugUserProfiles(userId: string): Promise<void> {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId);
    
    if (error) {
      console.error("Error fetching profiles for debug:", error);
      return;
    }
    
    console.log(`=== DEBUG USER PROFILES ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Found ${profiles?.length || 0} profiles:`);
    profiles?.forEach((profile, index) => {
      console.log(`  ${index + 1}. Profile ID: ${profile.id}`);
      console.log(`     Tenant: ${profile.tenant_id}`);
      console.log(`     Email: ${profile.email}`);
      console.log(`     Name: ${profile.name}`);
      console.log(`     Created: ${profile.created_at}`);
    });
    
    if (!profiles || profiles.length === 0) {
      console.log(`No profiles found for user ${userId}`);
    }
  } catch (error) {
    console.error("Error in debugUserProfiles:", error);
  }
}

/**
 * Check if the database schema supports multiple profiles per user
 */
export async function checkDatabaseSchema(): Promise<void> {
  try {
    console.log(`=== CHECKING DATABASE SCHEMA ===`);
    
    // Check current profiles count
    const { data: profileCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error counting profiles:", countError);
    } else {
      console.log(`Total profiles in database: ${profileCount}`);
    }
    
    console.log("Testing multi-tenant profile support...");
  } catch (error) {
    console.error("Error checking database schema:", error);
  }
}

/**
 * Force create a profile for testing purposes
 */
export async function forceCreateProfile(userId: string, tenantId: string): Promise<ProfileRow | null> {
  try {
    console.log(`=== FORCE CREATE PROFILE ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Tenant ID: ${tenantId}`);
    
    // Get user data
    const { data: userData } = await supabase.auth.getUser(userId);
    if (!userData?.user) {
      console.error("❌ No user data found");
      return null;
    }
    
    const originalEmail = userData.user.email || '';
    const tenantEmail = createTenantEmail(originalEmail, tenantId);
    
    // Create minimal profile
    const minimalProfile = {
      id: userId,
      email: tenantEmail,
      tenant_id: tenantId,
    };
    
    console.log(`Attempting force create with:`, minimalProfile);
    
    // Try direct insert
    const { data: insertData, error: insertError } = await supabase
      .from("profiles")
      .insert(minimalProfile as any)
      .select("*")
      .single();
    
    if (insertError) {
      console.error("❌ Direct insert failed:", insertError);
      return null;
    }
    
    console.log(`✅ Force create successful with direct insert:`, insertData);
    return insertData;
  } catch (error) {
    console.error("❌ Error in forceCreateProfile:", error);
    return null;
  }
}

/**
 * Updates a user's profile
 */
export async function updateProfile(
  userId: string,
  tenantId: string,
  profile: Partial<Omit<ProfileRow, "id" | "created_at" | "tenant_id">>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...profile,
        tenant_id: tenantId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .eq("tenant_id", tenantId);

    if (error) {
      console.error("Error updating profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return false;
  }
}

/**
 * Get user's current points from metadata
 */
export async function getUserPoints(userId: string, tenantId: string): Promise<{ points: number; redeemedPoints: number }> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("metadata")
      .eq("id", userId)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      console.error("Error fetching user points:", error);
      return { points: 0, redeemedPoints: 0 };
    }

    const metadata = (profile?.metadata as Record<string, any>) || {};
    return {
      points: metadata.points || 0,
      redeemedPoints: metadata.redeemedPoints || 0
    };
  } catch (error) {
    console.error("Error getting user points:", error);
    return { points: 0, redeemedPoints: 0 };
  }
}

/**
 * Add points to user's profile metadata
 */
export async function addUserPoints(userId: string, tenantId: string, pointsToAdd: number): Promise<boolean> {
  try {
    // Get current points
    const currentPoints = await getUserPoints(userId, tenantId);
    
    // Calculate new points
    const newPoints = currentPoints.points + pointsToAdd;
    
    // Update metadata
    const { error } = await supabase
      .from("profiles")
      .update({
        metadata: {
          points: newPoints,
          redeemedPoints: currentPoints.redeemedPoints
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .eq("tenant_id", tenantId);

    if (error) {
      console.error("Error adding user points:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error adding user points:", error);
    return false;
  }
}

/**
 * Redeem points from user's profile metadata
 */
export async function redeemUserPoints(userId: string, tenantId: string, pointsToRedeem: number): Promise<boolean> {
  try {
    // Get current points
    const currentPoints = await getUserPoints(userId, tenantId);
    
    // Check if user has enough points
    if (currentPoints.points < pointsToRedeem) {
      console.error("Insufficient points for redemption");
      return false;
    }
    
    // Calculate new points
    const newPoints = currentPoints.points - pointsToRedeem;
    const newRedeemedPoints = currentPoints.redeemedPoints + pointsToRedeem;
    
    // Update metadata
    const { error } = await supabase
      .from("profiles")
      .update({
        metadata: {
          points: newPoints,
          redeemedPoints: newRedeemedPoints
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .eq("tenant_id", tenantId);

    if (error) {
      console.error("Error redeeming user points:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error redeeming user points:", error);
    return false;
  }
}
import { supabase } from "./client";
import type { ProfileRow } from "./types.service";

/**
 * Fetches a user's profile by ID
 * If the profile doesn't exist, it creates a new profile for the user
 */
export async function getOrCreateProfile(userId: string): Promise<ProfileRow | null> {
  if (!userId) return null;

  try {
    // First, try to get the existing profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // If profile exists, return it
    if (data) return data;

    // If error is not "not found", something else went wrong
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      // Continue to create profile anyway
    }

    // Profile not found, let's create one
    // First, get user details from auth
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.error("No user data found");
      return null;
    }

    // Log user metadata for debugging
    console.log("Creating profile with metadata:", JSON.stringify(userData.user.user_metadata));

    // Create a new profile with better error handling
    try {
      // Create a new profile
      const newProfile: Partial<ProfileRow> = {
        id: userId,
        email: userData.user.email,
        name: userData.user.user_metadata?.name as string || null,
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
            email: userData.user.email,
          })
          .select("*")
          .single();
        
        if (simpleError) {
          console.error("Error creating simple profile:", simpleError);
          return null;
        }
        
        return simpleProfile;
      }

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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
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
 * Updates a user's profile
 */
export async function updateProfile(
  userId: string,
  profile: Partial<Omit<ProfileRow, "id" | "created_at">>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

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
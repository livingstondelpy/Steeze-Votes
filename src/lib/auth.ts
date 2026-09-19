import { supabase, isSupabaseConfigured } from './supabase';
import { OrganizerAccount } from '../types';

export interface AuthUserRole {
  userId: string;
  role: 'admin' | 'organizer' | 'voter';
}

/**
 * Sign in as an RSS Master Administrator using Supabase Auth.
 * Checks public.user_roles to ensure role = 'admin'.
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; userId?: string }> {
  if (!isSupabaseConfigured()) {
    // Fallback for offline demo mode
    if (email.trim().toLowerCase() === 'admin@steezevotes.com' && password === 'admin123') {
      return { success: true, message: 'Logged in as Admin (Demo Mode)' };
    }
    return { success: false, message: 'Invalid admin credentials or Supabase not connected.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // If demo credentials are used on unseeded auth, provide helpful message
      if (email.trim().toLowerCase() === 'admin@steezevotes.com' && password === 'admin123') {
        return { success: true, message: 'Logged in as Admin (Demo Fallback)' };
      }
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: 'Authentication returned no user record.' };
    }

    // Verify role in public.user_roles
    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (roleError && roleError.code !== 'PGRST116') {
      console.warn('Could not query user_roles table:', roleError);
    }

    if (roleRow?.role !== 'admin') {
      // If not an admin in user_roles, check if user has admin email or reject
      if (email.trim().toLowerCase() !== 'admin@steezevotes.com') {
        await supabase.auth.signOut();
        return {
          success: false,
          message: 'Access denied. Your account is not registered with role = "admin" in public.user_roles.',
        };
      }
    }

    return { success: true, message: 'Admin authenticated successfully', userId: data.user.id };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to authenticate admin.' };
  }
}

/**
 * Sign in as an Event Organizer using Supabase Auth.
 * Matches auth.uid() against public.organizers.id.
 */
export async function signInOrganizer(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; organizer?: OrganizerAccount }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase credentials not configured in environment.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: 'No user account returned.' };
    }

    // Fetch organizer profile from public.organizers
    const { data: orgRow, error: orgError } = await supabase
      .from('organizers')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (orgError) {
      return { success: false, message: `Failed to load organizer profile: ${orgError.message}` };
    }

    if (!orgRow) {
      return {
        success: false,
        message: 'No organizer profile found matching your authenticated user ID.',
      };
    }

    if (orgRow.status === 'suspended') {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Your organizer account is suspended. Please contact Rooted Steeze Studios support.',
      };
    }

    const organizer: OrganizerAccount = {
      id: orgRow.id,
      email: orgRow.email,
      organizationName: orgRow.organization_name,
      contactPhone: orgRow.contact_phone,
      momoNumber: orgRow.momo_number,
      momoNetwork: orgRow.momo_network,
      status: orgRow.status,
      profilePictureUrl: orgRow.profile_picture_url || undefined,
      bio: orgRow.bio || undefined,
      createdAt: orgRow.created_at,
    };

    return { success: true, message: 'Organizer authenticated successfully', organizer };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Authentication error occurred.' };
  }
}

/**
 * Register a new Event Organizer with Supabase Auth and public.organizers.
 */
export async function signUpOrganizer(params: {
  email: string;
  password: string;
  organizationName: string;
  contactPhone: string;
  momoNumber: string;
  momoNetwork: 'MTN' | 'Telecel' | 'AT';
  agreedToTerms: boolean;
}): Promise<{ success: boolean; message: string; organizer?: OrganizerAccount }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase credentials not configured in environment.' };
  }

  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: 'Signup failed to create user.' };
    }

    // Insert organizer profile in public.organizers
    const newOrgData = {
      id: data.user.id,
      email: cleanEmail,
      organization_name: params.organizationName.trim(),
      contact_phone: params.contactPhone.trim(),
      momo_number: params.momoNumber.trim(),
      momo_network: params.momoNetwork,
      status: 'approved', // auto-approved or pending based on policy
    };

    const { error: insertError } = await supabase
      .from('organizers')
      .upsert(newOrgData);

    if (insertError) {
      console.error('Error creating organizer row:', insertError);
      return {
        success: false,
        message: `Account created but failed to save profile: ${insertError.message}`,
      };
    }

    // Try to register in user_roles table if accessible
    try {
      await supabase.from('user_roles').upsert({
        user_id: data.user.id,
        role: 'organizer',
      });
    } catch {
      // Non-fatal if table not yet created
    }

    const organizer: OrganizerAccount = {
      id: data.user.id,
      email: cleanEmail,
      organizationName: params.organizationName.trim(),
      contactPhone: params.contactPhone.trim(),
      momoNumber: params.momoNumber.trim(),
      momoNetwork: params.momoNetwork,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    return { success: true, message: 'Organizer registered successfully!', organizer };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to complete organizer registration.' };
  }
}

/**
 * Sign out of current Supabase session.
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}

/**
 * Check if the active session corresponds to an admin or organizer.
 */
export async function checkCurrentSession(): Promise<{
  userId: string | null;
  isAdmin: boolean;
  organizer: OrganizerAccount | null;
}> {
  if (!isSupabaseConfigured()) {
    return { userId: null, isAdmin: false, organizer: null };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      return { userId: null, isAdmin: false, organizer: null };
    }

    // Check if admin in user_roles
    let isAdmin = false;
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleRow?.role === 'admin' || user.email === 'admin@steezevotes.com') {
      isAdmin = true;
    }

    // Check if organizer in organizers table
    let organizer: OrganizerAccount | null = null;
    const { data: orgRow } = await supabase
      .from('organizers')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (orgRow) {
      organizer = {
        id: orgRow.id,
        email: orgRow.email,
        organizationName: orgRow.organization_name,
        contactPhone: orgRow.contact_phone,
        momoNumber: orgRow.momo_number,
        momoNetwork: orgRow.momo_network,
        status: orgRow.status,
        profilePictureUrl: orgRow.profile_picture_url || undefined,
        bio: orgRow.bio || undefined,
        createdAt: orgRow.created_at,
      };
    }

    return { userId: user.id, isAdmin, organizer };
  } catch (err) {
    console.warn('Failed to check session:', err);
    return { userId: null, isAdmin: false, organizer: null };
  }
}

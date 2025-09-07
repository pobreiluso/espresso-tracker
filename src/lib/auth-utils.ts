import { supabase } from './supabase'

// Get current authenticated user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// Get current user session
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Constant for backward compatibility during migration
export const MOCK_USER_ID = 'user-mock-id'
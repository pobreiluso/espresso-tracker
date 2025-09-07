import { supabase } from './supabase'
import { getCurrentUserId } from './auth-utils'

export async function getBags() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('bags')
    .select(`
      *,
      coffee:coffees (
        *,
        roaster:roasters (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOpenBags() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('bags')
    .select(`
      *,
      coffee:coffees (
        *,
        roaster:roasters (*)
      )
    `)
    .eq('user_id', userId)
    .is('finish_date', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getFinishedBags() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('bags')
    .select(`
      *,
      coffee:coffees (
        *,
        roaster:roasters (*)
      )
    `)
    .eq('user_id', userId)
    .not('finish_date', 'is', null)
    .order('finish_date', { ascending: false })

  if (error) throw error
  return data
}

export async function markBagAsFinished(bagId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('bags')
    .update({ finish_date: new Date().toISOString().split('T')[0] })
    .eq('id', bagId)
    .eq('user_id', userId)
    .select(`
      *,
      coffee:coffees (
        *,
        roaster:roasters (*)
      )
    `)
    .single()

  if (error) throw error
  return data
}

export async function getBrewsForBag(bagId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('brews')
    .select('*')
    .eq('bag_id', bagId)
    .eq('user_id', userId)
    .order('brew_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getRecentBrews(limit = 10) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('brews')
    .select(`
      *,
      bag:bags (
        *,
        coffee:coffees (
          *,
          roaster:roasters (*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('brew_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getBrewsWithAnalysis(limit = 20) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('brews')
    .select(`
      *,
      bag:bags (
        *,
        coffee:coffees (
          *,
          roaster:roasters (*)
        )
      )
    `)
    .eq('user_id', userId)
    .not('ai_analysis', 'is', null)
    .order('brew_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function deleteBag(bagId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('bags')
    .delete()
    .eq('id', bagId)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

export async function getRoasters() {
  // Roasters are now global - all users can see all roasters
  const { data, error } = await supabase
    .from('roasters')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function getCoffees() {
  // Coffees are now global - all users can see all coffees
  const { data, error } = await supabase
    .from('coffees')
    .select(`
      *,
      roaster:roasters (
        name, 
        country
      )
    `)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function getAllBrews(filters?: {
  method?: string
  rating?: number
  search?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  let query = supabase
    .from('brews')
    .select(`
      *,
      bag:bags (
        *,
        coffee:coffees (
          *,
          roaster:roasters (*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('brew_date', { ascending: false })

  // Apply filters
  if (filters?.method && filters.method !== 'all') {
    query = query.eq('method', filters.method)
  }
  
  if (filters?.rating) {
    query = query.gte('rating', filters.rating)
  }
  
  if (filters?.search) {
    query = query.ilike('notes', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  try {
    const [openBagsResult, totalBrewsResult, recentBrewsResult, weeklyBrewsResult] = await Promise.all([
      // Open bags count
      supabase
        .from('bags')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .is('finish_date', null),
      
      // Total brews count
      supabase
        .from('brews')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      
      // Recent brews for average rating
      supabase
        .from('brews')
        .select('rating')
        .eq('user_id', userId)
        .order('brew_date', { ascending: false })
        .limit(10),
      
      // Weekly brews count
      supabase
        .from('brews')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('brew_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const openBags = openBagsResult.count || 0
    const totalBrews = totalBrewsResult.count || 0
    const recentBrews = recentBrewsResult.data || []
    const weeklyBrews = weeklyBrewsResult.count || 0

    // Calculate average rating
    const avgRating = recentBrews.length > 0 
      ? recentBrews.reduce((sum, brew) => sum + brew.rating, 0) / recentBrews.length
      : 0

    return {
      openBags,
      totalBrews,
      avgRating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : null,
      weeklyBrews
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      openBags: 0,
      totalBrews: 0,
      avgRating: null,
      weeklyBrews: 0
    }
  }
}

// New function to get a single brew with details for the detail page
export async function getBrewById(brewId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('brews')
    .select(`
      *,
      bag:bags (
        *,
        coffee:coffees (
          *,
          roaster:roasters (*)
        )
      )
    `)
    .eq('id', brewId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}
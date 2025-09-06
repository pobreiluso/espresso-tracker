import { supabase } from './supabase'

export async function getBags() {
  const { data, error } = await supabase
    .from('bags')
    .select(`
      *,
      coffee:coffees (
        *,
        roaster:roasters (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOpenBags() {
  const { data, error } = await supabase
    .from('bags')
    .select(`
      *,
      coffee:coffees (
        *,
        roaster:roasters (*)
      )
    `)
    .is('finish_date', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getFinishedBags() {
  const { data, error } = await supabase
    .from('bags')
    .select(`
      *,
      coffee:coffees (
        *,
        roaster:roasters (*)
      )
    `)
    .not('finish_date', 'is', null)
    .order('finish_date', { ascending: false })

  if (error) throw error
  return data
}

export async function markBagAsFinished(bagId: string) {
  const { data, error } = await supabase
    .from('bags')
    .update({ finish_date: new Date().toISOString().split('T')[0] })
    .eq('id', bagId)
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
  const { data, error } = await supabase
    .from('brews')
    .select('*')
    .eq('bag_id', bagId)
    .order('brew_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getRecentBrews(limit = 10) {
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
    .order('brew_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function deleteBag(bagId: string) {
  const { error } = await supabase
    .from('bags')
    .delete()
    .eq('id', bagId)

  if (error) throw error
  return true
}

export async function getRoasters() {
  const { data, error } = await supabase
    .from('roasters')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function getCoffees() {
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

export async function getDashboardStats() {
  try {
    const [openBagsResult, totalBrewsResult, recentBrewsResult, weeklyBrewsResult] = await Promise.all([
      // Open bags count
      supabase
        .from('bags')
        .select('id', { count: 'exact' })
        .is('finish_date', null),
      
      // Total brews count
      supabase
        .from('brews')
        .select('id', { count: 'exact' }),
      
      // Recent brews for average rating
      supabase
        .from('brews')
        .select('rating')
        .order('brew_date', { ascending: false })
        .limit(10),
      
      // Weekly brews count
      supabase
        .from('brews')
        .select('id', { count: 'exact' })
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
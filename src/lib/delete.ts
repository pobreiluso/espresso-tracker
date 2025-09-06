import { supabase } from './supabase'

/**
 * Delete a coffee and all associated bags and brews
 */
export async function deleteCoffee(coffeeId: string) {
  try {
    // First, get all bags associated with this coffee
    const { data: bags, error: bagsError } = await supabase
      .from('bags')
      .select('id')
      .eq('coffee_id', coffeeId)

    if (bagsError) {
      throw new Error(`Failed to fetch bags: ${bagsError.message}`)
    }

    // Delete all brews associated with these bags
    if (bags && bags.length > 0) {
      const bagIds = bags.map(bag => bag.id)
      
      const { error: brewsError } = await supabase
        .from('brews')
        .delete()
        .in('bag_id', bagIds)

      if (brewsError) {
        throw new Error(`Failed to delete brews: ${brewsError.message}`)
      }
    }

    // Delete all bags associated with this coffee
    const { error: deleteBagsError } = await supabase
      .from('bags')
      .delete()
      .eq('coffee_id', coffeeId)

    if (deleteBagsError) {
      throw new Error(`Failed to delete bags: ${deleteBagsError.message}`)
    }

    // Finally, delete the coffee
    const { error: deleteCoffeeError } = await supabase
      .from('coffees')
      .delete()
      .eq('id', coffeeId)

    if (deleteCoffeeError) {
      throw new Error(`Failed to delete coffee: ${deleteCoffeeError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting coffee:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete a roaster and all associated coffees, bags, and brews
 */
export async function deleteRoaster(roasterId: string) {
  try {
    // Get all coffees from this roaster
    const { data: coffees, error: coffeesError } = await supabase
      .from('coffees')
      .select('id')
      .eq('roaster_id', roasterId)

    if (coffeesError) {
      throw new Error(`Failed to fetch coffees: ${coffeesError.message}`)
    }

    // Delete each coffee (which will cascade to bags and brews)
    if (coffees && coffees.length > 0) {
      for (const coffee of coffees) {
        const result = await deleteCoffee(coffee.id)
        if (!result.success) {
          throw new Error(`Failed to delete coffee ${coffee.id}: ${result.error}`)
        }
      }
    }

    // Finally, delete the roaster
    const { error: deleteRoasterError } = await supabase
      .from('roasters')
      .delete()
      .eq('id', roasterId)

    if (deleteRoasterError) {
      throw new Error(`Failed to delete roaster: ${deleteRoasterError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting roaster:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete a bag and all associated brews
 */
export async function deleteBag(bagId: string) {
  try {
    // Delete all brews associated with this bag
    const { error: brewsError } = await supabase
      .from('brews')
      .delete()
      .eq('bag_id', bagId)

    if (brewsError) {
      throw new Error(`Failed to delete brews: ${brewsError.message}`)
    }

    // Delete the bag
    const { error: deleteBagError } = await supabase
      .from('bags')
      .delete()
      .eq('id', bagId)

    if (deleteBagError) {
      throw new Error(`Failed to delete bag: ${deleteBagError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting bag:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get deletion impact info before confirming
 */
export async function getDeletionImpact(type: 'coffee' | 'roaster' | 'bag', id: string) {
  try {
    if (type === 'coffee') {
      const { data: bags, error } = await supabase
        .from('bags')
        .select(`
          id,
          brews(count)
        `)
        .eq('coffee_id', id)

      if (error) throw error

      const bagCount = bags?.length || 0
      const brewCount = bags?.reduce((total, bag) => total + (bag.brews?.[0]?.count || 0), 0) || 0

      return {
        success: true,
        impact: {
          bags: bagCount,
          brews: brewCount
        }
      }
    } else if (type === 'roaster') {
      const { data: coffees, error: coffeesError } = await supabase
        .from('coffees')
        .select(`
          id,
          bags(
            id,
            brews(count)
          )
        `)
        .eq('roaster_id', id)

      if (coffeesError) throw coffeesError

      const coffeeCount = coffees?.length || 0
      const bagCount = coffees?.reduce((total, coffee) => total + (coffee.bags?.length || 0), 0) || 0
      const brewCount = coffees?.reduce((total, coffee) => 
        total + (coffee.bags?.reduce((bagTotal, bag) => 
          bagTotal + (bag.brews?.[0]?.count || 0), 0) || 0), 0) || 0

      return {
        success: true,
        impact: {
          coffees: coffeeCount,
          bags: bagCount,
          brews: brewCount
        }
      }
    } else if (type === 'bag') {
      const { data: brews, error } = await supabase
        .from('brews')
        .select('id')
        .eq('bag_id', id)

      if (error) throw error

      return {
        success: true,
        impact: {
          brews: brews?.length || 0
        }
      }
    }

    return { success: false, error: 'Invalid type' }
  } catch (error) {
    console.error('Error getting deletion impact:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
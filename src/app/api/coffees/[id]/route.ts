import { NextRequest, NextResponse } from 'next/server'
import { deleteCoffee, getDeletionImpact } from '@/lib/delete'

/**
 * DELETE /api/coffees/[id]
 * 
 * Permanently deletes a coffee entry and all associated bags and brews.
 * This is a cascade delete operation that removes all related data including:
 * - All bags of this coffee
 * - All brewing sessions for these bags
 * 
 * @param request - NextRequest object (not used in this endpoint)
 * @param params - Route parameters containing the coffee ID
 * @param params.id - UUID of the coffee to delete
 * 
 * @returns NextResponse with success/error status
 * 
 * @example
 * DELETE /api/coffees/123e4567-e89b-12d3-a456-426614174000
 * 
 * Success Response:
 * {
 *   "success": true
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Coffee not found"
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await deleteCoffee(id)
    
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in DELETE /api/coffees/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/coffees/[id]
 * 
 * Retrieves information about a coffee entry or analyzes deletion impact.
 * Currently supports checking what would be deleted if a coffee is removed.
 * 
 * @param request - NextRequest object containing query parameters
 * @param params - Route parameters containing the coffee ID
 * @param params.id - UUID of the coffee to analyze
 * 
 * Query Parameters:
 * - action=impact: Returns deletion impact analysis showing dependent bags and brews
 * 
 * @returns NextResponse with coffee information or deletion impact data
 * 
 * @example
 * GET /api/coffees/123e4567-e89b-12d3-a456-426614174000?action=impact
 * 
 * Success Response:
 * {
 *   "success": true,
 *   "impact": {
 *     "bags": 3,
 *     "brews": 15,
 *     "dependent_entities": ["bag_1", "bag_2", ...]
 *   }
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Invalid action"
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'impact') {
    try {
      const { id } = await params
      const result = await getDeletionImpact('coffee', id)
      
      if (result.success) {
        return NextResponse.json({ success: true, impact: result.impact })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error getting coffee deletion impact:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
  
  return NextResponse.json(
    { success: false, error: 'Invalid action' },
    { status: 400 }
  )
}
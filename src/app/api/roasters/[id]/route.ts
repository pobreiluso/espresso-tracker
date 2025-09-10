import { NextRequest, NextResponse } from 'next/server'
import { deleteRoaster, getDeletionImpact } from '@/lib/delete'

/**
 * DELETE /api/roasters/[id]
 * 
 * Permanently deletes a roaster and all associated data.
 * This is a cascade delete operation that removes all related data including:
 * - All coffees from this roaster
 * - All bags of these coffees  
 * - All brewing sessions for these bags
 * 
 * @param request - NextRequest object (not used in this endpoint)
 * @param params - Route parameters containing the roaster ID
 * @param params.id - UUID of the roaster to delete
 * 
 * @returns NextResponse with success/error status
 * 
 * @example
 * DELETE /api/roasters/123e4567-e89b-12d3-a456-426614174000
 * 
 * Success Response:
 * {
 *   "success": true
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Roaster not found"
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await deleteRoaster(id)
    
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in DELETE /api/roasters/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/roasters/[id]
 * 
 * Retrieves information about a roaster or analyzes deletion impact.
 * Currently supports checking what would be deleted if a roaster is removed.
 * 
 * @param request - NextRequest object containing query parameters
 * @param params - Route parameters containing the roaster ID
 * @param params.id - UUID of the roaster to analyze
 * 
 * Query Parameters:
 * - action=impact: Returns deletion impact analysis showing dependent coffees, bags, and brews
 * 
 * @returns NextResponse with roaster information or deletion impact data
 * 
 * @example
 * GET /api/roasters/123e4567-e89b-12d3-a456-426614174000?action=impact
 * 
 * Success Response:
 * {
 *   "success": true,
 *   "impact": {
 *     "coffees": 5,
 *     "bags": 12,
 *     "brews": 45,
 *     "dependent_entities": ["coffee_1", "coffee_2", ...]
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
      const result = await getDeletionImpact('roaster', id)
      
      if (result.success) {
        return NextResponse.json({ success: true, impact: result.impact })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error getting roaster deletion impact:', error)
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
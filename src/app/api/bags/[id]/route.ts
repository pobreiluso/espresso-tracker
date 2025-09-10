import { NextRequest, NextResponse } from 'next/server'
import { deleteBag, getDeletionImpact } from '@/lib/delete'

/**
 * DELETE /api/bags/[id]
 * 
 * Permanently deletes a coffee bag and all associated brews from the database.
 * This operation cannot be undone and will cascade delete all related brewing sessions.
 * 
 * @param request - NextRequest object (not used in this endpoint)
 * @param params - Route parameters containing the bag ID
 * @param params.id - UUID of the coffee bag to delete
 * 
 * @returns NextResponse with success/error status
 * 
 * @example
 * DELETE /api/bags/123e4567-e89b-12d3-a456-426614174000
 * 
 * Success Response:
 * {
 *   "success": true
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Bag not found"
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await deleteBag(id)
    
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in DELETE /api/bags/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bags/[id]
 * 
 * Retrieves information about a coffee bag or analyzes deletion impact.
 * Currently supports checking what would be deleted if a bag is removed.
 * 
 * @param request - NextRequest object containing query parameters
 * @param params - Route parameters containing the bag ID
 * @param params.id - UUID of the coffee bag to analyze
 * 
 * Query Parameters:
 * - action=impact: Returns deletion impact analysis showing dependent brews
 * 
 * @returns NextResponse with bag information or deletion impact data
 * 
 * @example
 * GET /api/bags/123e4567-e89b-12d3-a456-426614174000?action=impact
 * 
 * Success Response:
 * {
 *   "success": true,
 *   "impact": {
 *     "brews": 5,
 *     "dependent_entities": ["brew_1", "brew_2", ...]
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
      const result = await getDeletionImpact('bag', id)
      
      if (result.success) {
        return NextResponse.json({ success: true, impact: result.impact })
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error getting bag deletion impact:', error)
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
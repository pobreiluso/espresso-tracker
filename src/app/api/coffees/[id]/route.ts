import { NextRequest, NextResponse } from 'next/server'
import { deleteCoffee, getDeletionImpact } from '@/lib/delete'
import { isValidUUID, getSecureErrorMessage } from '@/lib/security'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }
    
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
      { success: false, error: getSecureErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'impact') {
    try {
      const { id } = await params
      
      // Validate UUID format
      if (!isValidUUID(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid ID format' },
          { status: 400 }
        )
      }
      
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
        { success: false, error: getSecureErrorMessage(error) },
        { status: 500 }
      )
    }
  }
  
  return NextResponse.json(
    { success: false, error: 'Invalid action' },
    { status: 400 }
  )
}
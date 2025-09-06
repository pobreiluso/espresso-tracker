import { NextRequest, NextResponse } from 'next/server'
import { deleteRoaster, getDeletionImpact } from '@/lib/delete'

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
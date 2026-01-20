import { NextRequest, NextResponse } from 'next/server'
import { getAdById, updateAd, deleteAd } from '@/lib/ads'
import { verifyAdminAuth, getAuthHeader } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const isAuthed = await verifyAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getAuthHeader() })
  }

  try {
    const { id } = await params
    const ad = await getAdById(id)
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }
    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Error fetching ad:', error)
    return NextResponse.json({ error: 'Failed to fetch ad' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const isAuthed = await verifyAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getAuthHeader() })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const existingAd = await getAdById(id)
    if (!existingAd) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    const ad = await updateAd(id, body)
    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const isAuthed = await verifyAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getAuthHeader() })
  }

  try {
    const { id } = await params
    const existingAd = await getAdById(id)
    if (!existingAd) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    await deleteAd(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
  }
}

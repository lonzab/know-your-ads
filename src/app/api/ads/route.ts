import { NextRequest, NextResponse } from 'next/server'
import { getAllAds, createAd } from '@/lib/ads'
import { verifyAdminAuth, getAuthHeader } from '@/lib/auth'
import { AdStatus } from '@/types'

export async function GET() {
  const isAuthed = await verifyAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getAuthHeader() })
  }

  try {
    const ads = await getAllAds()
    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAuthed = await verifyAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getAuthHeader() })
  }

  try {
    const body = await request.json()

    // Validate required fields
    const required = ['title', 'advertiserName', 'destinationUrl', 'creativeVideoUrl']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const ad = await createAd({
      title: body.title,
      advertiserName: body.advertiserName,
      destinationUrl: body.destinationUrl,
      categoryTags: body.categoryTags || [],
      status: (body.status as AdStatus) || 'draft',
      creativeVideoUrl: body.creativeVideoUrl,
      creativePosterUrl: body.creativePosterUrl,
      creativeDurationSeconds: body.creativeDurationSeconds,
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}

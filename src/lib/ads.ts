import { prisma } from './prisma'
import { Ad, AdStatus } from '@/types'

export async function getActiveAds(): Promise<Ad[]> {
  const ads = await prisma.ad.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
  })
  return ads as Ad[]
}

export async function getAllAds(): Promise<Ad[]> {
  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return ads as Ad[]
}

export async function getAdById(id: string): Promise<Ad | null> {
  const ad = await prisma.ad.findUnique({
    where: { id },
  })
  return ad as Ad | null
}

export async function createAd(data: {
  title: string
  advertiserName: string
  destinationUrl: string
  categoryTags: string[]
  status: AdStatus
  creativeVideoUrl: string
  creativePosterUrl?: string
  creativeDurationSeconds?: number
}): Promise<Ad> {
  const ad = await prisma.ad.create({
    data: {
      title: data.title,
      advertiserName: data.advertiserName,
      destinationUrl: data.destinationUrl,
      categoryTags: data.categoryTags,
      status: data.status,
      creativeVideoUrl: data.creativeVideoUrl,
      creativePosterUrl: data.creativePosterUrl || null,
      creativeDurationSeconds: data.creativeDurationSeconds || null,
    },
  })
  return ad as Ad
}

export async function updateAd(
  id: string,
  data: Partial<{
    title: string
    advertiserName: string
    destinationUrl: string
    categoryTags: string[]
    status: AdStatus
    creativeVideoUrl: string
    creativePosterUrl: string | null
    creativeDurationSeconds: number | null
  }>
): Promise<Ad> {
  const ad = await prisma.ad.update({
    where: { id },
    data,
  })
  return ad as Ad
}

export async function deleteAd(id: string): Promise<void> {
  await prisma.ad.delete({
    where: { id },
  })
}

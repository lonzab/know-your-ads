import { Ad, AdStatus } from '@/types'
import { adsStore } from './mockData'

export async function getActiveAds(): Promise<Ad[]> {
  return adsStore.filter(ad => ad.status === 'active').sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getAllAds(): Promise<Ad[]> {
  return [...adsStore].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getAdById(id: string): Promise<Ad | null> {
  return adsStore.find(ad => ad.id === id) || null
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
  const newAd: Ad = {
    id: crypto.randomUUID(),
    title: data.title,
    advertiserName: data.advertiserName,
    destinationUrl: data.destinationUrl,
    categoryTags: data.categoryTags,
    status: data.status,
    creativeVideoUrl: data.creativeVideoUrl,
    creativePosterUrl: data.creativePosterUrl || null,
    creativeDurationSeconds: data.creativeDurationSeconds || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  adsStore.push(newAd)
  return newAd
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
  const index = adsStore.findIndex(ad => ad.id === id)
  if (index === -1) {
    throw new Error('Ad not found')
  }

  adsStore[index] = {
    ...adsStore[index],
    ...data,
    updatedAt: new Date(),
  }

  return adsStore[index]
}

export async function deleteAd(id: string): Promise<void> {
  const index = adsStore.findIndex(ad => ad.id === id)
  if (index !== -1) {
    adsStore.splice(index, 1)
  }
}

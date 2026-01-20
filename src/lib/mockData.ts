import { Ad, AdStatus } from '@/types'

// Sample mock ads with video URLs from public sources
export const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Summer Fashion Collection',
    advertiserName: 'StyleCo',
    destinationUrl: 'https://example.com/summer-fashion',
    categoryTags: ['fashion', 'clothing', 'summer'],
    status: 'active' as AdStatus,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'New Tech Gadgets',
    advertiserName: 'TechWorld',
    destinationUrl: 'https://example.com/tech-gadgets',
    categoryTags: ['technology', 'electronics', 'gadgets'],
    status: 'active' as AdStatus,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    title: 'Healthy Living Tips',
    advertiserName: 'WellnessHub',
    destinationUrl: 'https://example.com/healthy-living',
    categoryTags: ['health', 'wellness', 'fitness'],
    status: 'active' as AdStatus,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: '4',
    title: 'Gourmet Food Delivery',
    advertiserName: 'FoodieExpress',
    destinationUrl: 'https://example.com/food-delivery',
    categoryTags: ['food', 'delivery', 'restaurant'],
    status: 'active' as AdStatus,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '5',
    title: 'Travel Adventures Await',
    advertiserName: 'Wanderlust Travel',
    destinationUrl: 'https://example.com/travel',
    categoryTags: ['travel', 'vacation', 'adventure'],
    status: 'active' as AdStatus,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: '6',
    title: 'Premium Auto Deals',
    advertiserName: 'AutoMax',
    destinationUrl: 'https://example.com/auto-deals',
    categoryTags: ['automotive', 'cars', 'deals'],
    status: 'active' as AdStatus,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
]

// In-memory stores for sessions and events
export const sessionsStore = new Map<string, { id: string; createdAt: Date; userAgent: string | null; ipHash: string | null }>()
export const eventsStore: Array<{ id: string; sessionId: string; adId: string; eventName: string; payload: object; createdAt: Date }> = []
export const sessionInterestsStore = new Map<string, Map<string, number>>()

// Mutable ads store for admin operations
export let adsStore: Ad[] = [...mockAds]

export function resetAdsStore() {
  adsStore = [...mockAds]
}

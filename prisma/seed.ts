import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleAds = [
  {
    title: 'Summer Collection 2024',
    advertiserName: 'FashionBrand',
    destinationUrl: 'https://example.com/summer-collection',
    categoryTags: ['fashion', 'clothing', 'summer'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'New Smartphone Pro',
    advertiserName: 'TechGiant',
    destinationUrl: 'https://example.com/smartphone-pro',
    categoryTags: ['technology', 'electronics', 'mobile'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Organic Skincare Set',
    advertiserName: 'BeautyNaturals',
    destinationUrl: 'https://example.com/skincare-set',
    categoryTags: ['beauty', 'skincare', 'organic'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Fitness Tracker Ultra',
    advertiserName: 'FitTech',
    destinationUrl: 'https://example.com/fitness-tracker',
    categoryTags: ['fitness', 'technology', 'health'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Gourmet Coffee Beans',
    advertiserName: 'CoffeeCo',
    destinationUrl: 'https://example.com/coffee-beans',
    categoryTags: ['food', 'coffee', 'gourmet'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Luxury Watch Collection',
    advertiserName: 'TimePiece',
    destinationUrl: 'https://example.com/luxury-watches',
    categoryTags: ['fashion', 'accessories', 'luxury'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Home Gym Equipment',
    advertiserName: 'HomeGym',
    destinationUrl: 'https://example.com/home-gym',
    categoryTags: ['fitness', 'home', 'equipment'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Travel Backpack Pro',
    advertiserName: 'TravelGear',
    destinationUrl: 'https://example.com/travel-backpack',
    categoryTags: ['travel', 'accessories', 'outdoor'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Wireless Earbuds Max',
    advertiserName: 'AudioTech',
    destinationUrl: 'https://example.com/wireless-earbuds',
    categoryTags: ['technology', 'audio', 'electronics'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
  {
    title: 'Plant-Based Protein',
    advertiserName: 'GreenNutrition',
    destinationUrl: 'https://example.com/plant-protein',
    categoryTags: ['food', 'health', 'nutrition'],
    status: 'active' as const,
    creativeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    creativePosterUrl: null,
    creativeDurationSeconds: 15,
  },
]

async function main() {
  console.log('Seeding database...')

  for (const ad of sampleAds) {
    await prisma.ad.create({
      data: ad,
    })
    console.log(`Created ad: ${ad.title}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

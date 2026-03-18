/** WordPress → Astro redirect map. Only thin/mergeable content gets redirected. */
export const redirects: Record<string, { status: 301; destination: string }> = {
  '/rideshare-with-dogs/': { status: 301, destination: '/destinations/' },
  '/guide-to-hike-the-appalachian-trail-with-a-dog/': { status: 301, destination: '/hiking/appalachian-trail-with-dog/' },
  '/dogs-on-the-appalachian-trail/': { status: 301, destination: '/hiking/appalachian-trail-with-dog/' },
  '/blog/': { status: 301, destination: '/' },
  '/guides/': { status: 301, destination: '/' },
  '/backpacking-with-your-dog/': { status: 301, destination: '/hiking/' },
  '/dog-hiking-gear/': { status: 301, destination: '/gear/' },
  '/hiking-dog-health/': { status: 301, destination: '/safety/' },
};

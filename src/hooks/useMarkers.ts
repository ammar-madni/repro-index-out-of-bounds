import { useCallback, useEffect, useState } from 'react'
import { markerCache } from '../utils/cache'

export interface MarkerData {
    key: string
    coordinate: {
        latitude: number
        longitude: number
    }
    title: string
    description: string
}

// Async function to simulate fetching data for markers
const fetchMarkers = async (): Promise<MarkerData[]> => {
    // Simulate a delay for fetching markers
    return new Promise<MarkerData[]>(resolve => {
        setTimeout(() => {
            const markers = []
            for (let i = 0; i < 100; i++) {
                const latitude = 49.9 + Math.random() * (56.8 - 49.9)
                const longitude = -8.2 + Math.random() * (2.6 - -4.2)

                markers.push({
                    key: `marker-${i}`,
                    coordinate: {
                        latitude,
                        longitude,
                    },
                    title: `Marker ${i}`,
                    description: `Description for marker ${i}`,
                })
            }
            resolve(markers)
        }, 1000) // Simulated network delay
    })
}

export interface UseMarkersResult {
    markers: MarkerData[]
    isLoading: boolean
    isRefreshing: boolean
    error: Error | null
    refetch: () => Promise<void>
}

const CACHE_KEY = 'markers_data'

export const useMarkers = (): UseMarkersResult => {
    const [markers, setMarkers] = useState<MarkerData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchAndCacheMarkers = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) {
                setIsRefreshing(true)
            }
            setError(null)

            console.log('Fetching fresh marker data...')
            const freshData = await fetchMarkers()

            // Update cache with fresh data
            markerCache.set(CACHE_KEY, freshData)
            setMarkers(freshData)

            console.log('Marker data updated with fresh data')
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch markers')
            setError(error)
            console.error('Failed to fetch markers:', error)
        } finally {
            if (!isBackground) {
                setIsRefreshing(false)
            }
        }
    }, [])

    const loadMarkers = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Check cache first
            const cachedEntry = markerCache.get<MarkerData[]>(CACHE_KEY)

            if (cachedEntry) {
                // Use cached data immediately
                setMarkers(cachedEntry.data)
                console.log('Loaded markers from cache', { isStale: cachedEntry.isStale })

                if (cachedEntry.isStale) {
                    // Data is stale, fetch fresh data in background
                    console.log('Cache is stale, fetching fresh data in background...')
                    fetchAndCacheMarkers(true) // Background fetch
                }
            } else {
                // No cache, fetch fresh data
                console.log('No cached data found, fetching fresh data...')
                await fetchAndCacheMarkers(false)
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load markers')
            setError(error)
            console.error('Failed to load markers:', error)
        } finally {
            setIsLoading(false)
        }
    }, [fetchAndCacheMarkers])

    const refetch = useCallback(async () => {
        await fetchAndCacheMarkers(false)
    }, [fetchAndCacheMarkers])

    useEffect(() => {
        loadMarkers()
    }, [loadMarkers])

    return {
        markers,
        isLoading,
        isRefreshing,
        error,
        refetch,
    }
}

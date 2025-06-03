import { MMKV } from 'react-native-mmkv'

// Initialize MMKV storage
const storage = new MMKV()

export interface CacheEntry<T> {
    data: T
    timestamp: number
    isStale: boolean
}

export class StaleWhileRevalidateCache {
    private staleTime: number

    constructor(staleTimeInMs: number = 3 * 60 * 1000) {
        // Default 3 minutes
        this.staleTime = staleTimeInMs
    }

    /**
     * Get data from cache. Returns null if not found.
     */
    get<T>(key: string): CacheEntry<T> | null {
        try {
            const cached = storage.getString(key)
            if (!cached) return null

            const entry = JSON.parse(cached) as CacheEntry<T>
            const now = Date.now()
            const isStale = now - entry.timestamp > this.staleTime

            return {
                ...entry,
                isStale,
            }
        } catch (error) {
            console.warn('Cache get error:', error)
            return null
        }
    }

    /**
     * Set data in cache with current timestamp
     */
    set<T>(key: string, data: T): void {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                isStale: false,
            }
            storage.set(key, JSON.stringify(entry))
        } catch (error) {
            console.warn('Cache set error:', error)
        }
    }

    /**
     * Remove data from cache
     */
    remove(key: string): void {
        try {
            storage.delete(key)
        } catch (error) {
            console.warn('Cache remove error:', error)
        }
    }

    /**
     * Clear all cache data
     */
    clear(): void {
        try {
            storage.clearAll()
        } catch (error) {
            console.warn('Cache clear error:', error)
        }
    }

    /**
     * Check if data exists and is fresh (not stale)
     */
    isFresh(key: string): boolean {
        const entry = this.get(key)
        return entry !== null && !entry.isStale
    }

    /**
     * Check if data exists but is stale
     */
    isStale(key: string): boolean {
        const entry = this.get(key)
        return entry !== null && entry.isStale
    }
}

// Export a default instance with 3-minute stale time
export const markerCache = new StaleWhileRevalidateCache(3 * 60 * 1000)

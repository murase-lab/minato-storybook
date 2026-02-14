const DB_NAME = 'minato-storybook'
const DB_VERSION = 1
const MEDIA_STORE = 'media'
const META_STORE = 'meta'

export interface MediaItem {
  id: string // e.g. "month-02-photo-0", "month-02-video", "cover-photo"
  monthKey: string // e.g. "02", "cover", "finale"
  type: 'photo' | 'video'
  blob: Blob
  thumbnail?: Blob
  createdAt: number
}

export interface MonthMeta {
  monthKey: string
  text?: string
  photoOrder?: string[] // ordered MediaItem ids
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        const mediaStore = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' })
        mediaStore.createIndex('monthKey', 'monthKey', { unique: false })
        mediaStore.createIndex('type', 'type', { unique: false })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'monthKey' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Media operations
export async function saveMedia(item: MediaItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getMedia(id: string): Promise<MediaItem | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly')
    const request = tx.objectStore(MEDIA_STORE).get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getMediaByMonth(monthKey: string): Promise<MediaItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly')
    const index = tx.objectStore(MEDIA_STORE).index('monthKey')
    const request = index.getAll(monthKey)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Meta operations
export async function saveMeta(meta: MonthMeta): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put(meta)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getMeta(monthKey: string): Promise<MonthMeta | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly')
    const request = tx.objectStore(META_STORE).get(monthKey)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllMeta(): Promise<MonthMeta[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly')
    const request = tx.objectStore(META_STORE).getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Helper: create thumbnail from image blob
export async function createThumbnail(blob: Blob, maxSize = 200): Promise<Blob> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((thumb) => {
        URL.revokeObjectURL(url)
        resolve(thumb || blob)
      }, 'image/jpeg', 0.7)
    }
    img.src = url
  })
}

// Helper: generate unique id for media
export function generateMediaId(monthKey: string, type: 'photo' | 'video', index?: number): string {
  const suffix = index !== undefined ? `-${index}` : `-${Date.now()}`
  return `month-${monthKey}-${type}${suffix}`
}

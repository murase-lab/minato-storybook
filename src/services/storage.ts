import {
  uploadMedia,
  deleteCloudMedia,
  downloadMedia,
  uploadMeta,
  downloadMeta,
  listCloudMedia,
  listCloudMeta,
  isCloudEnabled,
} from './supabase'

const DB_NAME = 'minato-storybook'
const DB_VERSION = 1
const MEDIA_STORE = 'media'
const META_STORE = 'meta'

export interface MediaItem {
  id: string
  monthKey: string
  type: 'photo' | 'video'
  blob: Blob
  thumbnail?: Blob
  createdAt: number
}

export interface MonthMeta {
  monthKey: string
  text?: string
  photoOrder?: string[]
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

// ---- Media operations (local + cloud sync) ----

export async function saveMedia(item: MediaItem): Promise<void> {
  // Save to IndexedDB
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  // Sync to cloud (non-blocking)
  if (isCloudEnabled) {
    uploadMedia(item.id, item.blob).catch((e) => console.error('Media upload failed:', item.id, e))
    if (item.thumbnail) {
      uploadMedia(`${item.id}_thumb`, item.thumbnail).catch((e) => console.error('Thumbnail upload failed:', item.id, e))
    }
  }
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
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  // Sync delete to cloud
  if (isCloudEnabled) {
    deleteCloudMedia(id).catch((e) => console.error('Media delete failed:', id, e))
    deleteCloudMedia(`${id}_thumb`).catch((e) => console.error('Thumbnail delete failed:', id, e))
  }
}

// ---- Meta operations (local + cloud sync) ----

export async function saveMeta(meta: MonthMeta): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put(meta)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  // Sync to cloud
  if (isCloudEnabled) {
    uploadMeta(meta.monthKey, meta as unknown as Record<string, unknown>).catch((e) => console.error('Meta upload failed:', meta.monthKey, e))
  }
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

// ---- Cloud -> Local sync (pull data from Supabase to IndexedDB) ----

export async function syncFromCloud(): Promise<boolean> {
  if (!isCloudEnabled) return false

  try {
    // 1. Sync metadata
    const metaKeys = await listCloudMeta()
    for (const monthKey of metaKeys) {
      const existing = await getMeta(monthKey)
      const cloudMeta = await downloadMeta(monthKey)
      if (cloudMeta) {
        const cloudText = cloudMeta.text as string | undefined
        const cloudOrder = cloudMeta.photoOrder as string[] | undefined
        if (!existing) {
          await saveMetaLocal({ monthKey, text: cloudText, photoOrder: cloudOrder })
        } else {
          // Merge: fill in fields missing locally with cloud values
          const mergedText = existing.text || cloudText
          const mergedOrder = existing.photoOrder?.length ? existing.photoOrder : cloudOrder
          if (mergedText !== existing.text || mergedOrder !== existing.photoOrder) {
            await saveMetaLocal({ ...existing, text: mergedText, photoOrder: mergedOrder })
          }
        }
      }
    }

    // 2. Sync media files
    const cloudFiles = await listCloudMedia()
    const mediaFiles = cloudFiles.filter((f) => !f.endsWith('_thumb'))

    for (const fileName of mediaFiles) {
      const id = fileName
      const existing = await getMedia(id)
      if (!existing) {
        const blob = await downloadMedia(id)
        if (blob) {
          // Parse id to extract monthKey and type
          // Format: month-{monthKey}-{type}-{timestamp}
          const match = id.match(/^month-(.+?)-(photo|video)-/)
          if (match) {
            const thumbBlob = await downloadMedia(`${id}_thumb`)
            const item: MediaItem = {
              id,
              monthKey: match[1],
              type: match[2] as 'photo' | 'video',
              blob,
              thumbnail: thumbBlob || undefined,
              createdAt: Date.now(),
            }
            await saveMediaLocal(item)
          }
        }
      }
    }

    return true
  } catch (err) {
    console.error('Cloud sync failed:', err)
    return false
  }
}

// Local-only save (no cloud sync, used during pull)
async function saveMediaLocal(item: MediaItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function saveMetaLocal(meta: MonthMeta): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put(meta)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ---- Helpers ----

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

export function generateMediaId(monthKey: string, type: 'photo' | 'video', index?: number): string {
  const suffix = index !== undefined ? `-${index}` : `-${Date.now()}`
  return `month-${monthKey}-${type}${suffix}`
}

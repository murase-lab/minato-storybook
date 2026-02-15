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
  updatedAt?: number
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

  // Sync to cloud (await to ensure it completes)
  if (isCloudEnabled) {
    try {
      await uploadMedia(item.id, item.blob)
      if (item.thumbnail) {
        await uploadMedia(`${item.id}_thumb`, item.thumbnail)
      }
    } catch (e) {
      console.error('Media upload failed:', item.id, e)
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

  // Sync delete to cloud (await)
  if (isCloudEnabled) {
    try {
      await deleteCloudMedia(id)
      await deleteCloudMedia(`${id}_thumb`)
    } catch (e) {
      console.error('Media delete failed:', id, e)
    }
  }
}

// ---- Meta operations (local + cloud sync) ----

export async function saveMeta(meta: MonthMeta): Promise<void> {
  // Add updatedAt timestamp
  const metaWithTimestamp = { ...meta, updatedAt: Date.now() }

  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put(metaWithTimestamp)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  // Sync to cloud (await)
  if (isCloudEnabled) {
    try {
      await uploadMeta(metaWithTimestamp.monthKey, metaWithTimestamp as unknown as Record<string, unknown>)
    } catch (e) {
      console.error('Meta upload failed:', metaWithTimestamp.monthKey, e)
    }
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

// ---- Get all local media IDs ----

async function getAllLocalMediaIds(): Promise<Set<string>> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly')
    const request = tx.objectStore(MEDIA_STORE).getAllKeys()
    request.onsuccess = () => resolve(new Set(request.result.map(String)))
    request.onerror = () => reject(request.error)
  })
}

// ---- Cloud sync: bidirectional ----

export async function syncFromCloud(): Promise<boolean> {
  if (!isCloudEnabled) return false

  try {
    console.log('[Sync] Starting cloud sync...')

    // 1. Sync metadata - cloud wins for newer data
    const cloudMetaKeys = await listCloudMeta()
    const localAllMeta = await getAllMeta()
    const localMetaMap = new Map(localAllMeta.map(m => [m.monthKey, m]))

    for (const monthKey of cloudMetaKeys) {
      const cloudMeta = await downloadMeta(monthKey)
      if (!cloudMeta) continue

      const local = localMetaMap.get(monthKey)
      const cloudUpdatedAt = (cloudMeta.updatedAt as number) || 0
      const localUpdatedAt = local?.updatedAt || 0

      // Cloud is newer OR local doesn't exist -> use cloud
      if (!local || cloudUpdatedAt >= localUpdatedAt) {
        await saveMetaLocal({
          monthKey,
          text: cloudMeta.text as string | undefined,
          photoOrder: cloudMeta.photoOrder as string[] | undefined,
          updatedAt: cloudUpdatedAt || Date.now(),
        })
        console.log('[Sync] Meta updated from cloud:', monthKey)
      }
    }

    // Upload local meta that's not in cloud or is newer
    for (const local of localAllMeta) {
      if (!cloudMetaKeys.includes(local.monthKey)) {
        await uploadMeta(local.monthKey, local as unknown as Record<string, unknown>)
        console.log('[Sync] Meta uploaded to cloud:', local.monthKey)
      }
    }

    // 2. Sync media files - bidirectional
    const cloudFiles = await listCloudMedia()
    const cloudMediaIds = new Set(cloudFiles.filter(f => !f.endsWith('_thumb')))
    const localMediaIds = await getAllLocalMediaIds()

    // Download from cloud -> local (files in cloud but not local)
    for (const id of cloudMediaIds) {
      if (!localMediaIds.has(id)) {
        const blob = await downloadMedia(id)
        if (blob) {
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
            console.log('[Sync] Media downloaded:', id)
          }
        }
      }
    }

    // Upload local -> cloud (files in local but not cloud)
    for (const id of localMediaIds) {
      if (!cloudMediaIds.has(id)) {
        const item = await getMedia(id)
        if (item) {
          await uploadMedia(id, item.blob)
          if (item.thumbnail) {
            await uploadMedia(`${id}_thumb`, item.thumbnail)
          }
          console.log('[Sync] Media uploaded:', id)
        }
      }
    }

    // Delete local files that were deleted from cloud
    // (files in local but not in cloud, AND not recently created locally)
    // We check if the file was uploaded above - if it was, it's now in cloud
    // If it wasn't uploaded (upload failed), don't delete locally
    // Re-check cloud state after uploads
    const updatedCloudFiles = await listCloudMedia()
    const updatedCloudIds = new Set(updatedCloudFiles.filter(f => !f.endsWith('_thumb')))
    for (const id of localMediaIds) {
      if (!updatedCloudIds.has(id)) {
        // File is not in cloud even after upload attempt -> was deleted on another device
        await deleteMediaLocal(id)
        console.log('[Sync] Media deleted locally (removed from cloud):', id)
      }
    }

    console.log('[Sync] Cloud sync completed')
    return true
  } catch (err) {
    console.error('[Sync] Cloud sync failed:', err)
    return false
  }
}

// Local-only operations (no cloud sync, used during sync)

async function saveMediaLocal(item: MediaItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function deleteMediaLocal(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite')
    tx.objectStore(MEDIA_STORE).delete(id)
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

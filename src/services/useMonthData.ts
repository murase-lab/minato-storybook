import { useState, useEffect, useCallback } from 'react'
import {
  getMediaByMonth,
  getMeta,
  saveMedia,
  saveMeta,
  deleteMedia,
  createThumbnail,
  generateMediaId,
} from './storage'
import type { MediaItem } from './storage'

export interface MonthMedia {
  photos: { id: string; url: string }[]
  video?: { id: string; url: string }
  text?: string
  loading: boolean
}

export function useMonthData(monthKey: string, defaultText: string) {
  const [data, setData] = useState<MonthMedia>({
    photos: [],
    video: undefined,
    text: undefined,
    loading: true,
  })

  const loadData = useCallback(async () => {
    try {
      const [mediaItems, meta] = await Promise.all([
        getMediaByMonth(monthKey),
        getMeta(monthKey),
      ])

      const photos: { id: string; url: string }[] = []
      let video: { id: string; url: string } | undefined

      // Sort by photo order if available
      const photoOrder = meta?.photoOrder || []

      const photoItems = mediaItems
        .filter((m) => m.type === 'photo')
        .sort((a, b) => {
          const aIdx = photoOrder.indexOf(a.id)
          const bIdx = photoOrder.indexOf(b.id)
          if (aIdx === -1 && bIdx === -1) return a.createdAt - b.createdAt
          if (aIdx === -1) return 1
          if (bIdx === -1) return -1
          return aIdx - bIdx
        })

      for (const item of photoItems) {
        photos.push({ id: item.id, url: URL.createObjectURL(item.blob) })
      }

      const videoItem = mediaItems.find((m) => m.type === 'video')
      if (videoItem) {
        video = { id: videoItem.id, url: URL.createObjectURL(videoItem.blob) }
      }

      setData({
        photos,
        video,
        text: meta?.text,
        loading: false,
      })
    } catch (err) {
      console.error('Failed to load month data:', err)
      setData((prev) => ({ ...prev, loading: false }))
    }
  }, [monthKey])

  useEffect(() => {
    loadData()
    return () => {
      // Cleanup object URLs
      setData((prev) => {
        prev.photos.forEach((p) => URL.revokeObjectURL(p.url))
        if (prev.video) URL.revokeObjectURL(prev.video.url)
        return prev
      })
    }
  }, [loadData])

  const addPhoto = useCallback(
    async (file: File) => {
      const id = generateMediaId(monthKey, 'photo')
      const thumbnail = await createThumbnail(file)
      const item: MediaItem = {
        id,
        monthKey,
        type: 'photo',
        blob: file,
        thumbnail,
        createdAt: Date.now(),
      }
      await saveMedia(item)

      // Update photo order
      const meta = (await getMeta(monthKey)) || { monthKey }
      const order = meta.photoOrder || []
      order.push(id)
      await saveMeta({ ...meta, photoOrder: order })

      await loadData()
    },
    [monthKey, loadData]
  )

  const addVideo = useCallback(
    async (file: File) => {
      // Remove existing video if any
      const existing = await getMediaByMonth(monthKey)
      const oldVideo = existing.find((m) => m.type === 'video')
      if (oldVideo) await deleteMedia(oldVideo.id)

      const id = generateMediaId(monthKey, 'video')
      const item: MediaItem = {
        id,
        monthKey,
        type: 'video',
        blob: file,
        createdAt: Date.now(),
      }
      await saveMedia(item)
      await loadData()
    },
    [monthKey, loadData]
  )

  const removePhoto = useCallback(
    async (photoId: string) => {
      await deleteMedia(photoId)
      const meta = (await getMeta(monthKey)) || { monthKey }
      const order = (meta.photoOrder || []).filter((id) => id !== photoId)
      await saveMeta({ ...meta, photoOrder: order })
      await loadData()
    },
    [monthKey, loadData]
  )

  const removeVideo = useCallback(async () => {
    const existing = await getMediaByMonth(monthKey)
    const videoItem = existing.find((m) => m.type === 'video')
    if (videoItem) {
      await deleteMedia(videoItem.id)
      await loadData()
    }
  }, [monthKey, loadData])

  const updateText = useCallback(
    async (text: string) => {
      const meta = (await getMeta(monthKey)) || { monthKey }
      await saveMeta({ ...meta, monthKey, text })
      setData((prev) => ({ ...prev, text }))
    },
    [monthKey]
  )

  const displayText = data.text || defaultText

  return {
    ...data,
    displayText,
    addPhoto,
    addVideo,
    removePhoto,
    removeVideo,
    updateText,
  }
}

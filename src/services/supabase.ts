import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

console.log('[Supabase] URL:', supabaseUrl ? 'set' : 'missing')
console.log('[Supabase] Key:', supabaseAnonKey ? `set (${supabaseAnonKey.substring(0, 10)}...)` : 'missing')

function initSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey)
    console.log('[Supabase] Client created successfully')
    return client
  } catch (err) {
    console.error('[Supabase] Failed to create client:', err)
    return null
  }
}

export const supabase = initSupabase()
export const isCloudEnabled = !!supabase

// Storage bucket name
const BUCKET = 'storybook-media'

// --- Media file operations ---

export async function uploadMedia(id: string, blob: Blob): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`media/${id}`, blob, { upsert: true })
  if (error) console.error('Upload failed:', id, error.message)
}

export async function downloadMedia(id: string): Promise<Blob | null> {
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(`media/${id}`)
  if (error) {
    console.error('Download failed:', id, error.message)
    return null
  }
  return data
}

export async function deleteCloudMedia(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([`media/${id}`])
  if (error) console.error('Delete failed:', id, error.message)
}

// --- Metadata (JSON) operations ---
// Store metadata as a JSON file in storage (no DB table needed)

export async function uploadMeta(monthKey: string, meta: Record<string, unknown>): Promise<void> {
  if (!supabase) return
  const blob = new Blob([JSON.stringify(meta)], { type: 'application/json' })
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`meta/${monthKey}.json`, blob, { upsert: true })
  if (error) console.error('Meta upload failed:', monthKey, error.message)
}

export async function downloadMeta(monthKey: string): Promise<Record<string, unknown> | null> {
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(`meta/${monthKey}.json`)
  if (error) return null
  try {
    return JSON.parse(await data.text())
  } catch {
    return null
  }
}

// --- Sync: pull all cloud data into IndexedDB ---

export async function listCloudMedia(): Promise<string[]> {
  if (!supabase) return []
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('media', { limit: 500 })
  if (error) {
    console.error('List failed:', error.message)
    return []
  }
  return data.map((f) => f.name)
}

export async function listCloudMeta(): Promise<string[]> {
  if (!supabase) return []
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('meta', { limit: 100 })
  if (error) {
    console.error('List meta failed:', error.message)
    return []
  }
  return data.map((f) => f.name.replace('.json', ''))
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { normalizeRole } from '@/lib/role'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (normalizeRole(profile?.role) !== 'admin') throw new Error('Forbidden')
  return { supabase, user }
}

export async function addContent(formData: FormData) {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let user: { id: string }
  try {
    const result = await requireAdmin()
    supabase = result.supabase
    user = result.user
  } catch (e: any) {
    return { success: false, error: e.message }
  }

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const url = formData.get('url') as string
  const sector_id = formData.get('sector_id') as string
  const cover_url = (formData.get('cover_url') as string) || null
  const description = (formData.get('description') as string) || null
  const due_date = (formData.get('due_date') as string) || null
  const duration_raw = formData.get('duration_minutes') as string
  const duration_minutes = duration_raw ? parseInt(duration_raw, 10) : null

  const { error } = await supabase.from('contents').insert({
    title,
    type,
    url,
    cover_url,
    description,
    due_date,
    duration_minutes,
    sector_id: sector_id === 'global' ? null : sector_id,
    created_by: user.id
  })

  if (error) {
    console.error('Error adding content', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteContent(contentId: string) {
  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    const result = await requireAdmin()
    supabase = result.supabase
  } catch (e: any) {
    return { success: false, error: e.message }
  }
  
  const { error } = await supabase.from('contents').delete().eq('id', contentId)

  if (error) {
    console.error('Error deleting content', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateContent(contentId: string, formData: FormData) {
  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    const result = await requireAdmin()
    supabase = result.supabase
  } catch (e: any) {
    return { success: false, error: e.message }
  }

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const url = formData.get('url') as string
  const sector_id = formData.get('sector_id') as string
  const cover_url = (formData.get('cover_url') as string) || null
  const description = (formData.get('description') as string) || null
  const due_date = (formData.get('due_date') as string) || null
  const duration_raw = formData.get('duration_minutes') as string
  const duration_minutes = duration_raw ? parseInt(duration_raw, 10) : null

  const { error } = await supabase.from('contents').update({
    title,
    type,
    url,
    cover_url,
    description,
    due_date,
    duration_minutes,
    sector_id: sector_id === 'global' ? null : sector_id,
  }).eq('id', contentId)

  if (error) {
    console.error('Error updating content', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addSector(formData: FormData) {
  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    const result = await requireAdmin()
    supabase = result.supabase
  } catch (e: any) {
    return { success: false, error: e.message }
  }

  const name = formData.get('name') as string

  if (!name?.trim()) return { success: false, error: 'Nome do setor é obrigatório' }

  const { error } = await supabase.from('sectors').insert({ name: name.trim() })

  if (error) {
    console.error('Error adding sector', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteSector(sectorId: string) {
  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    const result = await requireAdmin()
    supabase = result.supabase
  } catch (e: any) {
    return { success: false, error: e.message }
  }

  const { error } = await supabase.from('sectors').delete().eq('id', sectorId)

  if (error) {
    console.error('Error deleting sector', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

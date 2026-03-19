'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addContent(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const url = formData.get('url') as string
  const sector_id = formData.get('sector_id') as string

  const { error } = await supabase.from('contents').insert({
    title,
    type,
    url,
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
  const supabase = await createClient()
  
  const { error } = await supabase.from('contents').delete().eq('id', contentId)

  if (error) {
    console.error('Error deleting content', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addSector(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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
  const supabase = await createClient()

  const { error } = await supabase.from('sectors').delete().eq('id', sectorId)

  if (error) {
    console.error('Error deleting sector', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    redirect('/signup?error=true&message=' + encodeURIComponent(error.message))
  }

  // Criar registro na tabela profiles para o novo usuário
  if (signUpData.user) {
    await supabase.from('profiles').upsert({
      id: signUpData.user.id,
      name,
      role: 'user',
    }, { onConflict: 'id' })
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

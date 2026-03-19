import { redirect } from 'next/navigation'

export default function Home() {
  // O Middleware cuidará do redirecionamento
  redirect('/login')
}

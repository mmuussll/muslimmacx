import { createClient } from '@/utils/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {user ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome, {user.email}</h1>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome to Debt Management App</h1>
          <Link href="/login" className="mt-4 inline-block px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Login
          </Link>
        </div>
      )}
    </main>
  );
}
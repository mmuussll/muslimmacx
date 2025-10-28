import { createClient } from '@/utils/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  const { data: totalDebtData } = await supabase
    .from('debts')
    .select('total_debt');

  const totalDebt = totalDebtData?.reduce((acc, debt) => acc + Number(debt.total_debt), 0) ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 py-4 bg-white border-b sm:px-6">
        <h1 className="text-xl font-semibold leading-tight text-gray-900">
          Dashboard
        </h1>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{customerCount}</p>
          </div>
          <div className="p-5 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Debt</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${totalDebt.toFixed(2)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
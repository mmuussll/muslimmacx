'use client'

import { createClient } from '@/utils/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AddDebtForm from './add-debt-form';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/utils/supabase';

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const getDebts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect('/login');
      }

      const { data: debtsData } = await supabase.from('debts').select(`
        id,
        total_debt,
        last_updated_at,
        customers (
          name
        )
      `);
      setDebts(debtsData || []);
    };
    getDebts();
  }, [supabase]);


  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold leading-tight text-gray-900">Debts</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {showAddForm ? 'Cancel' : 'Add Debt'}
        </button>
      </div>

      {showAddForm && <AddDebtForm />}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total Debt</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Last Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {debts.map((debt: any) => (
              <tr key={debt.id}>
                <td className="px-6 py-4 whitespace-nowrap">{debt.customers.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${Number(debt.total_debt).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(debt.last_updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
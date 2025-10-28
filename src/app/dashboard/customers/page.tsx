'use client';

import { createClient } from '@/utils/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AddCustomerForm from './add-customer-form';
import { useState, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/utils/supabase';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createSupabaseBrowserClient();


  useEffect(() => {
    const getStoreAndCustomers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect('/login');
      }

      const { data: store } = await supabase.from('stores').select('id').single();
      if (store) {
        setStoreId(store.id);
        const { data: customersData } = await supabase.from('customers').select('*').eq('store_id', store.id);
        setCustomers(customersData || []);
      }
    };
    getStoreAndCustomers();
  }, [supabase]);

  const filteredCustomers = useMemo(() =>
    customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [customers, searchTerm]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold leading-tight text-gray-900">Customers</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {showAddForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showAddForm && storeId && <AddCustomerForm storeId={storeId} />}

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Address</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.phone_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
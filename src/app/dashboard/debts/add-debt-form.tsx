'use client'

import { createSupabaseBrowserClient } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Customer {
    id: number;
    name: string;
}

export default function AddDebtForm() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const fetchCustomers = async () => {
            const { data } = await supabase.from('customers').select('id, name');
            setCustomers(data || []);
        };
        fetchCustomers();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // First, find or create the debt record for the customer
        const { data: debt, error: debtError } = await supabase
            .from('debts')
            .select('id, total_debt')
            .eq('customer_id', selectedCustomer)
            .single();

        let debtId: number;
        let currentDebt = 0;

        if (debt) {
            debtId = debt.id;
            currentDebt = Number(debt.total_debt);
        } else if (debtError && debtError.code === 'PGRST116') { // 'PGRST116' is the code for 'exact-one-row-not-found'
            const { data: newDebt, error: newDebtError } = await supabase
                .from('debts')
                .insert({ customer_id: selectedCustomer, total_debt: 0 })
                .select()
                .single();

            if (newDebtError || !newDebt) {
                console.error('Error creating new debt record:', newDebtError);
                return; // or handle error appropriately
            }
            debtId = newDebt.id;
        } else {
            console.error('Error fetching debt record:', debtError);
            return;
        }

        // Add the new transaction
        await supabase.from('transactions').insert({
            debt_id: debtId,
            amount: parseFloat(amount),
            type: 'debit',
            description,
        });

        // Update the total debt
        const newTotalDebt = currentDebt + parseFloat(amount);
        await supabase
            .from('debts')
            .update({ total_debt: newTotalDebt, last_updated_at: new Date().toISOString() })
            .eq('id', debtId);

        router.refresh();
    };


    return (
        <form onSubmit={handleSubmit} className="p-4 mt-4 space-y-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-medium">Add New Debt</h3>
            <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer</label>
                <select
                    id="customer"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                >
                    <option value="" disabled>Select a customer</option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                    step="0.01"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                Add Debt
            </button>
        </form>
    );
}
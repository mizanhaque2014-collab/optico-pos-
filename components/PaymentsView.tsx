import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { paymentService, PaymentRecord } from '@/lib/services/paymentService';
import { Search, FileText, IndianRupee, Filter } from 'lucide-react';
import { useStore } from '@/lib/store';

export function PaymentsView() {
  const { session } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    paymentService.loadPaymentHistory().then(data => {
      setPayments(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const q = search.toLowerCase();
      return (p.invoiceNumber?.toLowerCase() || '').includes(q) ||
             (p.remarks?.toLowerCase() || '').includes(q) ||
             (p.mode?.toLowerCase() || '').includes(q);
    });
  }, [payments, search]);

  const totalCollected = filtered.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <IndianRupee className="text-green-400" size={28} />
            Payment Tracking
          </h2>
          <p className="text-white/50 text-sm mt-1">View all payment records and collections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
          <p className="text-sm text-white/50 mb-1">Total Collected (Filtered)</p>
          <p className="text-3xl font-bold text-green-400">₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
          <p className="text-sm text-white/50 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-white">{filtered.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder="Search invoice number, mode or remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
      </div>

      <div className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-800/50">
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Invoice No</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Mode</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Amount</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">Loading payments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">No payments found.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-sm text-white/80">{p.date ? new Date(p.date).toLocaleString() : 'N/A'}</td>
                    <td className="p-4 text-sm text-green-400 font-mono">{p.invoiceNumber}</td>
                    <td className="p-4 text-sm text-white">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs">{p.mode || 'Cash'}</span>
                    </td>
                    <td className="p-4 text-sm text-white font-bold text-right">₹{p.amount?.toLocaleString() || 0}</td>
                    <td className="p-4 text-xs text-white/50 max-w-[200px] truncate" title={p.remarks}>{p.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

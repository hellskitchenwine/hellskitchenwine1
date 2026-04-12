// import { useEffect, useState } from 'react';
// import { Database, Search, Phone, Star, Calendar } from 'lucide-react';
// import { supabase } from '../lib/supabase';
// import { Customer } from '../types/database';

// interface AllCustomersProps {
//   refreshTrigger: number;
// }

// export function AllCustomers({ refreshTrigger }: AllCustomersProps) {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     loadCustomers();
//   }, [refreshTrigger]);

//   const loadCustomers = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('customers')
//         .select('*')
//         .order('points', { ascending: false });

//       if (error) throw error;
//       setCustomers(data || []);
//     } catch (error) {
//       console.error('Error loading customers:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredCustomers = customers.filter((customer) =>
//     customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     customer.phone.includes(searchQuery)
//   );

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="bg-white rounded-lg shadow">
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <Database className="w-6 h-6 text-blue-600" />
//             <h2 className="text-xl font-semibold">All Customers</h2>
//           </div>
//           <div className="text-sm text-gray-600">
//             Total: {filteredCustomers.length} customers
//           </div>
//         </div>

//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by name or phone..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         {loading ? (
//           <div className="p-8 text-center text-gray-500">Loading customers...</div>
//         ) : filteredCustomers.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">No customers found</div>
//         ) : (
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Points
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Last Updated
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Redemption
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredCustomers.map((customer) => (
//                 <tr key={customer.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">
//                       {customer.first_name}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2 text-sm text-gray-700">
//                       <Phone className="w-4 h-4 text-gray-400" />
//                       {customer.phone}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
//                       <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
//                       {customer.points}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       {formatDate(customer.updated_at)}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {customer.opted_out ? (
//                       <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
//                         Opted Out
//                       </span>
//                     ) : (
//                       <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
//                         Active
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {customer.recently_redeemed ? (
//                       <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
//                         Recently Redeemed
//                       </span>
//                     ) : (
//                       <span className="text-xs text-gray-400">-</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from 'react';
import { Database, Search, Phone, Star, Calendar, X, MessageSquare, Gift, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Customer, Message, RedemptionHistory } from '../types/database';

interface AllCustomersProps {
  refreshTrigger: number;
}

const PAGE_SIZE = 200;

export function AllCustomers({ refreshTrigger }: AllCustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [statusfilter, setStatusFilter] = useState<'all' | 'active' | 'opted_out'>('all');
  const [recentlyRedeemedfilter, setRecentlyRedeeemedFilter] = useState<
    'all' | 'recently_redeemed' | 'not_redeemed'
  >('all');

  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Customer detail drawer
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [drawerMessages, setDrawerMessages] = useState<Message[]>([]);
  const [drawerRedemptions, setDrawerRedemptions] = useState<RedemptionHistory[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Reset when refreshTrigger changes
  useEffect(() => {
    setCustomers([]);
    setPage(0);
    setHasMore(true);
  }, [refreshTrigger]);

  // Reset immediately when dropdown filters change
  useEffect(() => {
    setCustomers([]);
    setPage(0);
    setHasMore(true);
  }, [statusfilter, recentlyRedeemedfilter]);

  // Reset with debounce when search changes
  useEffect(() => {
    const t = setTimeout(() => {
      setCustomers([]);
      setPage(0);
      setHasMore(true);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    loadCustomers(page === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshTrigger, searchQuery, statusfilter, recentlyRedeemedfilter]);

  const loadCustomers = async (isFirstPage: boolean) => {
    try {
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('points', { ascending: false })
        .range(from, to);

      // Server-side search (name or phone)
      const q = searchQuery.trim();
      if (q) {
        query = query.or(`first_name.ilike.%${q}%,phone.ilike.%${q}%`);
      }

      // Status filter
      if (statusfilter === 'active') {
        query = query.eq('opted_out', false);
      } else if (statusfilter === 'opted_out') {
        query = query.eq('opted_out', true);
      }

      // Recently redeemed filter
      if (recentlyRedeemedfilter === 'recently_redeemed') {
        query = query.eq('recently_redeemed', true);
      } else if (recentlyRedeemedfilter === 'not_redeemed') {
        query = query.eq('recently_redeemed', false);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (typeof count === 'number') setTotalCount(count);

      const pageData = data || [];
      setCustomers((prev) => (isFirstPage ? pageData : [...prev, ...pageData]));
      setHasMore(pageData.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const openDrawer = async (customer: Customer) => {
    setDrawerCustomer(customer);
    setDrawerLoading(true);
    setDrawerMessages([]);
    setDrawerRedemptions([]);

    const [{ data: msgs }, { data: redemptions }] = await Promise.all([
      supabase
        .from('messages')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('redemption_history')
        .select('*')
        .eq('customer_id', customer.id)
        .order('detected_at', { ascending: false }),
    ]);

    setDrawerMessages((msgs as Message[]) || []);
    setDrawerRedemptions((redemptions as RedemptionHistory[]) || []);
    setDrawerLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });

  const shownCountText = useMemo(() => {
    if (totalCount === null) return `Showing: ${customers.length}`;
    return `Showing: ${customers.length} / ${totalCount}`;
  }, [customers.length, totalCount]);

  // Build a merged, date-sorted timeline for the drawer
  const drawerTimeline = useMemo(() => {
    type Entry =
      | { kind: 'message'; date: string; data: Message }
      | { kind: 'redemption'; date: string; data: RedemptionHistory };

    const entries: Entry[] = [
      ...drawerMessages.map(m => ({ kind: 'message' as const, date: m.created_at, data: m })),
      ...drawerRedemptions.map(r => ({ kind: 'redemption' as const, date: r.detected_at, data: r })),
    ];
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [drawerMessages, drawerRedemptions]);

  return (
    <div className="bg-white rounded-lg shadow relative">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">All Customers</h2>
          </div>
          <div className="text-sm text-gray-600">{shownCountText}</div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusfilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="opted_out">Opted Out</option>
          </select>

          <select
            value={recentlyRedeemedfilter}
            onChange={(e) => setRecentlyRedeeemedFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Redemption</option>
            <option value="recently_redeemed">Recently Redeemed</option>
            <option value="not_redeemed">Not Redeemed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No customers found</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redemptions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => openDrawer(customer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.first_name}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {customer.points}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(customer.updated_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.opted_out ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Opted Out</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.total_redemptions > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                          <Gift className="w-4 h-4" />
                          {customer.total_redemptions}×
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 flex items-center justify-center">
              {hasMore ? (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loadingMore}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              ) : (
                <div className="text-sm text-gray-500">No more customers</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Customer detail drawer */}
      {drawerCustomer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setDrawerCustomer(null)}
          />

          {/* Slide-in panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{drawerCustomer.first_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{drawerCustomer.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  {drawerCustomer.opted_out ? (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Opted Out</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
                  )}
                </div>
              </div>
              <button onClick={() => setDrawerCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold text-gray-900">{drawerCustomer.points}</span>
                </div>
                <div className="text-xs text-gray-500">Current Points</div>
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {drawerLoading ? '…' : drawerMessages.filter(m => m.status === 'sent').length}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Messages Sent</div>
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span className="text-xl font-bold text-gray-900">{drawerCustomer.total_redemptions}</span>
                </div>
                <div className="text-xs text-gray-500">Total Redemptions</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-5">
              {drawerLoading ? (
                <div className="text-center text-gray-400 py-10">Loading history...</div>
              ) : drawerTimeline.length === 0 ? (
                <div className="text-center text-gray-400 py-10">No history yet for this customer.</div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity Timeline</p>
                  {drawerTimeline.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 ${
                        entry.kind === 'redemption'
                          ? 'bg-amber-50 border-amber-200'
                          : entry.data.status === 'sent'
                          ? 'bg-green-50 border-green-100'
                          : entry.data.status === 'failed'
                          ? 'bg-red-50 border-red-100'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {entry.kind === 'redemption' ? (
                            <Gift className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            {entry.kind === 'redemption' ? (
                              <>
                                <p className="text-sm font-semibold text-amber-800">Redeemed Reward</p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                  Points: <strong>{entry.data.points_before}</strong> → <strong>{entry.data.points_after}</strong>
                                  <span className="ml-2 text-amber-600">
                                    (−{entry.data.points_before - entry.data.points_after} pts)
                                  </span>
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium text-gray-800">SMS</p>
                                  <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${
                                    entry.data.status === 'sent' ? 'bg-green-100 text-green-700' :
                                    entry.data.status === 'failed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>{entry.data.status}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{entry.data.message_body}</p>
                                {entry.data.error_message && (
                                  <p className="text-xs text-red-600 mt-1">{entry.data.error_message}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                          {formatDateTime(entry.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
import { Database, Search, Phone, Star, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Customer } from '../types/database';

interface AllCustomersProps {
  refreshTrigger: number;
}

const PAGE_SIZE = 200;

export function AllCustomers({ refreshTrigger }: AllCustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // When refreshTrigger changes, reset everything
  useEffect(() => {
    setCustomers([]);
    setPage(0);
    setHasMore(true);
  }, [refreshTrigger]);

  // When search changes, reset paging
  useEffect(() => {
    const t = setTimeout(() => {
      setCustomers([]);
      setPage(0);
      setHasMore(true);
    }, 300); // small debounce for typing
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    loadCustomers(page === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshTrigger, searchQuery]);

  const loadCustomers = async (isFirstPage: boolean) => {
    try {
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Base query
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('points', { ascending: false })
        .range(from, to);

      // Server-side search (name or phone)
      const q = searchQuery.trim();
      if (q) {
        // If you want partial phone matching even without +, this still works
        query = query.or(`first_name.ilike.%${q}%,phone.ilike.%${q}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (typeof count === 'number') {
        setTotalCount(count);
      }

      const pageData = data || [];

      setCustomers((prev) => (isFirstPage ? pageData : [...prev, ...pageData]));

      // If we got fewer than PAGE_SIZE, there are no more rows
      setHasMore(pageData.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const shownCountText = useMemo(() => {
    if (totalCount === null) return `Showing: ${customers.length}`;
    return `Showing: ${customers.length} / ${totalCount}`;
  }, [customers.length, totalCount]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">All Customers</h2>
          </div>
          <div className="text-sm text-gray-600">{shownCountText}</div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redemption
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.first_name}
                      </div>
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
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Opted Out
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.recently_redeemed ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Recently Redeemed
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
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
    </div>
  );
}

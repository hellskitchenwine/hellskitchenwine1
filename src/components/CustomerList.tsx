// import { useEffect, useState } from 'react';
// import { Users, Search, Phone, Star } from 'lucide-react';
// import { supabase } from '../lib/supabase';
// import { Customer } from '../types/database';

// interface CustomerListProps {
//   onSelectionChange: (selectedIds: string[]) => void;
//   refreshTrigger: number;
// }

// export function CustomerList({ onSelectionChange, refreshTrigger }: CustomerListProps) {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [pointsFilter, setPointsFilter] = useState('500');
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   useEffect(() => {
//     loadCustomers();
//   }, [refreshTrigger, pointsFilter]);

//   const loadCustomers = async () => {
//     setLoading(true);
//     try {
//       let query = supabase
//         .from('customers')
//         .select('*')
//         .eq('opted_out', false)
//         .order('points', { ascending: false });

//       if (pointsFilter) {
//         query = query.gte('points', parseInt(pointsFilter));
//       }

//       const { data, error } = await query;

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

//   const toggleSelection = (id: string) => {
//     const newSelected = new Set(selectedIds);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedIds(newSelected);
//     onSelectionChange(Array.from(newSelected));
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.size === filteredCustomers.length) {
//       setSelectedIds(new Set());
//       onSelectionChange([]);
//     } else {
//       const allIds = new Set(filteredCustomers.map((c) => c.id));
//       setSelectedIds(allIds);
//       onSelectionChange(Array.from(allIds));
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow">
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <Users className="w-6 h-6 text-blue-600" />
//             <h2 className="text-xl font-semibold">Customers</h2>
//           </div>
//           <div className="text-sm text-gray-600">
//             {selectedIds.size > 0 && `${selectedIds.size} selected`}
//           </div>
//         </div>

//         <div className="flex gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by name or phone..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <select
//             value={pointsFilter}
//             onChange={(e) => setPointsFilter(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             <option value="">All Points</option>
//             <option value="250">250+ Points</option>
//             <option value="500">500+ Points</option>
//             <option value="1000">1000+ Points</option>
//             <option value="2000">2000+ Points</option>
//           </select>
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
//                 <th className="px-6 py-3 text-left">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0}
//                     onChange={toggleSelectAll}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Points
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredCustomers.map((customer) => (
//                 <tr
//                   key={customer.id}
//                   className={`hover:bg-gray-50 cursor-pointer ${
//                     selectedIds.has(customer.id) ? 'bg-blue-50' : ''
//                   }`}
//                   onClick={() => toggleSelection(customer.id)}
//                 >
//                   <td className="px-6 py-4">
//                     <input
//                       type="checkbox"
//                       checked={selectedIds.has(customer.id)}
//                       onChange={() => toggleSelection(customer.id)}
//                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                   </td>
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
import { Users, Search, Phone, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Customer } from '../types/database';

interface CustomerListProps {
  onSelectionChange: (selectedIds: string[]) => void;
  refreshTrigger: number;
}

type PointsRangeKey = '' | '250_499' | '500_749' | '750_1249' | '2000_plus';

const POINTS_RANGES: Record<Exclude<PointsRangeKey, ''>, { min: number; max?: number; label: string }> = {
  '250_499': { min: 250, max: 499, label: '250–499 Points' },
  '500_749': { min: 500, max: 749, label: '500–749 Points' },
  '750_1249': { min: 750, max: 1249, label: '750–1249 Points' },
  '2000_plus': { min: 2000, label: '2000+ Points' },
};

const PAGE_SIZE = 1000;

export function CustomerList({ onSelectionChange, refreshTrigger }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [pointsFilter, setPointsFilter] = useState<PointsRangeKey>('500_749');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Extra UI helpers
  const [dbMatchCount, setDbMatchCount] = useState<number>(0); // count of ALL matching rows in DB
  const [selectingAll, setSelectingAll] = useState(false);

  // Build the base query (filters + search), but without range/pagination
  const buildBaseQuery = () => {
    let query = supabase
      .from('customers')
      .select('id, first_name, phone, points, opted_out', { count: 'exact' })
      .eq('opted_out', false)
      .order('points', { ascending: false });

    // points range
    if (pointsFilter) {
      const range = POINTS_RANGES[pointsFilter];
      query = query.gte('points', range.min);
      if (typeof range.max === 'number') {
        query = query.lte('points', range.max);
      }
    }

    // optional search
    const q = searchQuery.trim();
    if (q) {
      query = query.or(`first_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    return query;
  };

  // Load ONLY first 1000 rows (for table display), but also get count
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const query = buildBaseQuery().range(0, PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      setCustomers((data as Customer[]) || []);
      setDbMatchCount(typeof count === 'number' ? count : (data?.length ?? 0));
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
      setDbMatchCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // reset selection when filters change
    setSelectedIds(new Set());
    onSelectionChange([]);
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, pointsFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSelectedIds(new Set());
      onSelectionChange([]);
      loadCustomers();
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const filteredCustomers = useMemo(() => {
    // customers already filtered on server; this is just a safe client fallback
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.first_name?.toLowerCase().includes(q) || c.phone?.includes(q)
    );
  }, [customers, searchQuery]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);

    setSelectedIds(next);
    onSelectionChange(Array.from(next));
  };

  /**
   * ✅ IMPORTANT:
   * When user clicks "select all", we fetch ALL matching IDs from DB (not just 1000 rows).
   * This keeps SendMessage.tsx unchanged and still sends customerIds.
   */
  const fetchAllMatchingIds = async (): Promise<string[]> => {
    const ids: string[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;

      // only fetch ids (lighter)
      let query = supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .eq('opted_out', false)
        .order('points', { ascending: false })
        .range(from, to);

      // points range
      if (pointsFilter) {
        const range = POINTS_RANGES[pointsFilter];
        query = query.gte('points', range.min);
        if (typeof range.max === 'number') query = query.lte('points', range.max);
      }

      // search
      const q = searchQuery.trim();
      if (q) query = query.or(`first_name.ilike.%${q}%,phone.ilike.%${q}%`);

      const { data, error } = await query;
      if (error) throw error;

      const pageIds = (data || []).map((r: any) => r.id).filter(Boolean);
      ids.push(...pageIds);

      // stop when last page
      if (pageIds.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return ids;
  };

  const toggleSelectAll = async () => {
    // If already selected ALL matching, unselect all
    if (selectedIds.size > 0 && selectedIds.size === dbMatchCount) {
      setSelectedIds(new Set());
      onSelectionChange([]);
      return;
    }

    // Otherwise select ALL matching (even if >1000)
    setSelectingAll(true);
    try {
      const allIds = await fetchAllMatchingIds();
      const setAll = new Set(allIds);
      setSelectedIds(setAll);
      onSelectionChange(allIds);
    } catch (e) {
      console.error('Failed to select all matching IDs:', e);
    } finally {
      setSelectingAll(false);
    }
  };

  const selectedText = useMemo(() => {
    if (selectedIds.size === 0) return '';
    if (selectedIds.size === dbMatchCount) return `${selectedIds.size} selected (all matching)`;
    return `${selectedIds.size} selected`;
  }, [selectedIds.size, dbMatchCount]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Customers</h2>
          </div>
          <div className="text-sm text-gray-600">
            {selectingAll ? 'Selecting all...' : selectedText}
          </div>
        </div>

        <div className="flex gap-4">
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
            value={pointsFilter}
            onChange={(e) => setPointsFilter(e.target.value as PointsRangeKey)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Points</option>
            <option value="250_499">250–499 Points</option>
            <option value="500_749">500–749 Points</option>
            <option value="750_1249">750–1249 Points</option>
            <option value="2000_plus">2000+ Points</option>
          </select>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Showing {customers.length} rows (database matches: {dbMatchCount})
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No customers found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === dbMatchCount}
                    onChange={toggleSelectAll}
                    disabled={selectingAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    title={
                      selectedIds.size === dbMatchCount
                        ? 'Unselect all'
                        : 'Select all matching (may take a few seconds)'
                    }
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedIds.has(customer.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleSelection(customer.id)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(customer.id)}
                      onChange={() => toggleSelection(customer.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

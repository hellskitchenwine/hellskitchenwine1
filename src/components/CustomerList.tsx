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

type Segment = {
  searchQuery: string;
  minPoints?: number;
  maxPoints?: number;
  optedOut?: boolean; // we always use false here, but keeping it for flexibility
};

type SelectionPayload =
  | { mode: 'manual'; selectedIds: string[]; segment: null; totalCount: number }
  | { mode: 'segment'; selectedIds: []; segment: Segment; totalCount: number };

interface CustomerListProps {
  onSelectionChange: (payload: SelectionPayload) => void;
  refreshTrigger: number;
}

export function CustomerList({ onSelectionChange, refreshTrigger }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [pointsFilter, setPointsFilter] = useState('500');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<'manual' | 'segment'>('manual');

  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, pointsFilter, searchQuery]);

  // Clear selection when filters/search change
  useEffect(() => {
    setSelectMode('manual');
    setSelectedIds(new Set());
    onSelectionChange({ mode: 'manual', selectedIds: [], segment: null, totalCount: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsFilter, searchQuery, refreshTrigger]);

  const buildSegment = (): Segment => {
    const segment: Segment = {
      searchQuery: searchQuery.trim(),
      optedOut: false,
    };

    if (pointsFilter) {
      const min = parseInt(pointsFilter, 10);
      segment.minPoints = min;

      // Choose your ranges here (recommended)
      const upperMap: Record<number, number> = {
        250: 500,
        500: 749,
        1000: 2000,
      };

      const maxExclusive = upperMap[min];
      if (maxExclusive) segment.maxPoints = maxExclusive;
    }

    return segment;
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('opted_out', false)
        .order('points', { ascending: false });

      const q = searchQuery.trim();
      if (q) {
        query = query.or(`first_name.ilike.%${q}%,phone.ilike.%${q}%`);
      }

      if (pointsFilter) {
        const min = parseInt(pointsFilter, 10);
        query = query.gte('points', min);

        // Recommended buckets: 250–499, 500–999, 1000–1999, 2000+
        const upperMap: Record<number, number> = {
          250: 500,
          500: 749,
          1000: 2000,
        };

        const maxExclusive = upperMap[min];
        if (maxExclusive) query = query.lt('points', maxExclusive);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setCustomers(data || []);
      setTotalCount(typeof count === 'number' ? count : 0);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // client-side filter is now redundant because we already filter on server,
  // but keeping it safe in case you want instant UI filtering while typing.
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const toggleSelection = (id: string) => {
    // switching from segment selection to manual selection
    if (selectMode === 'segment') {
      setSelectMode('manual');
      setSelectedIds(new Set([id]));
      onSelectionChange({
        mode: 'manual',
        selectedIds: [id],
        segment: null,
        totalCount,
      });
      return;
    }

    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);

    setSelectedIds(newSelected);
    onSelectionChange({
      mode: 'manual',
      selectedIds: Array.from(newSelected),
      segment: null,
      totalCount,
    });
  };

  const toggleSelectAll = () => {
    // If currently segment-selected, turn it off
    if (selectMode === 'segment') {
      setSelectMode('manual');
      setSelectedIds(new Set());
      onSelectionChange({ mode: 'manual', selectedIds: [], segment: null, totalCount });
      return;
    }

    // Turn on segment mode = ALL matching in DB
    setSelectMode('segment');
    setSelectedIds(new Set()); // clear manual IDs
    onSelectionChange({
      mode: 'segment',
      selectedIds: [],
      segment: buildSegment(),
      totalCount,
    });
  };

  const headerSelectedText = useMemo(() => {
    if (selectMode === 'segment') {
      return totalCount > 0 ? `${totalCount} selected (all matching)` : '';
    }
    return selectedIds.size > 0 ? `${selectedIds.size} selected` : '';
  }, [selectMode, selectedIds.size, totalCount]);

  const selectAllChecked =
    (selectMode === 'segment' && totalCount > 0) ||
    (selectMode === 'manual' &&
      selectedIds.size === filteredCustomers.length &&
      filteredCustomers.length > 0);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Customers</h2>
          </div>

          <div className="text-sm text-gray-600">
            {headerSelectedText}
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
            onChange={(e) => setPointsFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Points</option>
            <option value="250">250–499 Points</option>
            <option value="500">500–749 Points</option>
            <option value="1000">1000–1999 Points</option>
            <option value="2000">2000+ Points</option>
          </select>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Showing {filteredCustomers.length} rows (database matches: {totalCount})
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers....</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No customers found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    title="Select all matching customers (in the database)"
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
                    selectMode === 'manual' && selectedIds.has(customer.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleSelection(customer.id)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectMode === 'manual' && selectedIds.has(customer.id)}
                      onChange={() => toggleSelection(customer.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={selectMode === 'segment'}
                      title={selectMode === 'segment' ? 'All matching customers are selected' : ''}
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

// import { useState } from 'react';
// import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import { supabase } from '../lib/supabase';
// import { parseCSV } from '../utils/csvParser';
// import { parseExcel } from '../utils/excelParser';
// import { isValidPhoneNumber, formatPhoneNumber } from '../utils/phoneValidator';

// export function ImportCustomers({ onImportComplete }: { onImportComplete: () => void }) {
//   const [importing, setImporting] = useState(false);
//   const [result, setResult] = useState<{ success: number; errors: number; invalidPhones: number } | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [progress, setProgress] = useState({ current: 0, total: 0 });

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setImporting(true);
//     setError(null);
//     setResult(null);

//     try {
//       let customers;

//       if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
//         customers = await parseExcel(file);
//       } else {
//         const text = await file.text();
//         customers = parseCSV(text);
//       }

//       setProgress({ current: 0, total: customers.length });

//       let successCount = 0;
//       let errorCount = 0;
//       let invalidPhoneCount = 0;

//       for (let i = 0; i < customers.length; i++) {
//         const customer = customers[i];
//         setProgress({ current: i + 1, total: customers.length });

//         if (!isValidPhoneNumber(customer.phone)) {
//           invalidPhoneCount++;
//           errorCount++;
//           console.error(`Invalid phone number: ${customer.phone}`);
//           continue;
//         }

//         const formattedPhone = formatPhoneNumber(customer.phone);

//         const { data: existingCustomer } = await supabase
//           .from('customers')
//           .select('points')
//           .eq('phone', formattedPhone)
//           .maybeSingle();

//         const previousPoints = existingCustomer?.points ?? 0;
//         const newPoints = customer.points;
//         const wasAbove500 = previousPoints >= 500;
//         const nowBelow500 = newPoints < 500;
//         const recentlyRedeemed = wasAbove500 && nowBelow500;

//         const { error } = await supabase
//           .from('customers')
//           .upsert(
//             {
//               phone: formattedPhone,
//               first_name: customer.first_name,
//               points: newPoints,
//               previous_points: previousPoints,
//               recently_redeemed: recentlyRedeemed,
//               updated_at: new Date().toISOString(),
//             },
//             {
//               onConflict: 'phone',
//             }
//           );

//         if (error) {
//           errorCount++;
//           console.error('Error inserting customer:', error);
//         } else {
//           successCount++;
//         }
//       }

//       setResult({ success: successCount, errors: errorCount, invalidPhones: invalidPhoneCount });
//       onImportComplete();
//     } catch (err: any) {
//       setError(err.message || 'Failed to import customers');
//     } finally {
//       setImporting(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-xl font-semibold mb-4">Import Customers from POS</h2>

//       <div className="mb-4">
//         <p className="text-sm text-gray-600 mb-2">
//           Upload a CSV or Excel file from your POS system. Required columns: FIRST_NAME, PHONE_H, POINTS
//         </p>

//         <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
//           <div className="flex flex-col items-center space-y-2">
//             {importing ? (
//               <>
//                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                 <span className="text-sm text-gray-600">
//                   Importing {progress.current} of {progress.total}...
//                 </span>
//               </>
//             ) : (
//               <>
//                 <Upload className="w-8 h-8 text-gray-400" />
//                 <span className="text-sm text-gray-600">
//                   Click to upload CSV or Excel
//                 </span>
//               </>
//             )}
//           </div>
//           <input
//             type="file"
//             accept=".csv,.xlsx,.xls"
//             className="hidden"
//             onChange={handleFileUpload}
//             disabled={importing}
//           />
//         </label>
//       </div>

//       {result && (
//         <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//           <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
//           <div className="text-sm">
//             <p className="font-medium text-green-900">Import Complete</p>
//             <p className="text-green-700">
//               {result.success} customers imported successfully
//               {result.invalidPhones > 0 && (
//                 <span className="text-red-600"> ({result.invalidPhones} invalid phone numbers)</span>
//               )}
//               {result.errors > result.invalidPhones && `, ${result.errors - result.invalidPhones} other errors`}
//             </p>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//           <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
//           <div className="text-sm">
//             <p className="font-medium text-red-900">Import Failed</p>
//             <p className="text-red-700">{error}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { parseCSV } from '../utils/csvParser';
import { parseExcel } from '../utils/excelParser';
import { isValidPhoneNumber, formatPhoneNumber } from '../utils/phoneValidator';

export function ImportCustomers({ onImportComplete }: { onImportComplete: () => void }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number; invalidPhones: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const BATCH_SIZE = 200;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      let rawCustomers: any[] = [];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        rawCustomers = await parseExcel(file);
      } else {
        const text = await file.text();
        rawCustomers = parseCSV(text);
      }

      // Validate + normalize
      let invalidPhoneCount = 0;

      const customers = rawCustomers
        .map((c) => {
          const phone = String(c.phone ?? '').trim();
          if (!isValidPhoneNumber(phone)) {
            invalidPhoneCount++;
            return null;
          }
          return {
            first_name: String(c.first_name ?? '').trim(),
            phone: formatPhoneNumber(phone),
            points: Number(c.points ?? 0),
          };
        })
        .filter(Boolean) as Array<{ first_name: string; phone: string; points: number }>;

      setProgress({ current: 0, total: customers.length });

      let successCount = 0;
      let errorCount = invalidPhoneCount;

      for (let i = 0; i < customers.length; i += BATCH_SIZE) {
        const batch = customers.slice(i, i + BATCH_SIZE);

        // progress update (after batch is prepared)
        setProgress({ current: Math.min(i + batch.length, customers.length), total: customers.length });

        // 1) Fetch existing points for all phones in the batch
        const phones = batch.map((c) => c.phone);

        const { data: existingRows, error: existingErr } = await supabase
          .from('customers')
          .select('phone, points')
          .in('phone', phones);

        if (existingErr) {
          console.error('Error fetching existing customers:', existingErr);
          errorCount += batch.length;
          continue;
        }

        const existingMap = new Map<string, number>();
        (existingRows || []).forEach((r: any) => existingMap.set(r.phone, r.points ?? 0));

        // 2) Build upsert payload
        const nowIso = new Date().toISOString();

        const upsertRows = batch.map((c) => {
          const previousPoints = existingMap.get(c.phone) ?? 0;
          const newPoints = c.points;

          const recentlyRedeemed = previousPoints >= 500 && newPoints < 500;

          return {
            phone: c.phone,
            first_name: c.first_name,
            points: newPoints,
            previous_points: previousPoints,
            recently_redeemed: recentlyRedeemed,
            updated_at: nowIso,
          };
        });

        // 3) Upsert whole batch in one request
        const { error: upsertErr } = await supabase
          .from('customers')
          .upsert(upsertRows, { onConflict: 'phone' });

        if (upsertErr) {
          console.error('Batch upsert error:', upsertErr);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }

      setResult({ success: successCount, errors: errorCount, invalidPhones: invalidPhoneCount });
      onImportComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to import customers');
    } finally {
      setImporting(false);
      // allow same file re-upload
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Import Customers from POS</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Upload a CSV or Excel file from your POS system. Required columns: FIRST_NAME, PHONE_H, POINTS
        </p>

        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
          <div className="flex flex-col items-center space-y-2">
            {importing ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-600">
                  Importing {progress.current} of {progress.total}...
                </span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Click to upload CSV or Excel</span>
              </>
            )}
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
            disabled={importing}
          />
        </label>
      </div>

      {result && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-900">Import Complete</p>
            <p className="text-green-700">
              {result.success} customers imported successfully
              {result.invalidPhones > 0 && (
                <span className="text-red-600"> ({result.invalidPhones} invalid phone numbers)</span>
              )}
              {result.errors > result.invalidPhones && `, ${result.errors - result.invalidPhones} other errors`}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-900">Import Failed</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

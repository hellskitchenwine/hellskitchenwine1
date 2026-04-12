// import { useState, useEffect } from 'react';
// import { Send, AlertCircle, CheckCircle, Eye, Clock } from 'lucide-react';
// import { supabase } from '../lib/supabase';
// import { checkNYSMSCompliance, getNextAllowedTime, formatCurrentETTime } from '../utils/smsCompliance';

// interface SendMessageProps {
//   selectedCustomerIds: string[];
//   onSendComplete: () => void;
// }

// const DEFAULT_MESSAGES = {
//   '250': 'Hi {name}! You have {points} loyalty points at Hell\'s Kitchen Wine & Spirits. You\'ve earned $5 OFF your next purchase! Visit us today to redeem. 21+ only. Reply STOP to opt out.',
//   '500': 'Hi {name}! Congrats! You have {points} loyalty points at Hell\'s Kitchen Wine & Spirits and qualify for $10 OFF your next purchase! Come in soon to redeem your reward. 21+ only. Reply STOP to opt out.',
//   'custom': ''
// };

// export function SendMessage({ selectedCustomerIds, onSendComplete }: SendMessageProps) {
//   const [message, setMessage] = useState('');
//   const [sending, setSending] = useState(false);
//   const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [previewData, setPreviewData] = useState<Array<{ name: string; phone: string; points: number; previewMessage: string }>>([]);
//   const [loadingPreview, setLoadingPreview] = useState(false);
//   const [currentTime, setCurrentTime] = useState(formatCurrentETTime());
//   const [complianceCheck, setComplianceCheck] = useState(checkNYSMSCompliance());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(formatCurrentETTime());
//       setComplianceCheck(checkNYSMSCompliance());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const loadPreview = async () => {
//     setLoadingPreview(true);
//     try {
//       const { data: customers } = await supabase
//         .from('customers')
//         .select('first_name, phone, points')
//         .in('id', selectedCustomerIds.slice(0, 5));

//       if (customers) {
//         const previews = customers.map(customer => ({
//           name: customer.first_name,
//           phone: customer.phone,
//           points: customer.points,
//           previewMessage: message
//             .replace(/\{name\}/g, customer.first_name)
//             .replace(/\{points\}/g, customer.points.toString())
//         }));
//         setPreviewData(previews);
//         setShowPreview(true);
//       }
//     } catch (error) {
//       console.error('Error loading preview:', error);
//     } finally {
//       setLoadingPreview(false);
//     }
//   };

//   const handleSendClick = () => {
//     if (!message.trim()) {
//       setResult({ success: false, message: 'Please enter a message' });
//       return;
//     }

//     if (selectedCustomerIds.length === 0) {
//       setResult({ success: false, message: 'Please select at least one customer' });
//       return;
//     }

//     const compliance = checkNYSMSCompliance();
//     if (!compliance.allowed) {
//       setResult({ success: false, message: compliance.reason || 'Cannot send messages at this time' });
//       return;
//     }

//     setShowConfirmation(true);
//   };

//   const handleConfirmSend = async () => {
//     setShowConfirmation(false);
//     setSending(true);
//     setResult(null);

//     try {
//       const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`;
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           customerIds: selectedCustomerIds,
//           messageBody: message,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({
//           success: true,
//           message: `Messages sent to ${data.totalCustomers} customers`,
//         });
//         setMessage('');
//         onSendComplete();
//       } else {
//         setResult({
//           success: false,
//           message: data.error || 'Failed to send messages',
//         });
//       }
//     } catch (error: any) {
//       setResult({
//         success: false,
//         message: error.message || 'Failed to send messages',
//       });
//     } finally {
//       setSending(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedCustomerIds.length > 0 && message.trim()) {
//       const timer = setTimeout(() => {
//         loadPreview();
//       }, 500);
//       return () => clearTimeout(timer);
//     }
//   }, [message, selectedCustomerIds]);

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <div className="flex items-center gap-2 mb-4">
//         <Send className="w-6 h-6 text-blue-600" />
//         <h2 className="text-xl font-semibold">Send Message</h2>
//       </div>

//       <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Clock className="w-4 h-4 text-gray-500" />
//             <span className="text-sm text-gray-600">Current Time (ET):</span>
//           </div>
//           <span className="text-sm font-medium text-gray-900">{currentTime}</span>
//         </div>
//         {!complianceCheck.allowed && (
//           <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
//             <p className="text-xs text-red-800">
//               <strong>Sending Not Allowed:</strong> {complianceCheck.reason}
//             </p>
//             <p className="text-xs text-red-700 mt-1">
//               Next available time: {getNextAllowedTime()}
//             </p>
//           </div>
//         )}
//         {complianceCheck.allowed && (
//           <div className="mt-2 flex items-center gap-1">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//             <span className="text-xs text-green-700 font-medium">Messages can be sent now</span>
//           </div>
//         )}
//       </div>

//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Message Template
//         </label>
//         <div className="grid grid-cols-3 gap-2 mb-4">
//           <button
//             onClick={() => setMessage(DEFAULT_MESSAGES['250'])}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             250 Points Message
//           </button>
//           <button
//             onClick={() => setMessage(DEFAULT_MESSAGES['500'])}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             500 Points Message
//           </button>
//           <button
//             onClick={() => setMessage('')}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             Custom Message
//           </button>
//         </div>
//       </div>

//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Message Text
//         </label>
//         <textarea
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type your message here... Use {name} for customer name and {points} for their points"
//           rows={4}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//         />
//         <div className="flex justify-between items-center mt-2">
//           <p className="text-sm text-gray-500">{message.length} characters</p>
//           <p className="text-sm text-gray-500">
//             {selectedCustomerIds.length} customer(s) selected
//           </p>
//         </div>
//         {selectedCustomerIds.length > 100 && (
//           <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
//             <strong>Note:</strong> Sending to {selectedCustomerIds.length} customers will take approximately {Math.ceil(selectedCustomerIds.length / 10)} seconds due to rate limiting.
//           </div>
//         )}
//       </div>

//       {result && (
//         <div
//           className={`flex items-start gap-2 p-3 mb-4 rounded-lg border ${
//             result.success
//               ? 'bg-green-50 border-green-200'
//               : 'bg-red-50 border-red-200'
//           }`}
//         >
//           {result.success ? (
//             <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
//           ) : (
//             <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
//           )}
//           <div className="text-sm">
//             <p
//               className={`font-medium ${
//                 result.success ? 'text-green-900' : 'text-red-900'
//               }`}
//             >
//               {result.success ? 'Success' : 'Error'}
//             </p>
//             <p
//               className={result.success ? 'text-green-700' : 'text-red-700'}
//             >
//               {result.message}
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="flex gap-2">
//         <button
//           onClick={() => setShowPreview(true)}
//           disabled={sending || selectedCustomerIds.length === 0 || !message.trim()}
//           className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
//         >
//           <Eye className="w-5 h-5" />
//           Preview
//         </button>
//         <button
//           onClick={handleSendClick}
//           disabled={sending || selectedCustomerIds.length === 0 || !message.trim() || !complianceCheck.allowed}
//           className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//         >
//           <Send className="w-5 h-5" />
//           {sending ? 'Sending...' : `Send to ${selectedCustomerIds.length} Customer(s)`}
//         </button>
//       </div>

//       {showConfirmation && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//             <h3 className="text-xl font-semibold mb-4">Confirm Message Send</h3>
//             <div className="mb-6">
//               <p className="text-gray-700 mb-4">
//                 You are about to send messages to <span className="font-bold text-blue-600">{selectedCustomerIds.length}</span> customer(s).
//               </p>
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                 <p className="text-sm text-yellow-800 font-medium mb-2">Important:</p>
//                 <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
//                   <li>Messages cannot be recalled once sent</li>
//                   <li>SMS charges will apply</li>
//                   <li>Verify recipients are correct</li>
//                 </ul>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowConfirmation(false)}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmSend}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//               >
//                 Confirm & Send
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showPreview && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-xl font-semibold">Message Preview</h3>
//               <p className="text-sm text-gray-500 mt-1">Showing preview for first {Math.min(5, selectedCustomerIds.length)} customer(s)</p>
//             </div>
//             <div className="flex-1 overflow-y-auto p-6">
//               {loadingPreview ? (
//                 <div className="text-center py-8 text-gray-500">Loading preview...</div>
//               ) : (
//                 <div className="space-y-4">
//                   {previewData.map((preview, index) => (
//                     <div key={index} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-center justify-between mb-2">
//                         <div>
//                           <p className="font-medium text-gray-900">{preview.name}</p>
//                           <p className="text-sm text-gray-500">{preview.phone}</p>
//                         </div>
//                         <span className="text-sm text-gray-500">{preview.points} points</span>
//                       </div>
//                       <div className="bg-gray-50 rounded p-3 mt-2">
//                         <p className="text-sm text-gray-700">{preview.previewMessage}</p>
//                       </div>
//                     </div>
//                   ))}
//                   {selectedCustomerIds.length > 5 && (
//                     <div className="text-center text-sm text-gray-500 py-2">
//                       + {selectedCustomerIds.length - 5} more customer(s)
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//             <div className="p-6 border-t border-gray-200">
//               <button
//                 onClick={() => setShowPreview(false)}
//                 className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
//               >
//                 Close Preview
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Eye, Clock, Image as ImageIcon, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkNYSMSCompliance, getNextAllowedTime, formatCurrentETTime } from '../utils/smsCompliance';
import { Campaign } from '../types/database';

interface SendMessageProps {
  selectedCustomerIds: string[];
  onSendComplete: () => void;
}

const DEFAULT_MESSAGES = {
  '250': 'Hi {name}! You have {points} loyalty points at Hell\'s Kitchen Wine & Spirits. You\'ve earned $5 OFF your next purchase! Visit us today to redeem. 21+ only. Reply STOP to opt out.',
  '500': 'Hi {name}! Congrats! You have {points} loyalty points at Hell\'s Kitchen Wine & Spirits and qualify for $10 OFF your next purchase! Come in soon to redeem your reward. 21+ only. Reply STOP to opt out.',
  'custom': ''
};

const BATCH_SIZE = 50; // safe limit per edge-function call (~15-25s, well under 60s timeout)

interface SendProgress {
  currentBatch: number;
  totalBatches: number;
  sent: number;
  failed: number;
  total: number;
}

export function SendMessage({ selectedCustomerIds, onSendComplete }: SendMessageProps) {
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<SendProgress | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Array<{
    name: string;
    phone: string;
    points: number;
    previewMessage: string;
    mediaUrl?: string;
  }>>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatCurrentETTime());
  const [complianceCheck, setComplianceCheck] = useState(checkNYSMSCompliance());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatCurrentETTime());
      setComplianceCheck(checkNYSMSCompliance());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase
      .from('campaigns')
      .select('id, name, reason, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCampaigns((data as Campaign[]) || []));
  }, []);

  const isValidMediaUrl = (url: string) => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const loadPreview = async () => {
    if (!message.trim()) return;

    setLoadingPreview(true);
    try {
      const { data: customers } = await supabase
        .from('customers')
        .select('first_name, phone, points')
        .in('id', selectedCustomerIds.slice(0, 5));

      if (customers) {
        const previews = customers.map(customer => ({
          name: customer.first_name,
          phone: customer.phone,
          points: customer.points,
          previewMessage: message
            .replace(/\{name\}/g, customer.first_name)
            .replace(/\{points\}/g, customer.points.toString()),
          mediaUrl: mediaUrl.trim() || undefined
        }));
        setPreviewData(previews);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendClick = () => {
    if (!message.trim()) {
      setResult({ success: false, message: 'Please enter a message' });
      return;
    }

    if (selectedCustomerIds.length === 0) {
      setResult({ success: false, message: 'Please select at least one customer' });
      return;
    }

    if (!isValidMediaUrl(mediaUrl)) {
      setResult({ success: false, message: 'Please enter a valid public HTTPS media URL' });
      return;
    }

    const compliance = checkNYSMSCompliance();
    if (!compliance.allowed) {
      setResult({ success: false, message: compliance.reason || 'Cannot send messages at this time' });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmation(false);
    setSending(true);
    setResult(null);
    setProgress(null);

    // Split IDs into batches of BATCH_SIZE to stay well under the 60s edge function timeout
    const batches: string[][] = [];
    for (let i = 0; i < selectedCustomerIds.length; i += BATCH_SIZE) {
      batches.push(selectedCustomerIds.slice(i, i + BATCH_SIZE));
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    let totalSent = 0;
    let totalFailed = 0;
    let batchError: string | null = null;

    for (let i = 0; i < batches.length; i++) {
      setProgress({
        currentBatch: i + 1,
        totalBatches: batches.length,
        sent: totalSent,
        failed: totalFailed,
        total: selectedCustomerIds.length,
      });

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            customerIds: batches[i],
            messageBody: message,
            mediaUrl: mediaUrl.trim() || null,
            campaignId: selectedCampaignId || null,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const batchSent   = (data.results as any[]).filter(r => r.status === 'sent').length;
          const batchFailed = (data.results as any[]).filter(r => r.status === 'failed').length;
          totalSent   += batchSent;
          totalFailed += batchFailed;
        } else {
          // Non-fatal: record the error, keep going with remaining batches
          batchError = data.error || 'A batch failed';
          totalFailed += batches[i].length;
        }
      } catch (err: any) {
        batchError = err.message || 'Network error on a batch';
        totalFailed += batches[i].length;
      }
    }

    // Final progress update
    setProgress({
      currentBatch: batches.length,
      totalBatches: batches.length,
      sent: totalSent,
      failed: totalFailed,
      total: selectedCustomerIds.length,
    });

    if (totalSent > 0 || totalFailed === 0) {
      setResult({
        success: true,
        message: `Done — ${totalSent} sent${totalFailed > 0 ? `, ${totalFailed} failed` : ''}${batchError ? ` (some batches had errors)` : ''}`,
      });
      setMessage('');
      setMediaUrl('');
      onSendComplete();
    } else {
      setResult({
        success: false,
        message: batchError || 'All messages failed to send',
      });
    }

    setSending(false);
  };

  useEffect(() => {
    if (selectedCustomerIds.length > 0 && message.trim()) {
      const timer = setTimeout(() => {
        loadPreview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [message, mediaUrl, selectedCustomerIds]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Send Message</h2>
      </div>

      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Current Time (ET):</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{currentTime}</span>
        </div>
        {!complianceCheck.allowed && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-800">
              <strong>Sending Not Allowed:</strong> {complianceCheck.reason}
            </p>
            <p className="text-xs text-red-700 mt-1">
              Next available time: {getNextAllowedTime()}
            </p>
          </div>
        )}
        {complianceCheck.allowed && (
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">Messages can be sent now</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message Template
        </label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setMessage(DEFAULT_MESSAGES['250'])}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            250 Points Message
          </button>
          <button
            onClick={() => setMessage(DEFAULT_MESSAGES['500'])}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            500 Points Message
          </button>
          <button
            onClick={() => setMessage('')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Custom Message
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message Text
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here... Use {name} for customer name and {points} for their points"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">{message.length} characters</p>
          <p className="text-sm text-gray-500">
            {selectedCustomerIds.length} customer(s) selected
          </p>
        </div>
        {selectedCustomerIds.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            Will send in <strong>{Math.ceil(selectedCustomerIds.length / BATCH_SIZE)} batch{Math.ceil(selectedCustomerIds.length / BATCH_SIZE) !== 1 ? 'es' : ''}</strong> of up to {BATCH_SIZE} — estimated ~{Math.ceil(selectedCustomerIds.length * 0.3)} seconds total.
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <BarChart2 className="w-4 h-4 text-purple-600" />
          Link to Campaign <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        >
          <option value="">— No Campaign —</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.reason ? ` — ${c.reason}` : ''}
            </option>
          ))}
        </select>
        {campaigns.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">
            No campaigns yet. Create one on the Campaigns tab first.
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media URL (Optional)
        </label>
        <div className="relative">
          <ImageIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://your-project.supabase.co/storage/v1/object/public/campaign-images/stpatricks.jpg"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Leave empty for normal SMS. Add a public HTTPS image URL to send MMS.
        </p>
      </div>

      {/* Live progress bar — shown while sending */}
      {sending && progress && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">
              Sending batch {progress.currentBatch} of {progress.totalBatches}…
            </span>
            <span className="text-xs text-blue-700">
              {progress.sent + progress.failed} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(((progress.sent + progress.failed) / progress.total) * 100)}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-green-700 font-medium">✓ {progress.sent} sent</span>
            {progress.failed > 0 && (
              <span className="text-red-600 font-medium">✗ {progress.failed} failed</span>
            )}
            <span className="text-gray-500">
              {progress.total - progress.sent - progress.failed} remaining
            </span>
          </div>
        </div>
      )}

      {result && !sending && (
        <div
          className={`flex items-start gap-2 p-3 mb-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          )}
          <div className="text-sm">
            <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
              {result.success ? 'Done' : 'Error'}
            </p>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={loadPreview}
          disabled={sending || selectedCustomerIds.length === 0 || !message.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          <Eye className="w-5 h-5" />
          Preview
        </button>
        <button
          onClick={handleSendClick}
          disabled={sending || selectedCustomerIds.length === 0 || !message.trim() || !complianceCheck.allowed}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
          {sending
            ? 'Sending...'
            : mediaUrl.trim()
              ? `Send MMS to ${selectedCustomerIds.length} Customer(s)`
              : `Send to ${selectedCustomerIds.length} Customer(s)`}
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Message Send</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are about to send {mediaUrl.trim() ? 'MMS' : 'SMS'} messages to <span className="font-bold text-blue-600">{selectedCustomerIds.length}</span> customer(s).
              </p>
              {selectedCampaignId && (() => {
                const camp = campaigns.find(c => c.id === selectedCampaignId);
                return camp ? (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Campaign:</strong> {camp.name}
                    </p>
                    {camp.reason && (
                      <p className="text-sm text-purple-700 mt-1">
                        <strong>Reason:</strong> {camp.reason}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}
              {mediaUrl.trim() && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 break-all">
                    <strong>Media URL:</strong> {mediaUrl}
                  </p>
                </div>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">Important:</p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Messages cannot be recalled once sent</li>
                  <li>SMS/MMS charges will apply</li>
                  <li>Verify recipients are correct</li>
                  <li>Media URL must be public and accessible</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Message Preview</h3>
              <p className="text-sm text-gray-500 mt-1">Showing preview for first {Math.min(5, selectedCustomerIds.length)} customer(s)</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingPreview ? (
                <div className="text-center py-8 text-gray-500">Loading preview...</div>
              ) : (
                <div className="space-y-4">
                  {previewData.map((preview, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{preview.name}</p>
                          <p className="text-sm text-gray-500">{preview.phone}</p>
                        </div>
                        <span className="text-sm text-gray-500">{preview.points} points</span>
                      </div>
                      <div className="bg-gray-50 rounded p-3 mt-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{preview.previewMessage}</p>
                      </div>
                      {preview.mediaUrl && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Attached image:</p>
                          <img
                            src={preview.mediaUrl}
                            alt="MMS preview"
                            className="max-h-48 rounded border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedCustomerIds.length > 5 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      + {selectedCustomerIds.length - 5} more customer(s)
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
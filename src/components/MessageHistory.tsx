import { useEffect, useMemo, useState } from 'react';
import { History, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Message } from '../types/database';

interface MessageHistoryProps {
  refreshTrigger: number;
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';

// Parse YYYY-MM-DD safely as a *local* date (avoids UTC shifting)
const parseLocalDateInput = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export function MessageHistory({ refreshTrigger }: MessageHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Returns {start, end} where end is optional. null = no filtering.
  const getRange = () => {
    const now = new Date();

    switch (dateFilter) {
      case 'all':
        return null;

      case 'today': {
        const start = startOfLocalDay(now);
        const end = endOfLocalDay(now);
        return { start, end };
      }

      case 'yesterday': {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const start = startOfLocalDay(y);
        const end = endOfLocalDay(y);
        return { start, end };
      }

      case 'last7days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        return { start, end: null as Date | null };
      }

      case 'last30days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        return { start, end: null as Date | null };
      }

      case 'custom': {
        const s = customStartDate ? parseLocalDateInput(customStartDate) : null;
        const e = customEndDate ? parseLocalDateInput(customEndDate) : null;

        const start = s ? startOfLocalDay(s) : null;
        const end = e ? endOfLocalDay(e) : null;

        if (!start && !end) return null; // nothing selected
        return { start, end };
      }

      default:
        return null;
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(200);

      const range = getRange();

      if (range?.start) query = query.gte('created_at', range.start.toISOString());
      if (range?.end) query = query.lte('created_at', range.end.toISOString());

      const { data, error, count } = await query;

      // ✅ Debug logs (keep until you see data, then you can remove)
      console.log('[MessageHistory] count:', count);
      console.log('[MessageHistory] error:', error);
      console.log('[MessageHistory] first row:', data?.[0]);

      if (error) throw error;

      setMessages((data as Message[]) || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, dateFilter, customStartDate, customEndDate]);

  const stats = useMemo(() => {
    let total = 0;
    let sent = 0;
    let failed = 0;
    let pending = 0;

    for (const m of messages) {
      total += 1;
      if (m.status === 'sent') sent += 1;
      else if (m.status === 'failed') failed += 1;
      else if (m.status === 'pending') pending += 1;
    }

    return { total, sent, failed, pending };
  }, [messages]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'skipped':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Message History</h2>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Total Messages</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Sent</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{stats.sent}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Failed</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{stats.failed}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No messages found.
            <div className="text-xs text-gray-400 mt-2">
              Open DevTools Console and check the logs: count/error/first row.
              If error mentions RLS or permission, you need a SELECT policy on the messages table.
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          message.status
                        )}`}
                      >
                        {message.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {message.phone}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {message.message_body}
                    </div>
                    {message.error_message && (
                      <div className="text-xs text-red-600 mt-1">{message.error_message}</div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(message.sent_at || message.created_at)}
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

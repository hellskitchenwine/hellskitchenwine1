import { useEffect, useState } from 'react';
import {
  BarChart2,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Info,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Campaign } from '../types/database';

interface CampaignsProps {
  refreshTrigger: number;
}

interface AllTimeStats {
  totalSent: number;
  totalFailed: number;
  totalCost: number;
  smsSent: number;
  mmsSent: number;
}

export function Campaigns({ refreshTrigger }: CampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [allTime, setAllTime] = useState<AllTimeStats>({
    totalSent: 0, totalFailed: 0, totalCost: 0, smsSent: 0, mmsSent: 0,
  });

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formReason, setFormReason] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const [{ data: campaignData, error }, { data: msgData }] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        // Pull all sent messages to compute real all-time spend
        supabase.from('messages').select('status, cost, media_url'),
      ]);

      if (error) throw error;
      setCampaigns((campaignData as Campaign[]) || []);

      if (msgData) {
        let totalSent = 0, totalFailed = 0, totalCost = 0, smsSent = 0, mmsSent = 0;
        for (const m of msgData) {
          if (m.status === 'sent') {
            totalSent++;
            totalCost += Number(m.cost ?? 0);
            if (m.media_url) mmsSent++; else smsSent++;
          } else if (m.status === 'failed') {
            totalFailed++;
          }
        }
        setAllTime({ totalSent, totalFailed, totalCost, smsSent, mmsSent });
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [refreshTrigger]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      setFormError('Campaign name is required.');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      const { error } = await supabase.from('campaigns').insert({
        name: formName.trim(),
        reason: formReason.trim() || null,
      });
      if (error) throw error;
      setFormName('');
      setFormReason('');
      setShowForm(false);
      await loadCampaigns();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create campaign.');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const formatCost = (cost: number) => `$${Number(cost).toFixed(2)}`;

  const successRate = (c: Campaign) =>
    c.total_customers > 0
      ? Math.round((c.total_sent / c.total_customers) * 100)
      : 0;

  const totals = campaigns.reduce(
    (acc, c) => ({
      count: acc.count + 1,
      sent: acc.sent + c.total_sent,
      failed: acc.failed + c.total_failed,
      cost: acc.cost + Number(c.total_cost),
    }),
    { count: 0, sent: 0, failed: 0, cost: 0 }
  );

  return (
    <div className="space-y-6">

      {/* All-time spend — pulled directly from messages table, includes every send ever */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">All-Time SMS Spend</h2>
          <div className="relative group ml-1">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-5 top-0 z-10 hidden group-hover:block w-64 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg">
              Calculated from every sent message in the database (SMS: $0.0079/msg · MMS: $0.0200/msg).
              Historical sends before cost tracking started show $0.00.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-700">{allTime.totalSent.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{allTime.smsSent.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">SMS Sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{allTime.mmsSent.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">MMS Sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{allTime.totalFailed.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{formatCost(allTime.totalCost)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Cost</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
          <span>SMS rate: $0.0079 / message</span>
          <span>MMS rate: $0.0200 / message</span>
        </div>
      </div>

      {/* Campaign summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Total Campaigns</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totals.count}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Campaign Delivered</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totals.sent.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Campaign Failed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totals.failed.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Campaign Cost</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCost(totals.cost)}</div>
        </div>
      </div>

      {/* Campaign list card */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Campaigns</h2>
          </div>
          <button
            onClick={() => { setShowForm(true); setFormError(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {/* Inline create form */}
        {showForm && (
          <div className="p-6 border-b border-purple-100 bg-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-purple-900">Create New Campaign</h3>
              <button
                onClick={() => { setShowForm(false); setFormName(''); setFormReason(''); setFormError(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. April Loyalty Blast, St. Patrick's Day Promo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason / Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. Targeting 250-point customers, spring sale promotion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowForm(false); setFormName(''); setFormReason(''); setFormError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center">
            <BarChart2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-medium text-gray-500">No campaigns yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click <strong>New Campaign</strong> to create one, then select it when sending messages.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {campaigns.map((campaign) => {
              const isOpen = expanded === campaign.id;
              return (
                <div key={campaign.id} className="p-6">
                  {/* Row header */}
                  <div
                    className="flex items-start justify-between cursor-pointer select-none"
                    onClick={() => setExpanded(isOpen ? null : campaign.id)}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-semibold text-gray-900 truncate">{campaign.name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{formatDate(campaign.created_at)}</p>
                      {campaign.reason && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{campaign.reason}"</p>
                      )}
                    </div>

                    {/* Inline stats */}
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">{campaign.total_sent}</span>
                        </div>
                        <div className="text-xs text-gray-400">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">{campaign.total_failed}</span>
                        </div>
                        <div className="text-xs text-gray-400">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center text-emerald-700">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-semibold">{formatCost(Number(campaign.total_cost))}</span>
                        </div>
                        <div className="text-xs text-gray-400">Cost</div>
                      </div>
                      <div className="text-gray-400 ml-1">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Targeted</div>
                          <div className="text-lg font-bold text-gray-900">{campaign.total_customers.toLocaleString()}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs text-green-600 mb-1">Delivered</div>
                          <div className="text-lg font-bold text-green-900">{campaign.total_sent.toLocaleString()}</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <div className="text-xs text-red-600 mb-1">Failed</div>
                          <div className="text-lg font-bold text-red-900">{campaign.total_failed.toLocaleString()}</div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3">
                          <div className="text-xs text-emerald-600 mb-1">Total Cost</div>
                          <div className="text-lg font-bold text-emerald-900">{formatCost(Number(campaign.total_cost))}</div>
                        </div>
                      </div>

                      {/* Delivery rate bar */}
                      {campaign.total_customers > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Delivery rate</span>
                            <span>{successRate(campaign)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${successRate(campaign)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {campaign.total_customers === 0 && (
                        <p className="text-sm text-gray-400 italic">
                          No messages sent to this campaign yet. Select it when sending messages.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

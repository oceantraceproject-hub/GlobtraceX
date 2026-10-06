import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GLOBAL_COUNTRIES } from '../data/globalCountries';
import {
  ALERT_PARAMETERS,
  TrendAlert,
  createTrendAlert,
  getLocalTrendAlerts,
  removeTrendAlert,
  toggleTrendAlertState,
} from '../services/alertService';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ShieldCheck,
  Compass,
  Sliders,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface TrendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultParameter?: TrendAlert['parameter'];
  defaultRegionCode?: string;
}

export const TrendAlertModal: React.FC<TrendAlertModalProps> = ({
  isOpen,
  onClose,
  defaultParameter = 'sst',
  defaultRegionCode = 'BD',
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'create' | 'subscriptions'>('create');
  const [email, setEmail] = useState('');
  const [selectedParamId, setSelectedParamId] = useState<TrendAlert['parameter']>(defaultParameter);
  const [selectedRegionCode, setSelectedRegionCode] = useState(defaultRegionCode);
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [thresholdValue, setThresholdValue] = useState<number>(29.5);
  const [frequency, setFrequency] = useState<TrendAlert['frequency']>('weekly_digest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingAlerts, setExistingAlerts] = useState<TrendAlert[]>([]);

  // Update selected parameter configuration
  const currentParamConfig = ALERT_PARAMETERS.find((p) => p.id === selectedParamId) || ALERT_PARAMETERS[0];

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setExistingAlerts(getLocalTrendAlerts());
      setSuccessMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setThresholdValue(currentParamConfig.defaultThreshold);
    setCondition(currentParamConfig.defaultCondition);
  }, [selectedParamId]);

  if (!isOpen) return null;

  const selectedCountry = GLOBAL_COUNTRIES.find((c) => c.code === selectedRegionCode) || GLOBAL_COUNTRIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    try {
      const created = await createTrendAlert({
        email,
        targetRegion: selectedCountry.code,
        targetRegionName: isBn ? selectedCountry.nameBn : selectedCountry.name,
        parameter: selectedParamId,
        parameterLabel: isBn ? currentParamConfig.labelBn : currentParamConfig.label,
        condition,
        thresholdValue,
        unit: currentParamConfig.unit,
        frequency,
      });

      setExistingAlerts(getLocalTrendAlerts());
      setSuccessMessage(
        isBn
          ? `সফলভাবে সতর্কতা সংরক্ষিত হয়েছে! ${email} ঠিকানায় নিশ্চিতকরণ ইমেইল পাঠানো হয়েছে।`
          : `Alert successfully activated! Monitoring threshold for ${selectedCountry.name}.`
      );
      setTimeout(() => {
        setActiveTab('subscriptions');
      }, 1200);
    } catch (err) {
      console.error('Alert subscription failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    await removeTrendAlert(id);
    setExistingAlerts(getLocalTrendAlerts());
  };

  const handleToggleAlert = async (id: string) => {
    await toggleTrendAlertState(id);
    setExistingAlerts(getLocalTrendAlerts());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-xl bg-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Bell className="w-3 h-3 text-purple-400" />
              <span>{isBn ? 'স্বয়ংক্রিয় পরিবেশগত সতর্কতা' : 'AUTOMATED TREND ALERT SYSTEM'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Syne',sans-serif] tracking-tight">
              {isBn ? 'প্রবণতা সতর্কতা সাবস্ক্রিপশন' : 'Trend Threshold Subscriptions'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'নাসার উপাত্ত যখন সংকটজনক জলবায়ু ও সামুদ্রিক সীমা অতিক্রম করবে তখন তাৎক্ষণিক নোটিফিকেশন পান।'
                : 'Receive automated notifications when verified Earth and ocean parameters cross critical thresholds.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Create vs Subscriptions */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isBn ? '+ নতুন সতর্কতা তৈরি করুন' : '+ Set New Threshold Alert'}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'subscriptions'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{isBn ? 'সক্রিয় সতর্কতাসমূহ' : 'Active Subscriptions'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-900/80 text-[10px] text-purple-200">
              {existingAlerts.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Create Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            {/* Target Region */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase block font-sans">
                {isBn ? 'ভৌগোলিক অঞ্চল / দেশ নির্বাচন (৭৩টি সমর্থিত)' : 'Target Region / Sovereign Nation (73 Supported)'}
              </label>
              <select
                value={selectedRegionCode}
                onChange={(e) => setSelectedRegionCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold font-mono focus:border-purple-500 focus:outline-none"
              >
                {GLOBAL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {isBn ? c.nameBn : c.name} ({c.code} • {c.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Environmental Parameter Selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase block font-sans">
                {isBn ? 'পরিবেশগত বা সামুদ্রিক চলক' : 'Environmental / Ocean Parameter'}
              </label>
              <select
                value={selectedParamId}
                onChange={(e) => setSelectedParamId(e.target.value as TrendAlert['parameter'])}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold font-mono focus:border-purple-500 focus:outline-none"
              >
                {ALERT_PARAMETERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isBn ? p.labelBn : p.label} ({p.unit}) — {p.source.split(' ')[0]}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 font-sans italic pt-0.5">
                {isBn ? currentParamConfig.scientificContextBn : currentParamConfig.scientificContext}
              </p>
            </div>

            {/* Threshold Condition and Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? 'সতর্কতার শর্ত' : 'Trigger Condition'}
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold font-mono focus:border-purple-500 focus:outline-none"
                >
                  <option value="above">{isBn ? 'সীমা অতিক্রম করলে (≥)' : 'Crosses Above (≥)'}</option>
                  <option value="below">{isBn ? 'সীমার নিচে নামলে (≤)' : 'Drops Below (≤)'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? `সংকটজনক মান (${currentParamConfig.unit})` : `Critical Threshold (${currentParamConfig.unit})`}
                </label>
                <input
                  type="number"
                  step={currentParamConfig.step}
                  min={currentParamConfig.min}
                  max={currentParamConfig.max}
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email and Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? 'প্রাপকের ইমেইল ঠিকানা *' : 'Notification Email *'}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? 'বিজ্ঞপ্তি প্রেরণের ব্যবধান' : 'Delivery Frequency'}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as TrendAlert['frequency'])}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold font-mono focus:border-purple-500 focus:outline-none"
                >
                  <option value="instant">{isBn ? 'তাৎক্ষণিক এলার্ট' : 'Instant Alert on Anomaly'}</option>
                  <option value="weekly_digest">{isBn ? 'সাপ্তাহিক সংক্ষিপ্ত বিবরণী' : 'Weekly Climatology Digest'}</option>
                  <option value="monthly_summary">{isBn ? 'মাসিক পূর্ণাঙ্গ প্রতিবেদন' : 'Monthly Trend Summary'}</option>
                </select>
              </div>
            </div>

            {/* Success message banner */}
            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 font-mono"
              >
                <Bell className="w-4 h-4 text-purple-200" />
                <span>
                  {isSubmitting
                    ? (isBn ? 'সতর্কতা সক্রিয় করা হচ্ছে...' : 'Activating Threshold Subscription...')
                    : (isBn ? 'সতর্কতা সাবস্ক্রিপশন সম্পন্ন করুন' : 'Activate Trend Alert Subscription')}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Existing Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-3">
            {existingAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                <p>{isBn ? 'বর্তমানে কোনো সক্রিয় সতর্কতা সাবস্ক্রিপশন নেই।' : 'No active threshold subscriptions registered.'}</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-mono text-xs font-bold"
                >
                  {isBn ? 'প্রথম সতর্কতা তৈরি করুন' : 'Create First Alert'}
                </button>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {existingAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs font-mono ${
                      alert.active
                        ? 'bg-slate-900 border-purple-800/40 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {alert.parameterLabel}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700">
                          {alert.condition === 'above' ? '≥' : '≤'} {alert.thresholdValue} {alert.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Region: <strong className="text-slate-300">{alert.targetRegionName}</strong> • Email: <strong className="text-slate-300">{alert.email}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleAlert(alert.id)}
                        className="p-1 rounded text-purple-400 hover:text-white"
                        title={alert.active ? 'Deactivate Alert' : 'Activate Alert'}
                      >
                        {alert.active ? (
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                        title="Delete Subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>{isBn ? 'নাসা ওপেন ডেটা পলিসি সমর্থিত' : 'NASA Open Earthdata Protocol'}</span>
          </div>
          <span>{isBn ? 'গ্লোবট্রেসএক্স স্বয়ংক্রিয় ইঞ্জিন' : 'GlobTraceX Deterministic Dispatch'}</span>
        </div>
      </div>
    </div>
  );
};

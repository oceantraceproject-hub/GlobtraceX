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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-950/95 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl text-white space-y-4 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/25 text-[9px] font-mono font-bold uppercase tracking-wider">
              <Bell className="w-2.5 h-2.5 text-purple-400" />
              <span>{isBn ? 'স্বয়ংক্রিয় পরিবেশগত সতর্কতা' : 'AUTOMATED TREND ALERT SYSTEM'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isBn ? 'প্রবণতা সতর্কতা সাবস্ক্রিপশন' : 'Trend Threshold Subscriptions'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isBn
                ? 'নাসার উপাত্ত যখন সংকটজনক জলবায়ু ও সামুদ্রিক সীমা অতিক্রম করবে তখন তাৎক্ষণিক নোটিফিকেশন পান।'
                : 'Receive automated notifications when verified Earth and ocean parameters cross critical thresholds.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Create vs Subscriptions */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] font-mono shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isBn ? '+ নতুন সতর্কতা' : '+ Set Threshold Alert'}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
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
          <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono overflow-y-auto pr-0.5">
            {/* Target Region */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase block font-sans">
                {isBn ? 'ভৌগোলিক অঞ্চল / দেশ নির্বাচন (৭৩টি সমর্থিত)' : 'Target Region / Nation (73 Supported)'}
              </label>
              <select
                value={selectedRegionCode}
                onChange={(e) => setSelectedRegionCode(e.target.value)}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-[11px] font-bold font-mono focus:border-purple-500 focus:outline-none"
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
                className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-[11px] font-bold font-mono focus:border-purple-500 focus:outline-none"
              >
                {ALERT_PARAMETERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isBn ? p.labelBn : p.label} ({p.unit}) — {p.source.split(' ')[0]}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 font-sans italic pt-0.5 line-clamp-2">
                {isBn ? currentParamConfig.scientificContextBn : currentParamConfig.scientificContext}
              </p>
            </div>

            {/* Threshold Condition and Value */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? 'সতর্কতার শর্ত' : 'Trigger Condition'}
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                  className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-[11px] font-bold font-mono focus:border-purple-500 focus:outline-none"
                >
                  <option value="above">{isBn ? 'সীমা অতিক্রম করলে (≥)' : 'Crosses Above (≥)'}</option>
                  <option value="below">{isBn ? 'সীমার নিচে নামলে (≤)' : 'Drops Below (≤)'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? `সংকটজনক মান (${currentParamConfig.unit})` : `Threshold (${currentParamConfig.unit})`}
                </label>
                <input
                  type="number"
                  step={currentParamConfig.step}
                  min={currentParamConfig.min}
                  max={currentParamConfig.max}
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-[11px] font-bold font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email and Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-[11px] font-mono placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase block font-sans">
                  {isBn ? 'বিজ্ঞপ্তি ব্যবধান' : 'Delivery Frequency'}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as TrendAlert['frequency'])}
                  className="w-full py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-[11px] font-bold font-mono focus:border-purple-500 focus:outline-none"
                >
                  <option value="instant">{isBn ? 'তাৎক্ষণিক এলার্ট' : 'Instant Alert on Anomaly'}</option>
                  <option value="weekly_digest">{isBn ? 'সাপ্তাহিক সারসংক্ষেপ' : 'Weekly Climatology Digest'}</option>
                  <option value="monthly_summary">{isBn ? 'মাসিক প্রতিবেদন' : 'Monthly Trend Summary'}</option>
                </select>
              </div>
            </div>

            {/* Success message banner */}
            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 font-mono"
              >
                <Bell className="w-3.5 h-3.5 text-purple-200" />
                <span>
                  {isSubmitting
                    ? (isBn ? 'সতর্কতা সক্রিয় করা হচ্ছে...' : 'Activating Subscription...')
                    : (isBn ? 'সতর্কতা সাবস্ক্রিপশন সম্পন্ন করুন' : 'Activate Trend Alert Subscription')}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Existing Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-2.5 overflow-y-auto max-h-60 pr-0.5">
            {existingAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs space-y-2">
                <Bell className="w-6 h-6 mx-auto text-slate-600 opacity-60" />
                <p>{isBn ? 'বর্তমানে কোনো সক্রিয় সতর্কতা নেই।' : 'No active threshold subscriptions.'}</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-mono text-xs font-bold"
                >
                  {isBn ? 'প্রথম সতর্কতা তৈরি করুন' : 'Create First Alert'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {existingAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 text-xs font-mono ${
                      alert.active
                        ? 'bg-slate-900 border-purple-800/40 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs truncate">
                          {alert.parameterLabel}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700">
                          {alert.condition === 'above' ? '≥' : '≤'} {alert.thresholdValue} {alert.unit}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {alert.targetRegionName} • {alert.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleAlert(alert.id)}
                        className="p-1 rounded text-purple-400 hover:text-white"
                        title={alert.active ? 'Deactivate Alert' : 'Activate Alert'}
                      >
                        {alert.active ? (
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                        title="Delete Subscription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

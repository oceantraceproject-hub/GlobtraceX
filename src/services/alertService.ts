import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

export interface TrendAlert {
  id: string;
  email: string;
  targetRegion: string;
  targetRegionName: string;
  parameter: 'sst' | 'sea_level' | 'hot_humid' | 'lst' | 'rainfall' | 'tws';
  parameterLabel: string;
  condition: 'above' | 'below';
  thresholdValue: number;
  unit: string;
  frequency: 'instant' | 'weekly_digest' | 'monthly_summary';
  createdAt: string;
  active: boolean;
}

const LOCAL_STORAGE_KEY = 'globtracex_trend_alerts';

export const ALERT_PARAMETERS: {
  id: TrendAlert['parameter'];
  label: string;
  labelBn: string;
  unit: string;
  defaultThreshold: number;
  defaultCondition: 'above' | 'below';
  min: number;
  max: number;
  step: number;
  source: string;
  scientificContext: string;
  scientificContextBn: string;
}[] = [
  {
    id: 'sst',
    label: 'Sea Surface Temperature',
    labelBn: 'সমুদ্র পৃষ্ঠের তাপমাত্রা',
    unit: '°C',
    defaultThreshold: 29.5,
    defaultCondition: 'above',
    min: 0,
    max: 35,
    step: 0.1,
    source: 'MODIS Aqua / Terra Sea Surface Temperature (4km)',
    scientificContext: 'Thermal anomaly threshold indicating marine heatwave conditions and coral bleaching risk.',
    scientificContextBn: 'সামুদ্রিক তাপপ্রবাহ এবং প্রবাল ক্ষয়ের ঝুঁকি নির্দেশকারী তাপীয় অসঙ্গতি সীমা।',
  },
  {
    id: 'sea_level',
    label: 'Sea Level Height Anomaly',
    labelBn: 'সমুদ্রপৃষ্ঠের উচ্চতা অসঙ্গতি',
    unit: 'mm',
    defaultThreshold: 65,
    defaultCondition: 'above',
    min: -100,
    max: 200,
    step: 1,
    source: 'NASA / CNES Satellite Altimetry Multi-Mission (GMSL)',
    scientificContext: 'Critical coastal storm-surge amplification and interannual sea level rise threshold.',
    scientificContextBn: 'উপকূলীয় জলোচ্ছ্বাস বৃদ্ধি এবং সমুদ্রপৃষ্ঠের উচ্চতা বৃদ্ধির সংকটজনক সীমা।',
  },
  {
    id: 'hot_humid',
    label: 'Hot & Humid Days',
    labelBn: 'উষ্ণ ও আর্দ্র দিন',
    unit: 'days/year',
    defaultThreshold: 45,
    defaultCondition: 'above',
    min: 0,
    max: 120,
    step: 1,
    source: 'NASA POWER Daily Meteorology (T2M_MAX ≥ 32°C & RH2M ≥ 70%)',
    scientificContext: 'Extreme compound thermal stress breaching human physiological cooling capacity.',
    scientificContextBn: 'মানবদেহের প্রাকৃতিক শীতলীকরণ ক্ষমতার সীমা অতিক্রমকারী চরম যৌগিক তাপপ্রবাহ।',
  },
  {
    id: 'lst',
    label: 'Land Surface Temperature',
    labelBn: 'ভূমিপৃষ্ঠের তাপমাত্রা',
    unit: '°C',
    defaultThreshold: 35.0,
    defaultCondition: 'above',
    min: -20,
    max: 60,
    step: 0.5,
    source: 'NASA MODIS Terra (MOD11C3 v061)',
    scientificContext: 'Radiometric surface skin temperature identifying agricultural heat stress and urban heat islands.',
    scientificContextBn: 'কৃষি তাপ-পীড়ন এবং নগর তাপ দ্বীপ শনাক্তকারী ভূপৃষ্ঠের তাপীয় নির্গমন মাত্রা।',
  },
  {
    id: 'rainfall',
    label: 'Monthly Precipitation Deficit',
    labelBn: 'মাসিক বৃষ্টিপাতের ঘাটতি',
    unit: 'mm/month',
    defaultThreshold: 50,
    defaultCondition: 'below',
    min: 0,
    max: 1000,
    step: 5,
    source: 'NASA GPM IMERG Final Precipitation (v07B)',
    scientificContext: 'Meteorological drought trigger threshold threatening rainfed crop cultivation and reservoir replenishment.',
    scientificContextBn: 'বৃষ্টি-নির্ভর ফসল এবং জলাধার ভরাটের জন্য হুমকিস্বরূপ আবহাওয়াজনিত খরা সতর্কবার্তা।',
  },
  {
    id: 'tws',
    label: 'Terrestrial Water Storage Deficit',
    labelBn: 'স্থলজ পানি সঞ্চয় ঘাটতি',
    unit: 'cm EWT',
    defaultThreshold: -5.0,
    defaultCondition: 'below',
    min: -20,
    max: 20,
    step: 0.5,
    source: 'NASA GRACE / GRACE-FO Mascon Ocean-Land (RL06M v2)',
    scientificContext: 'Subterranean aquifer depletion and regional hydrological drought anomaly.',
    scientificContextBn: 'ভূগর্ভস্থ অ্যাকুইফার হ্রাস এবং আঞ্চলিক জলতাত্ত্বিক খরা অসঙ্গতি।',
  },
];

// Read cached alerts from local storage
export function getLocalTrendAlerts(): TrendAlert[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Write alerts to local storage
export function setLocalTrendAlerts(alerts: TrendAlert[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.warn('Failed to persist alerts locally:', err);
  }
}

// Create and register a new Trend Alert
export async function createTrendAlert(
  params: Omit<TrendAlert, 'id' | 'createdAt' | 'active'>
): Promise<TrendAlert> {
  const newAlert: TrendAlert = {
    ...params,
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    active: true,
  };

  // Always persist locally
  const current = getLocalTrendAlerts();
  setLocalTrendAlerts([newAlert, ...current]);

  // If user is authenticated in Firebase, attempt Firestore persistence
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const alertDocRef = doc(db, 'users', currentUser.uid, 'trendAlerts', newAlert.id);
      await setDoc(alertDocRef, newAlert);
    } catch (err) {
      console.warn('Firestore alert sync deferred or offline:', err);
    }
  }

  return newAlert;
}

// Delete an alert
export async function removeTrendAlert(id: string): Promise<void> {
  const current = getLocalTrendAlerts();
  setLocalTrendAlerts(current.filter((a) => a.id !== id));

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const alertDocRef = doc(db, 'users', currentUser.uid, 'trendAlerts', id);
      await deleteDoc(alertDocRef);
    } catch (err) {
      console.warn('Firestore alert removal deferred:', err);
    }
  }
}

// Toggle an alert active state
export async function toggleTrendAlertState(id: string): Promise<TrendAlert | undefined> {
  const current = getLocalTrendAlerts();
  let updatedAlert: TrendAlert | undefined;

  const nextAlerts = current.map((a) => {
    if (a.id === id) {
      updatedAlert = { ...a, active: !a.active };
      return updatedAlert;
    }
    return a;
  });

  setLocalTrendAlerts(nextAlerts);

  const currentUser = auth.currentUser;
  if (currentUser && updatedAlert) {
    try {
      const alertDocRef = doc(db, 'users', currentUser.uid, 'trendAlerts', id);
      await setDoc(alertDocRef, updatedAlert);
    } catch (err) {
      console.warn('Firestore alert toggle deferred:', err);
    }
  }

  return updatedAlert;
}

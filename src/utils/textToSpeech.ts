/**
 * @file textToSpeech.ts
 * @description Accessible Text-to-Speech narration utility for GlobTraceX results.
 * Strictly reads exact values from the deterministic GlobalScientificResult object.
 * Never invents, modifies, or hallucinates numbers.
 */

import { GlobalScientificResult } from '../compute/globTraceScience';

export function synthesizeResultNarration(
  result: GlobalScientificResult,
  language: 'en' | 'bn' = 'en'
): string {
  if (language === 'bn') {
    const dirBn =
      result.trend.direction === 'increasing'
        ? 'ঊর্ধ্বমুখী'
        : result.trend.direction === 'decreasing'
        ? 'নিম্নমুখী'
        : 'স্থির';
    const sigBn = result.trend.significant_at_0_05
      ? 'পরিসংখ্যানগতভাবে তাৎপর্যপূর্ণ'
      : 'তাৎপর্যপূর্ণ নয়';

    return `${result.country}-এর জন্য ${result.variableName} বিশ্লেষণ ফলাফল। ` +
      `পর্যবেক্ষিত প্রবণতা ${dirBn}, পরিবর্তনের হার প্রতি দশকে ${result.slope.valuePerDecade} ${result.units}। ` +
      `মান-কেন্ডাল পি-মান ${result.trend.p_value}, যা ${sigBn}। ` +
      `৯৫ শতাংশ আস্থা ব্যবধান ${result.slope.ci_low} থেকে ${result.slope.ci_high}। ` +
      `উপাত্তের পূর্ণতা শতকরা ${result.n_observations.coverage_percent} ভাগ। ` +
      `ট্রেন্ড স্থায়িত্ব: ${result.trendStability.stabilityCategory}। ` +
      `সূত্র: নাসা ${result.provenance.dataset_id} উপাত্ত হতে গ্লোবট্রেসএক্স স্থানিক পরিমাপের মাধ্যমে নির্ণিত।`;
  }

  const sigEn = result.trend.significant_at_0_05
    ? 'statistically significant at alpha equals zero point zero five'
    : 'not statistically significant';

  return `Scientific trend investigation for ${result.country}, measuring ${result.variableName}. ` +
    `The observed direction is ${result.trend.direction}, with a Theil-Sen median slope of ${result.slope.valuePerDecade} ${result.units}. ` +
    `The Mann-Kendall p-value is ${result.trend.p_value}, which is ${sigEn}. ` +
    `The ninety-five percent confidence interval ranges from ${result.slope.ci_low} to ${result.slope.ci_high}. ` +
    `Observation coverage is ${result.n_observations.coverage_percent} percent over ${result.n_observations.validCount} valid satellite months. ` +
    `Trend stability evaluation indicates a ${result.trendStability.stabilityCategory}. ` +
    `Derived from NASA dataset ${result.provenance.dataset_id} using GlobTraceX spatial aggregation.`;
}

export function speakResult(
  result: GlobalScientificResult,
  language: 'en' | 'bn' = 'en',
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const text = synthesizeResultNarration(result, language);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

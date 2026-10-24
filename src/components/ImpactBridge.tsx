import React from 'react';
import { ImpactBridgeStep } from '../services/intelligenceEngine';
import { Activity, ShieldCheck, Waves, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ImpactBridgeProps {
  steps: ImpactBridgeStep[];
}

export const ImpactBridge: React.FC<ImpactBridgeProps> = ({ steps }) => {
  const getIcon = (step: number) => {
    switch (step) {
      case 1:
        return Activity;
      case 2:
        return ShieldCheck;
      case 3:
        return Waves;
      case 4:
        return HelpCircle;
      case 5:
        return CheckCircle2;
      default:
        return Activity;
    }
  };

  const getStepStyles = (tone: ImpactBridgeStep['tone']) => {
    switch (tone) {
      case 'success':
        return {
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          circle: 'bg-emerald-600 text-white',
          border: 'border-emerald-200',
        };
      case 'warning':
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          circle: 'bg-amber-600 text-white',
          border: 'border-amber-200',
        };
      case 'caution':
        return {
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          circle: 'bg-rose-600 text-white',
          border: 'border-rose-200',
        };
      case 'info':
        return {
          badge: 'bg-purple-50 text-purple-800 border-purple-200',
          circle: 'bg-purple-600 text-white',
          border: 'border-purple-200',
        };
      default:
        return {
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          circle: 'bg-slate-700 text-white',
          border: 'border-slate-200',
        };
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Impact Bridge</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-semibold">
              From Earth Data to Human Action
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Logical causal progression connecting raw satellite radiometry to proportionate local intervention.
          </p>
        </div>
      </div>

      {/* Responsive Horizontal/Vertical Pathway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((s, idx) => {
          const Icon = getIcon(s.step);
          const style = getStepStyles(s.tone);
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={s.step}
              className={`p-3.5 rounded-2xl bg-white border ${style.border} shadow-2xs flex flex-col justify-between space-y-2.5 relative transition-all hover:shadow-xs`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full ${style.circle} flex items-center justify-center text-[10px] font-bold font-mono`}>
                      {s.step}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                  {s.badge && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${style.badge} truncate max-w-[110px]`}>
                      {s.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-950 leading-snug">{s.title}</p>
                  <p className="text-[10px] font-mono font-medium text-slate-500">{s.subtitle}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {s.content}
                </p>
              </div>

              {!isLast && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 items-center justify-center">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

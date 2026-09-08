import React from 'react';
import { Check } from 'lucide-react';

/**
 * StepIndicator Component
 * Clinical progress visualization adhering to The Ordinary's typographic discipline
 */
export default function StepIndicator({ currentStep, totalSteps, steps }) {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full pb-6 mb-6 border-b border-neutral-200">
      {/* Top Meta Line */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-[10px] uppercase tracking-clinical text-neutral-400">
            PHASE {String(currentStep).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
          </span>
          <span className="text-neutral-300">|</span>
          <span className="font-medium text-neutral-900 tracking-wide uppercase text-[11px]">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="font-mono text-[10px] text-VASAVI-blue font-semibold">
          {Math.round(progressPercent)}% COMPLETE
        </div>
      </div>

      {/* Thin Clinical Progress Bar */}
      <div className="w-full h-1 bg-neutral-100 relative overflow-hidden">
        <div
          className="h-full bg-VASAVI-blue transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Subtle Gold Pulse Indicator at lead edge */}
        <div
          className="absolute top-0 bottom-0 w-1.5 bg-VASAVI-gold transition-all duration-300"
          style={{ left: `calc(${progressPercent}% - 3px)` }}
        />
      </div>

      {/* Step Pills */}
      <div
        className="grid gap-2 mt-4"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className={`p-2 border transition-all text-left ${
                isActive
                  ? 'border-neutral-900 bg-white'
                  : isCompleted
                  ? 'border-neutral-200 bg-neutral-50/70'
                  : 'border-neutral-100 bg-white opacity-40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-neutral-400">
                  {String(stepNum).padStart(2, '0')}
                </span>
                {isCompleted ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-VASAVI-blue text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-VASAVI-gold"></span>
                ) : null}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider truncate text-neutral-800">
                {step.shortName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

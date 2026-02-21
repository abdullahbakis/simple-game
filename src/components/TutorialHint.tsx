import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

interface TutorialHintProps {
  level: number;
  gameState: string;
  score: number;
}

interface HintStep {
  icon: string;
  title: string;
  desc: string;
}

function useHintSteps(level: number): HintStep[] {
  const { tr } = useLang();
  if (level === 1) {
    return [
      { icon: '✏️', title: tr.tutorial.drawLinesTitle, desc: tr.tutorial.drawLinesDesc },
      { icon: '🍬', title: tr.tutorial.guideCandiesTitle, desc: tr.tutorial.guideCandiesDesc },
    ];
  }
  if (level === 2) {
    return [
      { icon: '🪣', title: tr.tutorial.fillBucketTitle, desc: tr.tutorial.fillBucketDesc },
      { icon: '❤️', title: tr.tutorial.watchHpTitle, desc: tr.tutorial.watchHpDesc },
    ];
  }
  if (level === 3) {
    return [
      { icon: '💨', title: tr.tutorial.windTitle, desc: tr.tutorial.windDesc },
    ];
  }
  return [];
}

export default function TutorialHint({ level, gameState, score }: TutorialHintProps) {
  const steps = useHintSteps(level);
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setStepIdx(0);
    setDismissed(false);
    setVisible(false);
  }, [level]);

  useEffect(() => {
    if (gameState !== 'playing' || dismissed || steps.length === 0) return;
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, [gameState, dismissed, steps.length, level]);

  useEffect(() => {
    if (score >= 3 && visible && stepIdx < steps.length - 1) {
      setStepIdx(s => s + 1);
    }
  }, [score, visible, stepIdx, steps.length]);

  if (!visible || dismissed || steps.length === 0 || level > 3) return null;

  const current = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  function advance() {
    if (!isLast) {
      setStepIdx(s => s + 1);
    } else {
      setDismissed(true);
      setVisible(false);
    }
  }

  return (
    <div
      className="absolute bottom-24 left-1/2 z-30 pointer-events-auto"
      style={{ transform: 'translateX(-50%)', width: 'min(88vw, 320px)' }}
    >
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          background: 'linear-gradient(160deg, #0E1F35 0%, #091525 100%)',
          borderColor: 'rgba(0,212,255,0.18)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 24px rgba(0,212,255,0.07)',
        }}
      >
        <div
          className="px-4 py-3 flex items-start gap-3"
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(0,212,255,0.10)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            {current.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm leading-tight">{current.title}</p>
            <p className="text-white/50 text-xs leading-snug mt-0.5">{current.desc}</p>
          </div>
        </div>

        <div
          className="flex items-center justify-between px-4 pb-3"
        >
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === stepIdx ? 16 : 6,
                  background: i === stepIdx
                    ? '#22d3ee'
                    : i < stepIdx
                    ? 'rgba(34,211,238,0.35)'
                    : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
          <button
            onClick={advance}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs text-white transition-all active:scale-95"
            style={{ background: 'rgba(34,211,238,0.18)', border: '1px solid rgba(34,211,238,0.25)' }}
          >
            {isLast ? '✓ OK' : <><ChevronRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

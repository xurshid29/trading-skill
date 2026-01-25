import { Tag } from 'antd';
import type { PatternType } from '../../api/types';

const patternConfig: Record<PatternType, { color: string; label: string }> = {
  starting_uptrend: { color: 'green', label: 'Starting Uptrend' },
  consolidation: { color: 'blue', label: 'Consolidation' },
  downtrend_reversal: { color: 'orange', label: 'Downtrend Reversal' },
  unknown: { color: 'default', label: 'Unknown' },
};

interface PatternBadgeProps {
  pattern: PatternType;
}

export function PatternBadge({ pattern }: PatternBadgeProps) {
  const config = patternConfig[pattern];
  return <Tag color={config.color}>{config.label}</Tag>;
}

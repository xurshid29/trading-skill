import { Tag } from 'antd';
import type { TierType } from '../../api/types';

const tierConfig: Record<TierType, { color: string; label: string }> = {
  buy: { color: 'success', label: 'BUY' },
  watch: { color: 'warning', label: 'WATCH' },
  skip: { color: 'default', label: 'SKIP' },
};

interface TierBadgeProps {
  tier: TierType;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const config = tierConfig[tier];
  return <Tag color={config.color}>{config.label}</Tag>;
}

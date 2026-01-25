import { Tag } from 'antd';
import type { NewsStatusType } from '../../api/types';

const statusConfig: Record<NewsStatusType, { color: string; label: string }> = {
  pending: { color: 'default', label: 'Pending' },
  clean: { color: 'success', label: 'Clean' },
  red_flag: { color: 'error', label: 'Red Flag' },
};

interface NewsStatusBadgeProps {
  status: NewsStatusType;
}

export function NewsStatusBadge({ status }: NewsStatusBadgeProps) {
  const config = statusConfig[status];
  return <Tag color={config.color}>{config.label}</Tag>;
}

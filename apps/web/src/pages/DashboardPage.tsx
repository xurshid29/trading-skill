import { Typography } from 'antd';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentScreenings } from '../components/dashboard/RecentScreenings';

const { Title } = Typography;

export function DashboardPage() {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <StatsCards />
      <RecentScreenings />
    </div>
  );
}

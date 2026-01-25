import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
  SearchOutlined,
  RiseOutlined,
  EyeOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { DashboardStats } from '../../api/types';

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Total Screenings"
            value={stats?.totalScreenings ?? 0}
            prefix={<SearchOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Buy Tier"
            value={stats?.tierCounts?.buy ?? 0}
            prefix={<RiseOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Watch Tier"
            value={stats?.tierCounts?.watch ?? 0}
            prefix={<EyeOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Skip Tier"
            value={stats?.tierCounts?.skip ?? 0}
            prefix={<StopOutlined />}
            valueStyle={{ color: '#8c8c8c' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

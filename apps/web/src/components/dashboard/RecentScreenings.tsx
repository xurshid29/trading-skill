import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, Typography, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { Screening } from '../../api/types';

const { Text } = Typography;

const statusColors: Record<string, string> = {
  running: 'processing',
  completed: 'success',
  failed: 'error',
};

export function RecentScreenings() {
  const navigate = useNavigate();

  const { data: screenings, isLoading } = useQuery({
    queryKey: ['screenings', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get<Screening[]>('/api/screenings?limit=5');
      return response.data;
    },
  });

  return (
    <Card title="Recent Screenings" extra={<a onClick={() => navigate('/screenings')}>View All</a>}>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : !screenings?.length ? (
        <Empty description="No screenings yet" />
      ) : (
        <List
          dataSource={screenings}
          renderItem={(screening) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/screenings/${screening.id}`)}
            >
              <List.Item.Meta
                title={screening.name || 'Unnamed Screening'}
                description={
                  <Text type="secondary">
                    {new Date(screening.created_at).toLocaleDateString()}
                    {screening.price_min && screening.price_max && (
                      <> | ${screening.price_min} - ${screening.price_max}</>
                    )}
                  </Text>
                }
              />
              <div>
                <Tag color={statusColors[screening.status]}>{screening.status}</Tag>
                <Text>{screening.total_results} results</Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}

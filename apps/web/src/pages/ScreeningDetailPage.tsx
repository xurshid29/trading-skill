import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Space, Tag, Button, Select, Spin, Empty, Descriptions, Alert } from 'antd';
import { ArrowLeftOutlined, SyncOutlined } from '@ant-design/icons';
import { useScreening } from '../hooks/useScreenings';
import { ScreeningTable } from '../components/screening/ScreeningTable';
import type { TierType, PatternType } from '../api/types';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  running: 'processing',
  completed: 'success',
  failed: 'error',
};

export function ScreeningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tierFilter, setTierFilter] = useState<TierType | undefined>();
  const [patternFilter, setPatternFilter] = useState<PatternType | undefined>();

  const { data: screening, isLoading } = useScreening(id!);

  // Poll while running
  const isRunning = screening?.status === 'running';
  useScreening(id!, {
    refetchInterval: isRunning ? 3000 : false,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!screening) {
    return (
      <Empty description="Screening not found">
        <Button onClick={() => navigate('/screenings')}>Back to Screenings</Button>
      </Empty>
    );
  }

  const filteredResults = screening.results.filter((result) => {
    if (tierFilter && result.tier !== tierFilter) return false;
    if (patternFilter && result.pattern !== patternFilter) return false;
    return true;
  });

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/screenings')}
        style={{ marginBottom: 16 }}
      >
        Back to Screenings
      </Button>

      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          {screening.name || 'Unnamed Screening'}
        </Title>

        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[screening.status]}>{screening.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Results">
            {screening.total_results}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(screening.created_at).toLocaleString()}
          </Descriptions.Item>
          {screening.price_min !== null && (
            <Descriptions.Item label="Price Range">
              ${screening.price_min} - ${screening.price_max}
            </Descriptions.Item>
          )}
          {screening.completed_at && (
            <Descriptions.Item label="Completed">
              {new Date(screening.completed_at).toLocaleString()}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {isRunning && (
        <Alert
          message="Screening in Progress"
          description="The screening is running in the background. Results will appear automatically when complete."
          type="info"
          icon={<SyncOutlined spin />}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {screening.status === 'failed' && (
        <Alert
          message="Screening Failed"
          description="The screening encountered an error. Please try creating a new one."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card
        title={
          <Space>
            <Text strong>Results</Text>
            <Text type="secondary">({filteredResults.length} shown)</Text>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="Filter by Tier"
              allowClear
              style={{ width: 130 }}
              value={tierFilter}
              onChange={setTierFilter}
              options={[
                { value: 'buy', label: 'Buy' },
                { value: 'watch', label: 'Watch' },
                { value: 'skip', label: 'Skip' },
              ]}
            />
            <Select
              placeholder="Filter by Pattern"
              allowClear
              style={{ width: 180 }}
              value={patternFilter}
              onChange={setPatternFilter}
              options={[
                { value: 'starting_uptrend', label: 'Starting Uptrend' },
                { value: 'consolidation', label: 'Consolidation' },
                { value: 'downtrend_reversal', label: 'Downtrend Reversal' },
                { value: 'unknown', label: 'Unknown' },
              ]}
            />
          </Space>
        }
      >
        <ScreeningTable results={filteredResults} />
      </Card>
    </div>
  );
}

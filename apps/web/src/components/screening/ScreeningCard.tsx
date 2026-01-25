import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { Screening } from '../../api/types';

const { Text, Title } = Typography;

const statusColors: Record<string, string> = {
  running: 'processing',
  completed: 'success',
  failed: 'error',
};

interface ScreeningCardProps {
  screening: Screening;
  onDelete?: (id: string) => void;
  deleting?: boolean;
}

export function ScreeningCard({ screening, onDelete, deleting }: ScreeningCardProps) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/screenings/${screening.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleView}
      style={{ height: '100%' }}
      actions={[
        <Button
          key="view"
          type="text"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleView();
          }}
        >
          View
        </Button>,
        <Popconfirm
          key="delete"
          title="Delete this screening?"
          description="This will also delete all results."
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete?.(screening.id);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleting}
            onClick={(e) => e.stopPropagation()}
          >
            Delete
          </Button>
        </Popconfirm>,
      ]}
    >
      <Title level={5} style={{ marginBottom: 8 }}>
        {screening.name || 'Unnamed Screening'}
      </Title>

      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div>
          <Tag color={statusColors[screening.status]}>{screening.status}</Tag>
          <Text type="secondary">{screening.total_results} results</Text>
        </div>

        {screening.price_min !== null && screening.price_max !== null && (
          <Text type="secondary">
            Price: ${screening.price_min} - ${screening.price_max}
          </Text>
        )}

        <Text type="secondary">
          {new Date(screening.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Space>
    </Card>
  );
}

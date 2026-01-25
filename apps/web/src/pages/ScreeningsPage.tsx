import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Row, Col, Spin, Empty, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useScreenings, useDeleteScreening } from '../hooks/useScreenings';
import { ScreeningCard } from '../components/screening/ScreeningCard';
import { CreateScreeningModal } from '../components/screening/CreateScreeningModal';

const { Title } = Typography;

export function ScreeningsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: screenings, isLoading } = useScreenings();
  const deleteMutation = useDeleteScreening();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Screening deleted');
    } catch (error) {
      message.error('Failed to delete screening');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Screenings</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          New Screening
        </Button>
      </div>

      {!screenings?.length ? (
        <Empty
          description="No screenings yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Create Your First Screening
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {screenings.map((screening) => (
            <Col key={screening.id} xs={24} sm={12} lg={8} xl={6}>
              <ScreeningCard
                screening={screening}
                onDelete={handleDelete}
                deleting={deletingId === screening.id}
              />
            </Col>
          ))}
        </Row>
      )}

      <CreateScreeningModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(id) => navigate(`/screenings/${id}`)}
      />
    </div>
  );
}

import { Modal, Form, Input, InputNumber, message } from 'antd';
import { useCreateScreening } from '../../hooks/useScreenings';

interface CreateScreeningModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

interface FormValues {
  name?: string;
  priceMin?: number;
  priceMax?: number;
}

export function CreateScreeningModal({ open, onClose, onSuccess }: CreateScreeningModalProps) {
  const [form] = Form.useForm<FormValues>();
  const createMutation = useCreateScreening();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const result = await createMutation.mutateAsync(values);
      message.success('Screening started! It will run in the background.');
      form.resetFields();
      onClose();
      onSuccess?.(result.id);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <Modal
      title="Create New Screening"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createMutation.isPending}
      okText="Create"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name">
          <Input placeholder="e.g., Swing Trade Candidates" />
        </Form.Item>

        <Form.Item label="Price Range">
          <Input.Group compact>
            <Form.Item name="priceMin" noStyle>
              <InputNumber
                placeholder="Min"
                min={0}
                style={{ width: '50%' }}
                prefix="$"
              />
            </Form.Item>
            <Form.Item name="priceMax" noStyle>
              <InputNumber
                placeholder="Max"
                min={0}
                style={{ width: '50%' }}
                prefix="$"
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}

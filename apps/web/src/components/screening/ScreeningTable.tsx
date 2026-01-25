import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Select, Typography, Tooltip, message } from 'antd';
import type { TableProps } from 'antd';
import { TierBadge } from './TierBadge';
import { PatternBadge } from './PatternBadge';
import { NewsStatusBadge } from './NewsStatusBadge';
import { useUpdateResult } from '../../hooks/useScreenings';
import type { ScreeningResult, TierType, NewsStatusType } from '../../api/types';

const { Link } = Typography;

// Helper to safely convert database decimals (strings) to numbers
const toNum = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

interface ScreeningTableProps {
  results: ScreeningResult[];
  loading?: boolean;
}

export function ScreeningTable({ results, loading }: ScreeningTableProps) {
  const navigate = useNavigate();
  const updateMutation = useUpdateResult();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleTierChange = async (resultId: string, tier: TierType) => {
    setUpdatingId(resultId);
    try {
      await updateMutation.mutateAsync({ resultId, data: { tier } });
      message.success('Tier updated');
    } catch {
      message.error('Failed to update tier');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNewsStatusChange = async (resultId: string, newsStatus: NewsStatusType) => {
    setUpdatingId(resultId);
    try {
      await updateMutation.mutateAsync({ resultId, data: { newsStatus } });
      message.success('News status updated');
    } catch {
      message.error('Failed to update news status');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: TableProps<ScreeningResult>['columns'] = [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
      fixed: 'left',
      width: 100,
      render: (ticker: string) => (
        <Link strong onClick={() => navigate(`/analysis/${ticker}`)}>
          {ticker}
        </Link>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price: unknown) => {
        const num = toNum(price);
        return num !== null ? `$${num.toFixed(2)}` : '-';
      },
    },
    {
      title: 'Change',
      dataIndex: 'change_pct',
      key: 'change_pct',
      width: 80,
      render: (change: unknown) => {
        const num = toNum(change);
        if (num === null) return '-';
        const color = num >= 0 ? '#52c41a' : '#ff4d4f';
        return <span style={{ color }}>{num.toFixed(2)}%</span>;
      },
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      width: 120,
      render: (tier: TierType, record) => (
        <Select
          value={tier}
          size="small"
          style={{ width: 100 }}
          loading={updatingId === record.id}
          onChange={(value) => handleTierChange(record.id, value)}
          options={[
            { value: 'buy', label: <TierBadge tier="buy" /> },
            { value: 'watch', label: <TierBadge tier="watch" /> },
            { value: 'skip', label: <TierBadge tier="skip" /> },
          ]}
        />
      ),
    },
    {
      title: 'Pattern',
      dataIndex: 'pattern',
      key: 'pattern',
      width: 150,
      render: (pattern) => <PatternBadge pattern={pattern} />,
    },
    {
      title: 'News',
      dataIndex: 'news_status',
      key: 'news_status',
      width: 130,
      render: (status: NewsStatusType, record) => {
        const newsNotes = record.news_notes;
        const newsHeadlines = (record.raw_data?.news as string[] | undefined) || [];
        const tooltipContent = newsNotes || newsHeadlines.length > 0 ? (
          <div style={{ maxWidth: 400 }}>
            {newsNotes && <div style={{ marginBottom: newsHeadlines.length > 0 ? 8 : 0 }}><strong>Summary:</strong> {newsNotes}</div>}
            {newsHeadlines.length > 0 && (
              <div>
                <strong>Headlines:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: 16 }}>
                  {newsHeadlines.slice(0, 5).map((headline, i) => (
                    <li key={i} style={{ fontSize: 12 }}>{headline}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null;

        const selectElement = (
          <Select
            value={status}
            size="small"
            style={{ width: 110 }}
            loading={updatingId === record.id}
            onChange={(value) => handleNewsStatusChange(record.id, value)}
            options={[
              { value: 'pending', label: <NewsStatusBadge status="pending" /> },
              { value: 'clean', label: <NewsStatusBadge status="clean" /> },
              { value: 'red_flag', label: <NewsStatusBadge status="red_flag" /> },
            ]}
          />
        );

        return tooltipContent ? (
          <Tooltip title={tooltipContent} placement="left">
            {selectElement}
          </Tooltip>
        ) : selectElement;
      },
    },
    {
      title: 'RSI',
      dataIndex: 'rsi',
      key: 'rsi',
      width: 70,
      render: (rsi: unknown) => {
        const num = toNum(rsi);
        return num !== null ? num.toFixed(1) : '-';
      },
    },
    {
      title: 'SMA20',
      dataIndex: 'sma20_pct',
      key: 'sma20_pct',
      width: 80,
      render: (pct: unknown) => {
        const num = toNum(pct);
        if (num === null) return '-';
        const color = num >= 0 ? '#52c41a' : '#ff4d4f';
        return <span style={{ color }}>{num.toFixed(1)}%</span>;
      },
    },
    {
      title: 'SMA50',
      dataIndex: 'sma50_pct',
      key: 'sma50_pct',
      width: 80,
      render: (pct: unknown) => {
        const num = toNum(pct);
        if (num === null) return '-';
        const color = num >= 0 ? '#52c41a' : '#ff4d4f';
        return <span style={{ color }}>{num.toFixed(1)}%</span>;
      },
    },
    {
      title: 'Inst Own',
      dataIndex: 'inst_own_pct',
      key: 'inst_own_pct',
      width: 90,
      render: (pct: unknown) => {
        const num = toNum(pct);
        return num !== null ? `${num.toFixed(1)}%` : '-';
      },
    },
    {
      title: 'Short %',
      dataIndex: 'short_float_pct',
      key: 'short_float_pct',
      width: 80,
      render: (pct: unknown) => {
        const num = toNum(pct);
        return num !== null ? `${num.toFixed(1)}%` : '-';
      },
    },
  ];

  return (
    <Table
      dataSource={results}
      columns={columns}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      size="small"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `${total} results`,
      }}
    />
  );
}

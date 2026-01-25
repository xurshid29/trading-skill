import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Input, Button, Space, Row, Col, Statistic, Empty, Spin, Descriptions, Tag, Alert, List, Divider, Collapse } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined, DollarOutlined, AimOutlined, ThunderboltOutlined, AlertOutlined, HistoryOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ScreeningResultWithInfo } from '../api/types';

const { Title, Text, Paragraph } = Typography;

// Helper to safely convert database decimals (strings) to numbers
const toNum = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const fmt = (value: unknown, decimals = 2): string => {
  const num = toNum(value);
  return num !== null ? num.toFixed(decimals) : '-';
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Unknown date';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Component to render a single result's details
function ResultDetails({ result }: { result: ScreeningResultWithInfo }) {
  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Price"
              value={toNum(result.price) || 0}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Change"
              value={toNum(result.change_pct) || 0}
              precision={2}
              suffix="%"
              valueStyle={{
                color: (toNum(result.change_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
              }}
              prefix={
                (toNum(result.change_pct) || 0) >= 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="RSI" value={toNum(result.rsi) ?? '-'} precision={1} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Market Cap"
              value={toNum(result.market_cap) || 0}
              formatter={(value) => {
                const num = Number(value);
                if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
                if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
                if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
                return `$${num.toLocaleString()}`;
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Technical Indicators" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="SMA 20">
                <Text
                  style={{
                    color:
                      (toNum(result.sma20_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {fmt(result.sma20_pct)}%
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="SMA 50">
                <Text
                  style={{
                    color:
                      (toNum(result.sma50_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {fmt(result.sma50_pct)}%
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="SMA 200">
                <Text
                  style={{
                    color:
                      (toNum(result.sma200_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {fmt(result.sma200_pct)}%
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="52W High">
                {fmt(result.high_52w_pct)}%
              </Descriptions.Item>
              <Descriptions.Item label="52W Low">
                {fmt(result.low_52w_pct)}%
              </Descriptions.Item>
              <Descriptions.Item label="Beta">
                {fmt(result.beta)}
              </Descriptions.Item>
              <Descriptions.Item label="ATR">
                {fmt(result.atr)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Ownership & Short Interest" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Inst. Own">
                {fmt(result.inst_own_pct, 1)}%
              </Descriptions.Item>
              <Descriptions.Item label="Inst. Trans">
                <Text
                  style={{
                    color:
                      (toNum(result.inst_trans_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {fmt(result.inst_trans_pct, 1)}%
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Insider Own">
                {fmt(result.insider_own_pct, 1)}%
              </Descriptions.Item>
              <Descriptions.Item label="Insider Trans">
                <Text
                  style={{
                    color:
                      (toNum(result.insider_trans_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {fmt(result.insider_trans_pct, 1)}%
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Short Float">
                {fmt(result.short_float_pct, 1)}%
              </Descriptions.Item>
              <Descriptions.Item label="Short Ratio">
                {fmt(result.short_ratio)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Fundamentals" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="P/E Ratio">
                {fmt(result.pe_ratio)}
              </Descriptions.Item>
              <Descriptions.Item label="Profit Margin">
                {fmt(result.profit_margin_pct, 1)}%
              </Descriptions.Item>
              <Descriptions.Item label="Debt/Equity">
                {fmt(result.debt_equity)}
              </Descriptions.Item>
              <Descriptions.Item label="Dividend Yield">
                {fmt(result.dividend_yield)}%
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Classification" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tier">
                <Tag
                  color={
                    result.tier === 'buy'
                      ? 'success'
                      : result.tier === 'watch'
                      ? 'warning'
                      : 'default'
                  }
                  style={{ fontSize: 14, padding: '2px 12px' }}
                >
                  {result.tier.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Pattern">
                <Tag color="blue">
                  {result.pattern.replace(/_/g, ' ').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="News Status">
                <Tag
                  color={
                    result.news_status === 'clean'
                      ? 'success'
                      : result.news_status === 'red_flag'
                      ? 'error'
                      : 'default'
                  }
                  icon={
                    result.news_status === 'clean' ? (
                      <CheckCircleOutlined />
                    ) : result.news_status === 'red_flag' ? (
                      <ExclamationCircleOutlined />
                    ) : (
                      <WarningOutlined />
                    )
                  }
                >
                  {result.news_status.replace(/_/g, ' ').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {result.earnings_date && (
                <Descriptions.Item label="Earnings Date">
                  {new Date(result.earnings_date).toLocaleDateString()}
                </Descriptions.Item>
              )}
              {result.raw_data?.recommendation?.sector && (
                <Descriptions.Item label="Sector">
                  {result.raw_data.recommendation.sector}
                </Descriptions.Item>
              )}
              {result.raw_data?.recommendation?.industry && (
                <Descriptions.Item label="Industry">
                  {result.raw_data.recommendation.industry}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Recommendation Section */}
      {result.raw_data?.recommendation && (
        <>
          <Divider style={{ marginTop: 24 }}>
            <Title level={5} style={{ margin: 0 }}>Trade Recommendation</Title>
          </Divider>

          {/* Watch Reason Alert */}
          {result.tier === 'watch' && result.raw_data.recommendation.watchReason && (
            <Alert
              message="Watch Reason"
              description={result.raw_data.recommendation.watchReason}
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={[16, 16]}>
            {/* Trade Setup Card */}
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <DollarOutlined />
                    Trade Setup
                  </Space>
                }
                size="small"
                style={{ height: '100%' }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Entry Range"
                      value={`$${result.raw_data.recommendation.entry.min.toFixed(2)} - $${result.raw_data.recommendation.entry.max.toFixed(2)}`}
                      valueStyle={{ fontSize: 14, color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Stop Loss"
                      value={result.raw_data.recommendation.stopLoss}
                      prefix="$"
                      precision={2}
                      valueStyle={{ fontSize: 14, color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Target 1"
                      value={result.raw_data.recommendation.target1}
                      prefix="$"
                      precision={2}
                      valueStyle={{ fontSize: 14, color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    {result.raw_data.recommendation.target2 ? (
                      <Statistic
                        title="Target 2"
                        value={result.raw_data.recommendation.target2}
                        prefix="$"
                        precision={2}
                        valueStyle={{ fontSize: 14, color: '#52c41a' }}
                      />
                    ) : (
                      <Statistic
                        title="Risk/Reward"
                        value={result.raw_data.recommendation.riskReward}
                        valueStyle={{ fontSize: 14, color: '#722ed1' }}
                      />
                    )}
                  </Col>
                </Row>
                {result.raw_data.recommendation.target2 && (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <Tag color="purple" style={{ fontSize: 12, padding: '2px 12px' }}>
                      Risk/Reward: {result.raw_data.recommendation.riskReward}
                    </Tag>
                  </div>
                )}
              </Card>
            </Col>

            {/* Thesis Card */}
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <AimOutlined />
                    Investment Thesis
                  </Space>
                }
                size="small"
                style={{ height: '100%' }}
              >
                <Paragraph style={{ marginBottom: 0, fontSize: 13 }}>
                  {result.raw_data.recommendation.thesis}
                </Paragraph>
              </Card>
            </Col>

            {/* Catalysts Card */}
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#52c41a' }} />
                    Catalysts
                  </Space>
                }
                size="small"
              >
                <List
                  size="small"
                  dataSource={result.raw_data.recommendation.catalysts}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text style={{ fontSize: 13 }}>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Risks Card */}
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <AlertOutlined style={{ color: '#ff4d4f' }} />
                    Risks
                  </Space>
                }
                size="small"
              >
                <List
                  size="small"
                  dataSource={result.raw_data.recommendation.risks}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <Space>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                        <Text style={{ fontSize: 13 }}>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* News Headlines Section */}
      {result.raw_data?.news && result.raw_data.news.length > 0 && (
        <>
          <Divider style={{ marginTop: 24 }}>
            <Title level={5} style={{ margin: 0 }}>Recent News</Title>
          </Divider>

          <Card size="small">
            <List
              size="small"
              dataSource={result.raw_data.news}
              renderItem={(headline) => (
                <List.Item style={{ padding: '4px 0' }}>
                  <Text style={{ fontSize: 13 }}>{headline}</Text>
                </List.Item>
              )}
            />
            {result.news_notes && (
              <div style={{ marginTop: 12, padding: '8px', backgroundColor: '#fafafa', borderRadius: 4 }}>
                <Text type="secondary" strong style={{ fontSize: 12 }}>Summary: </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{result.news_notes}</Text>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

// Header for collapsed cards showing key info
function ResultCardHeader({ result }: { result: ScreeningResultWithInfo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <Space>
        <CalendarOutlined />
        <Text strong>{formatDate(result.created_at)}</Text>
      </Space>
      <Text type="secondary">
        {result.screening_name || 'Unnamed Screening'}
      </Text>
      <Tag
        color={
          result.tier === 'buy'
            ? 'success'
            : result.tier === 'watch'
            ? 'warning'
            : 'default'
        }
      >
        {result.tier.toUpperCase()}
      </Tag>
      <Tag color="blue">
        {result.pattern.replace(/_/g, ' ')}
      </Tag>
      <Text strong>${fmt(result.price)}</Text>
    </div>
  );
}

export function AnalysisPage() {
  const { ticker: urlTicker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [inputTicker, setInputTicker] = useState(urlTicker || '');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['analysis', urlTicker],
    queryFn: async (): Promise<ScreeningResultWithInfo[]> => {
      const response = await apiClient.get<ScreeningResultWithInfo[]>(
        `/api/screenings/ticker/${urlTicker}`
      ).catch(() => ({ data: [] }));
      return response.data;
    },
    enabled: !!urlTicker,
  });

  // Expand the first result by default
  useEffect(() => {
    if (results && results.length > 0 && expandedKey === null) {
      setExpandedKey(results[0].id);
    }
  }, [results]);

  const handleSearch = () => {
    if (inputTicker.trim()) {
      setExpandedKey(null); // Reset expanded state
      navigate(`/analysis/${inputTicker.trim().toUpperCase()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const latestResult = results?.[0];
  const olderResults = results?.slice(1) || [];

  return (
    <div>
      <Title level={2}>Stock Analysis</Title>

      <Card style={{ marginBottom: 24 }}>
        <Space.Compact style={{ width: '100%', maxWidth: 400 }}>
          <Input
            placeholder="Enter ticker symbol (e.g., AAPL)"
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            size="large"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            size="large"
          >
            Analyze
          </Button>
        </Space.Compact>
      </Card>

      {!urlTicker ? (
        <Empty
          description="Enter a ticker symbol to view analysis"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : !results || results.length === 0 ? (
        <Card>
          <Empty description={`No data found for ${urlTicker}`}>
            <Text type="secondary">
              Run a screening that includes this ticker to see analysis data.
            </Text>
          </Empty>
        </Card>
      ) : (
        <div>
          <Title level={3}>{urlTicker}</Title>

          {/* Most Recent Result - Always Expanded */}
          {latestResult && (
            <Card
              title={
                <Space>
                  <Tag color="green">Latest</Tag>
                  <CalendarOutlined />
                  <Text>{formatDate(latestResult.created_at)}</Text>
                  <Text type="secondary">
                    {latestResult.screening_name || 'Unnamed Screening'}
                  </Text>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <ResultDetails result={latestResult} />
            </Card>
          )}

          {/* Older Results - Collapsible */}
          {olderResults.length > 0 && (
            <>
              <Divider>
                <Space>
                  <HistoryOutlined />
                  <Text>Previous Analyses ({olderResults.length})</Text>
                </Space>
              </Divider>

              <Collapse
                accordion
                activeKey={expandedKey && expandedKey !== latestResult?.id ? expandedKey : undefined}
                onChange={(key) => setExpandedKey(Array.isArray(key) ? key[0] || null : key || null)}
                items={olderResults.map((result) => ({
                  key: result.id,
                  label: <ResultCardHeader result={result} />,
                  children: <ResultDetails result={result} />,
                }))}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

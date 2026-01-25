import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Input, Button, Space, Row, Col, Statistic, Empty, Spin, Descriptions, Tag, Alert, List, Divider } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined, DollarOutlined, AimOutlined, ThunderboltOutlined, AlertOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ScreeningResult, Recommendation } from '../api/types';

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

interface TickerAnalysis {
  ticker: string;
  latestResult: ScreeningResult | null;
}

export function AnalysisPage() {
  const { ticker: urlTicker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [inputTicker, setInputTicker] = useState(urlTicker || '');

  const { data, isLoading } = useQuery({
    queryKey: ['analysis', urlTicker],
    queryFn: async (): Promise<TickerAnalysis> => {
      // Try to find the latest screening result for this ticker
      const response = await apiClient.get<ScreeningResult[]>(
        `/api/screenings/ticker/${urlTicker}`
      ).catch(() => ({ data: [] }));

      return {
        ticker: urlTicker!,
        latestResult: response.data[0] || null,
      };
    },
    enabled: !!urlTicker,
  });

  const handleSearch = () => {
    if (inputTicker.trim()) {
      navigate(`/analysis/${inputTicker.trim().toUpperCase()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
      ) : !data?.latestResult ? (
        <Card>
          <Empty description={`No data found for ${urlTicker}`}>
            <Text type="secondary">
              Run a screening that includes this ticker to see analysis data.
            </Text>
          </Empty>
        </Card>
      ) : (
        <div>
          <Title level={3}>{data.ticker}</Title>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Price"
                  value={toNum(data.latestResult.price) || 0}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Change"
                  value={toNum(data.latestResult.change_pct) || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{
                    color: (toNum(data.latestResult.change_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                  prefix={
                    (toNum(data.latestResult.change_pct) || 0) >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic title="RSI" value={toNum(data.latestResult.rsi) ?? '-'} precision={1} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Market Cap"
                  value={toNum(data.latestResult.market_cap) || 0}
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
              <Card title="Technical Indicators">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="SMA 20">
                    <Text
                      style={{
                        color:
                          (toNum(data.latestResult.sma20_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      {fmt(data.latestResult.sma20_pct)}%
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="SMA 50">
                    <Text
                      style={{
                        color:
                          (toNum(data.latestResult.sma50_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      {fmt(data.latestResult.sma50_pct)}%
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="SMA 200">
                    <Text
                      style={{
                        color:
                          (toNum(data.latestResult.sma200_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      {fmt(data.latestResult.sma200_pct)}%
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="52W High">
                    {fmt(data.latestResult.high_52w_pct)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="52W Low">
                    {fmt(data.latestResult.low_52w_pct)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Beta">
                    {fmt(data.latestResult.beta)}
                  </Descriptions.Item>
                  <Descriptions.Item label="ATR">
                    {fmt(data.latestResult.atr)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Ownership & Short Interest">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Inst. Own">
                    {fmt(data.latestResult.inst_own_pct, 1)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Inst. Trans">
                    <Text
                      style={{
                        color:
                          (toNum(data.latestResult.inst_trans_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      {fmt(data.latestResult.inst_trans_pct, 1)}%
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Insider Own">
                    {fmt(data.latestResult.insider_own_pct, 1)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Insider Trans">
                    <Text
                      style={{
                        color:
                          (toNum(data.latestResult.insider_trans_pct) || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      {fmt(data.latestResult.insider_trans_pct, 1)}%
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Short Float">
                    {fmt(data.latestResult.short_float_pct, 1)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Short Ratio">
                    {fmt(data.latestResult.short_ratio)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Fundamentals">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="P/E Ratio">
                    {fmt(data.latestResult.pe_ratio)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Profit Margin">
                    {fmt(data.latestResult.profit_margin_pct, 1)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Debt/Equity">
                    {fmt(data.latestResult.debt_equity)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dividend Yield">
                    {fmt(data.latestResult.dividend_yield)}%
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Classification">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tier">
                    <Tag
                      color={
                        data.latestResult.tier === 'buy'
                          ? 'success'
                          : data.latestResult.tier === 'watch'
                          ? 'warning'
                          : 'default'
                      }
                      style={{ fontSize: 14, padding: '2px 12px' }}
                    >
                      {data.latestResult.tier.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Pattern">
                    <Tag color="blue">
                      {data.latestResult.pattern.replace(/_/g, ' ').toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="News Status">
                    <Tag
                      color={
                        data.latestResult.news_status === 'clean'
                          ? 'success'
                          : data.latestResult.news_status === 'red_flag'
                          ? 'error'
                          : 'default'
                      }
                      icon={
                        data.latestResult.news_status === 'clean' ? (
                          <CheckCircleOutlined />
                        ) : data.latestResult.news_status === 'red_flag' ? (
                          <ExclamationCircleOutlined />
                        ) : (
                          <WarningOutlined />
                        )
                      }
                    >
                      {data.latestResult.news_status.replace(/_/g, ' ').toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  {data.latestResult.earnings_date && (
                    <Descriptions.Item label="Earnings Date">
                      {new Date(data.latestResult.earnings_date).toLocaleDateString()}
                    </Descriptions.Item>
                  )}
                  {data.latestResult.raw_data?.recommendation?.sector && (
                    <Descriptions.Item label="Sector">
                      {data.latestResult.raw_data.recommendation.sector}
                    </Descriptions.Item>
                  )}
                  {data.latestResult.raw_data?.recommendation?.industry && (
                    <Descriptions.Item label="Industry">
                      {data.latestResult.raw_data.recommendation.industry}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Recommendation Section */}
          {data.latestResult.raw_data?.recommendation && (
            <>
              <Divider orientation="left" style={{ marginTop: 32 }}>
                <Title level={4} style={{ margin: 0 }}>Trade Recommendation</Title>
              </Divider>

              {/* Watch Reason Alert */}
              {data.latestResult.tier === 'watch' && data.latestResult.raw_data.recommendation.watchReason && (
                <Alert
                  message="Watch Reason"
                  description={data.latestResult.raw_data.recommendation.watchReason}
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
                    style={{ height: '100%' }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Entry Range"
                          value={`$${data.latestResult.raw_data.recommendation.entry.min.toFixed(2)} - $${data.latestResult.raw_data.recommendation.entry.max.toFixed(2)}`}
                          valueStyle={{ fontSize: 16, color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Stop Loss"
                          value={data.latestResult.raw_data.recommendation.stopLoss}
                          prefix="$"
                          precision={2}
                          valueStyle={{ fontSize: 16, color: '#ff4d4f' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Target 1"
                          value={data.latestResult.raw_data.recommendation.target1}
                          prefix="$"
                          precision={2}
                          valueStyle={{ fontSize: 16, color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        {data.latestResult.raw_data.recommendation.target2 ? (
                          <Statistic
                            title="Target 2"
                            value={data.latestResult.raw_data.recommendation.target2}
                            prefix="$"
                            precision={2}
                            valueStyle={{ fontSize: 16, color: '#52c41a' }}
                          />
                        ) : (
                          <Statistic
                            title="Risk/Reward"
                            value={data.latestResult.raw_data.recommendation.riskReward}
                            valueStyle={{ fontSize: 16, color: '#722ed1' }}
                          />
                        )}
                      </Col>
                    </Row>
                    {data.latestResult.raw_data.recommendation.target2 && (
                      <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Tag color="purple" style={{ fontSize: 14, padding: '4px 16px' }}>
                          Risk/Reward: {data.latestResult.raw_data.recommendation.riskReward}
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
                    style={{ height: '100%' }}
                  >
                    <Paragraph style={{ marginBottom: 0, fontSize: 14 }}>
                      {data.latestResult.raw_data.recommendation.thesis}
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
                  >
                    <List
                      size="small"
                      dataSource={data.latestResult.raw_data.recommendation.catalysts}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '8px 0' }}>
                          <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <Text>{item}</Text>
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
                  >
                    <List
                      size="small"
                      dataSource={data.latestResult.raw_data.recommendation.risks}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '8px 0' }}>
                          <Space>
                            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                            <Text>{item}</Text>
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
          {data.latestResult.raw_data?.news && data.latestResult.raw_data.news.length > 0 && (
            <>
              <Divider orientation="left" style={{ marginTop: 32 }}>
                <Title level={4} style={{ margin: 0 }}>Recent News</Title>
              </Divider>

              <Card>
                <List
                  size="small"
                  dataSource={data.latestResult.raw_data.news}
                  renderItem={(headline) => (
                    <List.Item>
                      <Text>{headline}</Text>
                    </List.Item>
                  )}
                />
                {data.latestResult.news_notes && (
                  <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#fafafa', borderRadius: 4 }}>
                    <Text type="secondary" strong>Summary: </Text>
                    <Text type="secondary">{data.latestResult.news_notes}</Text>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

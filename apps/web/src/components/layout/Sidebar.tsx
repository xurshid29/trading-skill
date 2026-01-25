import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  SearchOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/screenings',
      icon: <SearchOutlined />,
      label: 'Screenings',
    },
    {
      key: '/analysis',
      icon: <LineChartOutlined />,
      label: 'Analysis',
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/screenings')) return '/screenings';
    if (path.startsWith('/analysis')) return '/analysis';
    return path;
  };

  return (
    <>
      <div
        style={{
          height: 32,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {collapsed ? 'T' : 'Trading'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </>
  );
}

import { Button, Menu } from 'antd';
import { CSSProperties, FC, useEffect, useState } from 'react';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { CIcon, PIcon } from './Icons';
import { Link, useLocation } from 'react-router-dom';
import {
  CreditCardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';

import styles from '../../styles/menu.module.scss';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../app/redux/app/appSlice';

interface HeaderMenuProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const HeaderMenu: FC<HeaderMenuProps> = ({ collapsed, toggleCollapsed }) => {
  const [currentKey, setCurrentKey] = useState<string>('categories');
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const arrPath = location.pathname.split('/');
    const current = arrPath?.[1] || 'periods';
    setCurrentKey(current);
  });

  useEffect(() => {
    if (collapsed) {
      document.removeEventListener('click', toggleCollapsed, false);
    } else {
      document.addEventListener('click', toggleCollapsed, false);
    }
  }, [collapsed]);

  const items: ItemType[] = [
    {
      label: <Link to="/periods">Periods</Link>,
      key: 'periods',
      icon: <PIcon />,
    },
    {
      label: <Link to="/categories">Categories</Link>,
      key: 'categories',
      icon: <CIcon />,
    },
    {
      label: <Link to="/paymentMethods">Payment Methods</Link>,
      key: 'paymentMethods',
      icon: <CreditCardOutlined style={{ fontSize: 24 }} />,
    },
    {
      label: (
        <span
          onClick={() => {
            dispatch(logout());
          }}
        >
          Logout
        </span>
      ),
      key: 'logout',
      icon: <PoweroffOutlined style={{ fontSize: 24 }} />,
    },
  ];

  const menuButtonStyles: CSSProperties = collapsed
    ? { right: 5 }
    : { right: 150 };

  return (
    <>
      <div className={styles.headerMenu}>
        <Button
          className="menuButton"
          onClick={toggleCollapsed}
          style={menuButtonStyles}
          type="primary"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        {!collapsed && (
          <span>
            <label>
              <Link to="/">Expenses Control</Link>
            </label>
          </span>
        )}
      </div>
      <Menu
        selectedKeys={[currentKey]}
        items={items}
        mode="inline"
        onClick={() => {
          toggleCollapsed();
        }}
      />
    </>
  );
};

export default HeaderMenu;

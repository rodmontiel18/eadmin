import { Layout as AntLayout, Spin } from 'antd';
import Cookies from 'js-cookie';
import React, { MouseEvent, useEffect, useState } from 'react';
import { auth } from '../../firebase/firebaseConfig';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  logout,
  selectLoading,
  selectUser,
  setUser,
} from '../../app/redux/app/appSlice';
import { AuxProps } from '../../common/commonTypes';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import styles from '../../styles/layout.module.scss';

const Layout: React.FC<AuxProps> = () => {
  const [collapsed, setCollapsed] = useState(true);
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const cookieToken = Cookies.get('token');

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const unsuscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken();
        if (token) {
          const { email, uid, displayName } = user;
          dispatch(
            setUser({
              displayName,
              email,
              uid,
            })
          );
          if (!cookieToken) {
            Cookies.set('token', token, {
              path: '/',
              expires: 7,
            });
          }
        } else {
          dispatch(setUser({ email: null, displayName: null, uid: null }));
          Cookies.remove('token', { path: '/' });
          navigate('/signin');
        }
      } else {
        dispatch(setUser({ email: null, displayName: null, uid: null }));
        Cookies.remove('token', { path: '/' });
        navigate('/signin');
      }
    });

    return () => unsuscribe();
  }, []);

  useEffect(() => {
    if (!cookieToken && location.pathname.indexOf('signin') < 0) {
      dispatch(logout());
      navigate('/signin');
    }
  }, [cookieToken]);

  return (
    <div className="main-container">
      <Spin
        wrapperClassName={loading ? styles.layoutWrapper : undefined}
        spinning={loading}
      >
        {location.pathname.indexOf('signin') > -1 ? (
          <Outlet />
        ) : (
          <>
            {user && user.uid && (
              <AntLayout className="content-layout" hasSider>
                {user && user.uid && (
                  <>
                    <AntLayout>
                      <AntLayout.Content>
                        <div className="root-content-container">
                          <Outlet />
                        </div>
                      </AntLayout.Content>
                    </AntLayout>
                    <div
                      onClick={(e: MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <AntLayout.Sider
                        theme="light"
                        collapsible
                        collapsed={collapsed}
                        collapsedWidth={0}
                        trigger={null}
                      >
                        <HeaderMenu
                          collapsed={collapsed}
                          toggleCollapsed={toggleCollapsed}
                        />
                      </AntLayout.Sider>
                    </div>
                  </>
                )}
              </AntLayout>
            )}
          </>
        )}
      </Spin>
    </div>
  );
};

export default Layout;

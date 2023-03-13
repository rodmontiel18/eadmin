import { Layout as AntLayout, Spin } from 'antd';
import Cookies from 'js-cookie';
import React, { MouseEvent, useEffect } from 'react';
import { auth } from '../../firebase/firebaseConfig';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  logout,
  selectLoading,
  selectMenuCollapsed,
  selectUser,
  setMenuCollapsed,
  setUser,
} from '../../app/redux/app/appSlice';
import { AuxProps } from '../../common/commonTypes';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import styles from '../../styles/layout.module.scss';
import { getDeviceType } from '../../util/util';

const Layout: React.FC<AuxProps> = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const cookieToken = Cookies.get('token');
  const collapsed = useAppSelector(selectMenuCollapsed);

  const toggleCollapsed = () => {
    dispatch(setMenuCollapsed(!collapsed));
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
        }
      } else {
        dispatch(setUser({ email: null, displayName: null, uid: null }));
        Cookies.remove('token', { path: '/' });
      }
    });

    return () => unsuscribe();
  }, []);

  useEffect(() => {
    if (
      !cookieToken &&
      (!user || !user.uid) &&
      location.pathname.indexOf('signin') < 0
    ) {
      dispatch(logout());
      navigate('/signin');
      window.location.reload();
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
              <AntLayout className={styles.contentLayout} hasSider>
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
                        collapsedWidth={getDeviceType() === 'desktop' ? 55 : 0}
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

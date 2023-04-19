import { Layout as AntLayout, Spin } from 'antd';
import Cookies from 'js-cookie';
import React, { MouseEvent, useEffect, useState } from 'react';
import { auth } from '../../firebase/firebaseConfig';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  logout,
  selectLoading,
  selectMenuCollapsed,
  selectUser,
  setMenuCollapsed,
  setUser,
} from '../../app/redux/app';
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
  const [collapsedWidth, setCollapsedWidth] = useState(0);

  const toggleCollapsed = () => {
    dispatch(setMenuCollapsed(!collapsed));
  };

  const recalculateWidth = () => {
    const windowWidth = window.innerWidth;
    const deviceType = windowWidth < 481 ? 'mobile' : getDeviceType();
    if (deviceType !== 'mobile') {
      setCollapsedWidth(55);
    } else {
      setCollapsedWidth(0);
    }
  };

  useEffect(() => {
    const windowWidth = window.innerWidth;
    const deviceType = windowWidth < 481 ? 'mobile' : getDeviceType();
    setCollapsedWidth(deviceType !== 'mobile' ? 55 : 0);
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

    window.addEventListener('resize', recalculateWidth);

    return () => {
      window.removeEventListener('resize', recalculateWidth);
      return unsuscribe();
    };
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
                        <div className={styles.rootContentContainer}>
                          <div className={styles.wrapperContainer}>
                            <Outlet />
                          </div>
                        </div>
                      </AntLayout.Content>
                    </AntLayout>
                    <AntLayout.Sider
                      theme="light"
                      collapsible
                      collapsed={collapsed}
                      collapsedWidth={collapsedWidth}
                      trigger={null}
                      onClick={(e: MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <HeaderMenu
                        collapsed={collapsed}
                        toggleCollapsed={toggleCollapsed}
                      />
                    </AntLayout.Sider>
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

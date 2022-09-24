import { MoreOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Dropdown, List, Menu, Modal, notification } from 'antd';
import moment from 'moment';
import { FC, MouseEvent, useEffect, useState } from 'react';
import { Period } from '../../models/period/Period';
import PeriodForm from './PeriodForm';

import styles from '../../styles/periods.module.scss';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  deleteUserPeriodAction,
  finishRequest,
  getUserPeriodsAction,
  selectPeriod,
  selectPeriods,
  selectRequestStatus,
  setError,
  setPeriod,
} from '../../app/redux/period/periodSlice';
import { RequestStatus } from '../../models/api';
interface PeriodListProps {
  setLoading: (flag: boolean) => void;
  userId: string;
}

const PeriodList: FC<PeriodListProps> = ({ setLoading, userId }) => {
  const [showAlertPeriodModal, setShowAlertPeriodModal] = useState(false);
  const [showPeriodForm, setShowPeriodForm] = useState(false);

  const period = useAppSelector(selectPeriod);
  const periods = useAppSelector(selectPeriods);
  const requestStatus = useAppSelector(selectRequestStatus);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!periods || periods.length < 1) {
      dispatch(
        getUserPeriodsAction({
          userId,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (
      requestStatus === RequestStatus.FAILED ||
      requestStatus === RequestStatus.SUCCEEDED
    ) {
      dispatch(finishRequest());
    }
    if (requestStatus === RequestStatus.PENDING) {
      setLoading(true);
    }

    if (requestStatus === RequestStatus.IDLE) {
      setLoading(false);
    }
  }, [requestStatus]);

  const getActionButtons = (): JSX.Element => (
    <div className={styles.actionsContainer}>
      <div className={styles.addIcon}>
        <PlusOutlined
          onClick={() => {
            setShowPeriodForm(true);
          }}
        />
      </div>
    </div>
  );

  const getPeriodForm = (): JSX.Element => {
    return (
      <Modal
        centered
        closable
        destroyOnClose
        footer={null}
        onCancel={() => {
          setShowPeriodForm(false);
          // dispatch(setPeriod(undefined));
        }}
        title={`${period ? 'Edit' : 'Add new'} period`}
        visible={showPeriodForm}
      >
        <PeriodForm
          period={period}
          setLoading={setLoading}
          setShowPeriodForm={setShowPeriodForm}
        />
      </Modal>
    );
  };

  const getPeriodList = (): JSX.Element => {
    return (
      <div className={styles.mainListCard}>
        <Card title={<h1>Periods</h1>}>
          {periods && periods?.length > 0 ? (
            <div className={styles.periodListContainer}>
              <Modal
                cancelText="No"
                centered
                onCancel={() => {
                  setPeriod(undefined);
                  setShowAlertPeriodModal(false);
                }}
                onOk={handleDeletePeriod}
                okText="Yes"
                title={
                  <>
                    Waring <WarningOutlined style={{ color: 'yellow' }} />
                  </>
                }
                visible={showAlertPeriodModal}
              >
                Are you sure to delete this period?
              </Modal>
              <List
                grid={{
                  gutter: 16,
                  xs: 2,
                  sm: 4,
                  md: 4,
                  lg: 4,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={periods}
                renderItem={item => (
                  <List.Item
                    onClick={() => {
                      setLoading(true);
                    }}
                  >
                    <Link to={`/periods/${item.id}`}>
                      <Card
                        className={styles.periodCard}
                        title={
                          <div className={styles.head}>
                            <div>{item.name}</div>
                            <Dropdown
                              overlay={
                                <Menu
                                  items={[
                                    {
                                      label: 'Edit',
                                      key: '0',
                                      onClick: info => {
                                        info.domEvent.stopPropagation();
                                        handleEditPeriod(item);
                                      },
                                    },
                                    {
                                      label: 'Delete',
                                      key: '1',
                                      onClick: info => {
                                        info.domEvent.stopPropagation();
                                        dispatch(setPeriod(item));
                                        setShowAlertPeriodModal(true);
                                      },
                                    },
                                  ]}
                                />
                              }
                              placement="bottomRight"
                              trigger={['click']}
                            >
                              <MoreOutlined
                                id="actions-icon"
                                className={styles.cardActions}
                                onClick={(e: MouseEvent<HTMLElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              />
                            </Dropdown>
                          </div>
                        }
                      >
                        <span>{'From: '}</span>
                        <br />
                        {moment.unix(item.from).format('L')}
                        <br />
                        <span>{'To: '}</span>
                        <br />
                        {moment.unix(item.to).format('L')}
                      </Card>
                    </Link>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              No data, try to add a period
            </div>
          )}
        </Card>
      </div>
    );
  };

  const handleDeletePeriod = () => {
    setLoading(true);
    if (period?.id) {
      dispatch(deleteUserPeriodAction(period?.id))
        .unwrap()
        .then(resp => {
          if (resp.status === 200) {
            notification.open({
              message: 'Period deleted succesfully',
              type: 'success',
            });
          } else {
            dispatch(setError(true));
          }
        })
        .finally(() => {
          setShowAlertPeriodModal(false);
        });
    }
  };

  const handleEditPeriod = (per: Period) => {
    dispatch(setPeriod(per));
    setShowPeriodForm(true);
  };

  return (
    <div className={styles.innerPeriodListC}>
      {getPeriodForm()}
      {getPeriodList()}
      {getActionButtons()}
    </div>
  );
};

export default PeriodList;

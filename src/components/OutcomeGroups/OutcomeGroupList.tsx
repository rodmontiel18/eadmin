import { MoreOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Dropdown,
  List,
  Menu,
  Modal,
  notification,
  Popconfirm,
  Select,
} from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { FC, MouseEvent, useEffect, useState } from 'react';
import { OutcomeGroup } from '../../models/outcomeGroup/OutcomeGroup';
import OutcomeGroupForm from './OutcomeGroupForm';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  deleteUserOutcomeGroupAction,
  finishRequest as ogFinishRequest,
  getUserOutcomeGroupsAction,
  selectOutcomeGroup,
  selectOutcomeGroups,
  selectRequestStatus as selectOutcomeGroupRequestStatus,
  setError,
  setOutcomeGroup,
} from '../../app/redux/outcomeGroup/outcomeGroupSlice';

import styles from '../../styles/outcomeGroup.module.scss';
import {
  addOutcomesGroupToPeriod,
  finishRequest as pFinishRequest,
  getUserPeriodsAction,
  selectPeriods,
  selectRequestStatus as selectPeriodRequestStatus,
} from '../../app/redux/period/periodSlice';
import { RequestStatus } from '../../models/api';

interface OutcomeGroupListProps {
  setLoading: (flag: boolean) => void;
  userId: string;
}

const OutcomeGroupList: FC<OutcomeGroupListProps> = ({
  setLoading,
  userId,
}) => {
  const [formError, setFormError] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [showOutcomeGroupForm, setShowOutcomeGroupForm] = useState(false);
  const [showAlertGroupModal, setShowAlertGroupModal] = useState(false);
  const [showAddToPeriodModal, setShowAddToPeriodModal] = useState(false);

  const dispatch = useAppDispatch();
  const group = useAppSelector(selectOutcomeGroup);
  const groups = useAppSelector(selectOutcomeGroups);
  const ogRequestStatus = useAppSelector(selectOutcomeGroupRequestStatus);
  const pRequestStatus = useAppSelector(selectPeriodRequestStatus);
  const periods = useAppSelector(selectPeriods);

  useEffect(() => {
    if (periods === undefined && groups === undefined) {
      Promise.allSettled([
        dispatch(
          getUserOutcomeGroupsAction({
            userId,
          })
        ),
        dispatch(
          getUserPeriodsAction({
            userId,
          })
        ),
      ]);
    } else {
      if (periods === undefined) {
        dispatch(
          getUserPeriodsAction({
            userId,
          })
        );
      }
      if (groups === undefined) {
        dispatch(
          getUserOutcomeGroupsAction({
            userId,
          })
        );
      }
    }
    return () => {
      dispatch(setOutcomeGroup(undefined));
      setShowOutcomeGroupForm(false);
    };
  }, []);

  useEffect(() => {
    if (
      ogRequestStatus === RequestStatus.FAILED ||
      ogRequestStatus === RequestStatus.SUCCEEDED
    ) {
      dispatch(ogFinishRequest());
    }

    if (
      pRequestStatus === RequestStatus.FAILED ||
      pRequestStatus === RequestStatus.SUCCEEDED
    ) {
      dispatch(pFinishRequest());
    }

    if (
      ogRequestStatus === RequestStatus.PENDING ||
      pRequestStatus === RequestStatus.PENDING
    ) {
      setLoading(true);
    }

    if (
      ogRequestStatus === RequestStatus.IDLE &&
      pRequestStatus === RequestStatus.IDLE
    ) {
      setLoading(false);
    }
  }, [ogRequestStatus, pRequestStatus]);

  const getOutcomeGroupList = (): JSX.Element => {
    return (
      <div className={styles.mainListCard}>
        <Card title={<h1>Outcome groups</h1>}>
          {groups && groups?.length > 0 ? (
            <div className={styles.groupListContainer}>
              <div>
                <List
                  grid={{
                    gutter: 16,
                    xs: 2,
                    sm: 2,
                    md: 4,
                    lg: 4,
                    xl: 6,
                    xxl: 10,
                  }}
                  dataSource={groups}
                  renderItem={item => (
                    <List.Item
                      onClick={() => {
                        setLoading(true);
                      }}
                    >
                      <Link to={`/outcome-group/${item.id}`}>
                        <Card
                          className={styles.outcomeGroupCard}
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
                                          handleEditGroup(item);
                                        },
                                      },
                                      {
                                        label: 'Delete',
                                        key: '1',
                                        onClick: info => {
                                          info.domEvent.stopPropagation();
                                          dispatch(setOutcomeGroup(item));
                                          setShowAlertGroupModal(true);
                                        },
                                      },
                                      {
                                        disabled:
                                          !periods || periods?.length < 1,
                                        key: '2',
                                        label: 'Add to period',
                                        onClick: info => {
                                          info.domEvent.stopPropagation();
                                          dispatch(setOutcomeGroup(item));
                                          setShowAddToPeriodModal(true);
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
                          {item.description}
                        </Card>
                      </Link>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              No data, try to add a group
            </div>
          )}
        </Card>
      </div>
    );
  };

  const handleAddToPeriod = () => {
    if (!selectedPeriodId) setFormError(true);
    else if (group?.id) {
      dispatch(
        addOutcomesGroupToPeriod({
          parentItemId: selectedPeriodId,
          entityId: group?.id,
        })
      )
        .unwrap()
        .then(resp => {
          if (resp.status === 200) {
            notification.open({
              message: 'Group added successfully',
              type: 'info',
            });
          } else dispatch(setError(true));
        })
        .finally(() => {
          setShowAddToPeriodModal(false);
          setSelectedPeriodId('');
        });
    }
  };

  const handleEditGroup = (grp: OutcomeGroup) => {
    dispatch(setOutcomeGroup(grp));
    setShowOutcomeGroupForm(true);
  };

  const handleDeleteGroup = () => {
    dispatch(deleteUserOutcomeGroupAction(group?.id || ''))
      .unwrap()
      .then(resp => {
        if (resp.status === 200) {
          notification.open({
            message: 'Outcome group deleted succesfully',
            type: 'success',
          });
        } else dispatch(setError(true));
      })
      .finally(() => {
        setShowAlertGroupModal(false);
        dispatch(setOutcomeGroup(undefined));
      });
  };

  const handleOnChangePeriod = (value: string) => {
    setSelectedPeriodId(value);
    if (!value) setFormError(true);
    else setFormError(false);
  };

  const addToPeriodFooter = (
    <div>
      <Button
        htmlType="button"
        onClick={() => {
          dispatch(setOutcomeGroup(undefined));
          setSelectedPeriodId('');
          setShowAddToPeriodModal(false);
        }}
        type="default"
      >
        Cancel
      </Button>
      <Popconfirm onConfirm={handleAddToPeriod} title="Sure to add this group">
        <Button htmlType="button" type="primary">
          Ok
        </Button>
      </Popconfirm>
    </div>
  );

  return (
    <div
      id="outcomeGLInnerContainer"
      className={styles.outcomesGLInnerContainer}
    >
      <Modal
        cancelText="No"
        centered
        onCancel={() => {
          dispatch(setOutcomeGroup(undefined));
          setShowAlertGroupModal(false);
        }}
        onOk={handleDeleteGroup}
        title={
          <>
            Waring <WarningOutlined style={{ color: 'yellow' }} />
          </>
        }
        okText="Yes"
        visible={showAlertGroupModal}
      >
        Are you sure to delete this group?
      </Modal>
      <Modal
        cancelText="Cancel"
        centered
        footer={addToPeriodFooter}
        getContainer={() =>
          document.getElementById('outcomeGLInnerContainer') as HTMLElement
        }
        onCancel={() => {
          dispatch(setOutcomeGroup(undefined));
          setSelectedPeriodId('');
          setShowAddToPeriodModal(false);
        }}
        title="Select a period"
        width={320}
        visible={showAddToPeriodModal}
      >
        <div
          className={cx(styles.formContainer, { [styles.error]: formError })}
        >
          <div className={styles.periodContainer}>
            <label htmlFor="period">Period:</label>
            <Select
              onChange={(value: string) => {
                handleOnChangePeriod(value);
              }}
              options={
                periods && periods?.length > 0
                  ? periods.map<DefaultOptionType>(p => ({
                      key: p.id,
                      label: p.name,
                      value: p.id,
                    }))
                  : []
              }
              value={selectedPeriodId}
            />
          </div>
          <div className={styles.msgContainer}>
            <div />
            <span>Period is mandatory</span>
          </div>
        </div>
      </Modal>
      <Modal
        centered
        closable
        destroyOnClose
        footer={null}
        onCancel={() => {
          setShowOutcomeGroupForm(false);
        }}
        title={`${group ? 'Edit' : 'Add new'} outcome group`}
        visible={showOutcomeGroupForm}
      >
        <OutcomeGroupForm
          group={group}
          setLoading={setLoading}
          setShowOutcomeGroupForm={setShowOutcomeGroupForm}
          userId={userId}
        />
      </Modal>
      {getOutcomeGroupList()}
      <div className={styles.actionsContainer}>
        <div className={styles.addIcon}>
          <PlusOutlined
            onClick={() => {
              setShowOutcomeGroupForm(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OutcomeGroupList;

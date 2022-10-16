import { DeleteTwoTone, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Card, Modal, Popconfirm } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { Moment } from 'moment';
import { FC, Key, MouseEvent, useEffect, useState } from 'react';
import { Category } from '../../models/category';
import { Outcome, OutcomeState } from '../../models/outcome';
import { ColumnFilterItem } from 'antd/lib/table/interface';

import styles from '../../styles/outcomes.module.scss';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addUserOutcomeAction as addUserOgOutcomeAction,
  deleteUserOutcomeAction as deleteOGUserOutcomeAction,
  finishRequest as finishOGRequest,
  getUserOutcomesAction as getOGUserOutcomesAction,
  selectOutcome as selectOGOutcome,
  selectOutcomesByGroupId,
  setOutcome as setOGOutcome,
  selectRequestStatus as selectOGRequestStatus,
  setUserOutcomeAction as setUserOGOutcomeAction,
} from '../../app/redux/outcomeGroup/outcomeGroupSlice';
import {
  addUserOutcomeAction as addUserPOutcomeAction,
  deleteUserOutcomeAction as deletePUserOutcomeAction,
  finishRequest as finishPRequest,
  getUserOutcomesAction as getPUserOutcomesAction,
  selectOutcome as selectPOutcome,
  selectOutcomesByPeriodId,
  setOutcome as setPOutcome,
  selectRequestStatus as selectPRequestStatus,
  setUserOutcomeAction as setUserPOutcomeAction,
} from '../../app/redux/period/periodSlice';
import { InputParams } from '../../app/redux/generic';
import {
  getUserPaymentMethodsAction,
  selectPaymentMethods,
} from '../../app/redux/paymentMethod/paymentMethodSlice';
import { selectUser } from '../../app/redux/app/appSlice';
import { RequestStatus } from '../../models/api';
import OutcomeForm from './OutcomeForm';

interface OutcomeTableType extends Outcome {
  key: Key;
}

interface OutcomeListProps {
  categories: Category[];
  groupId?: string;
  periodId?: string;
  setLoading: (flag: boolean) => void;
}

const OutcomeList: FC<OutcomeListProps> = ({
  categories,
  groupId,
  periodId,
  setLoading,
}) => {
  const [showOutcomeFormModal, setShowOutcomeFormModal] = useState(false);

  const dispatch = useAppDispatch();
  const ogRequestStatus = useAppSelector(selectOGRequestStatus);
  const outcome = useAppSelector(groupId ? selectOGOutcome : selectPOutcome);
  const outcomes = useAppSelector(
    groupId
      ? selectOutcomesByGroupId(groupId)
      : selectOutcomesByPeriodId(periodId || '')
  );
  const pRequestStatus = useAppSelector(selectPRequestStatus);
  const pMethods = useAppSelector(selectPaymentMethods);
  const userId = useAppSelector(selectUser)?.uid || '';

  useEffect(() => {
    if (
      (!outcomes || outcomes.length < 1) &&
      (!pMethods || pMethods.length < 1)
    ) {
      Promise.allSettled([
        handleGetOutcomesAction(),
        dispatch(
          getUserPaymentMethodsAction({
            userId,
          })
        ),
      ]);
    } else {
      if (!outcomes || outcomes.length < 1) {
        handleGetOutcomesAction();
      }
      if (!pMethods || pMethods.length < 1) {
        dispatch(
          getUserPaymentMethodsAction({
            userId,
          })
        );
      }
    }
    return () => {
      handleSetOutcome();
      setShowOutcomeFormModal(false);
    };
  }, []);

  useEffect(() => {
    if (
      ogRequestStatus === RequestStatus.FAILED ||
      ogRequestStatus === RequestStatus.SUCCEEDED
    ) {
      dispatch(finishOGRequest());
    }
    if (
      pRequestStatus === RequestStatus.FAILED ||
      pRequestStatus === RequestStatus.SUCCEEDED
    ) {
      dispatch(finishPRequest());
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

  const handleDeleteOutcome = (outcomeId: string) => {
    const inputParams: InputParams<Outcome> = {
      parentItemId: groupId ? groupId : periodId || '',
      entityId: outcomeId,
    };
    dispatch(
      groupId
        ? deleteOGUserOutcomeAction(inputParams)
        : deletePUserOutcomeAction(inputParams)
    );
  };

  const handleGetOutcomesAction = () => {
    const inputParams: InputParams<Outcome> = {
      parentItemId: groupId ? groupId : periodId || '',
      userId,
    };
    dispatch(
      groupId
        ? getOGUserOutcomesAction(inputParams)
        : getPUserOutcomesAction(inputParams)
    );
  };

  const handleSetOutcome = (outcome?: Outcome) => {
    dispatch(groupId ? setOGOutcome(outcome) : setPOutcome(outcome));
  };

  const handleSetOutcomeAction = (o?: Outcome) => {
    const inputParams: InputParams<Outcome> = {
      parentItemId: groupId ? groupId : periodId || '',
      entity: o,
      entityId: o?.id,
    };
    if (groupId) {
      if (o?.id) dispatch(setUserOGOutcomeAction(inputParams));
      else dispatch(addUserOgOutcomeAction(inputParams));
    } else {
      if (o?.id) dispatch(setUserPOutcomeAction(inputParams));
      else dispatch(addUserPOutcomeAction(inputParams));
    }
    setShowOutcomeFormModal(false);
  };

  const getCategoriesFilters = (): ColumnFilterItem[] => {
    const filters: ColumnFilterItem[] = [];
    if (outcomes && outcomes?.length > 0) {
      outcomes.forEach(item => {
        if (!filters.some(s => s.value === item.categoryId))
          filters.push({
            text: categories?.find(c => c.id == item.categoryId)?.name,
            value: item.categoryId,
          });
      });
    }
    return filters;
  };

  const getPMFilters = (): ColumnFilterItem[] => {
    const filters: ColumnFilterItem[] = [];
    if (outcomes && outcomes?.length > 0) {
      outcomes.forEach(item => {
        if (!filters.some(s => s.value === item.paymentMethodId))
          filters.push({
            text: pMethods?.find(pm => pm.id == item.paymentMethodId)?.name,
            value: item.paymentMethodId,
          });
      });
    }
    return filters;
  };

  const getResponsibleFilters = (): ColumnFilterItem[] => {
    const filters: ColumnFilterItem[] = [];
    if (outcomes && outcomes?.length > 0) {
      outcomes.forEach(item => {
        if (!filters.some(s => s.value === item.responsible))
          filters.push({
            text: item.responsible,
            value: item.responsible,
          });
      });
    }
    return filters;
  };

  const getStateFilters = (): ColumnFilterItem[] => {
    const filters: ColumnFilterItem[] = [];
    if (outcomes && outcomes?.length > 0) {
      outcomes.forEach(item => {
        if (!filters.some(s => s.value === item.state))
          filters.push({
            text: item.state ? OutcomeState[item.state] : '',
            value: item.state || '',
          });
      });
    }
    return filters;
  };

  let cols: ColumnsType<Outcome> = [
    {
      key: 'action',
      title: 'Action',
      align: 'center',
      render: (_, inc: Outcome) => (
        <span
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
          }}
        >
          <Popconfirm
            onConfirm={() => {
              handleDeleteOutcome(inc?.id || '');
            }}
            placement="right"
            title="Sure to delete?"
          >
            <DeleteTwoTone />
          </Popconfirm>
        </span>
      ),
      width: 60,
    },
    {
      key: 'date',
      title: 'Date',
      dataIndex: 'outcomeDate',
      render: (outcomeDate: Moment) => outcomeDate.format('L'),
      sorter: (a: Outcome, b: Outcome) =>
        (a?.outcomeDate?.unix() || 0) - (b?.outcomeDate?.unix() || 0),
      width: 95,
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      sorter: (a: Outcome, b: Outcome) =>
        a.description.localeCompare(b.description),
      width: 200,
    },
    {
      key: 'category',
      dataIndex: 'categoryId',
      filters: getCategoriesFilters(),
      onFilter: (value, o) => o.categoryId === (value as string),
      title: 'Category',
      render: (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name : '';
      },
      sorter: (a: Outcome, b: Outcome) => {
        if (categories?.length > 0) {
          const catA = categories.find(c => a.categoryId === c.id);
          const catB = categories.find(c => b.categoryId === c.id);
          if (catA && catB)
            return catA?.description.localeCompare(catB?.description);
        }
        return 0;
      },
      width: 110,
    },
    {
      key: 'paymentMethodId',
      title: 'Payment Method',
      dataIndex: 'paymentMethodId',
      filters: getPMFilters(),
      onFilter: (val, outcome) => outcome.paymentMethodId === (val as string),
      render: (paymentMethodId: string) => {
        const pm = pMethods?.find(p => p.id === paymentMethodId) || null;
        return pm ? pm.name : '';
      },
      sorter: (a: Outcome, b: Outcome) => {
        if (pMethods?.length > 0) {
          const pmA = pMethods.find(pm => pm.id === a.paymentMethodId);
          const pmB = pMethods.find(pm => pm.id === b.paymentMethodId);
          if (pmA && pmB) return pmA.name.localeCompare(pmB.name);
        }
        return 0;
      },
      width: 100,
    },
    {
      dataIndex: 'responsible',
      filters: getResponsibleFilters(),
      key: 'responsible',
      onFilter: (val, e) => e.responsible === (val as string),
      sorter: (a: Outcome, b: Outcome) =>
        a.responsible.localeCompare(b.responsible),
      title: 'Responsible',
      width: 110,
    },
    {
      key: 'state',
      dataIndex: 'state',
      filters: getStateFilters(),
      onFilter: (val, e) => e.state === (val as number),
      title: 'State',
      render: (state: OutcomeState) => OutcomeState[state],
      sorter: (a: Outcome, b: Outcome) =>
        OutcomeState[a.state || 1].localeCompare(OutcomeState[b.state || 1]),
      width: 80,
    },
    {
      align: 'right',
      dataIndex: 'amount',
      key: 'amount',
      render: (amunt: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amunt),
      sorter: (a: Outcome, b: Outcome) => a.amount - b.amount,
      title: 'Amount',
      width: 100,
    },
  ];

  if (groupId) {
    cols = cols.filter(c => c.key !== 'date' && c.key !== 'state');
  }

  const getDataSource = (): Outcome[] => {
    if (outcomes) {
      return outcomes.map<OutcomeTableType>(o => ({
        ...o,
        key: o?.id || '',
      }));
    }
    return [];
  };

  const handleEditOutcome = (exp: Outcome) => {
    handleSetOutcome(exp);
    setShowOutcomeFormModal(true);
  };

  return (
    <>
      <div className={styles.outcomesContainer}>
        <div className={styles.outcomeListInnerContainer}>
          {pMethods && (
            <Modal
              centered
              closable
              destroyOnClose
              footer={null}
              onCancel={() => {
                setShowOutcomeFormModal(false);
              }}
              title={`${outcome ? 'Edit' : 'Add new'} outcome`}
              visible={showOutcomeFormModal}
            >
              <OutcomeForm
                categories={categories}
                groupId={groupId}
                outcome={outcome}
                paymentMethods={pMethods}
                periodId={periodId}
                resetOutcome={() => {
                  handleSetOutcome();
                }}
                setLoading={setLoading}
                setOutcomeAction={handleSetOutcomeAction}
                setShowOutcomeFormModal={setShowOutcomeFormModal}
                userId={userId}
              />
            </Modal>
          )}
          <div className={styles.mainTableCard}>
            <Card title={<h2 id="outcomesTitle">Outcomes</h2>}>
              <div className={styles.outcomeTableContainer}>
                <Table
                  bordered
                  className={styles.outcomesTable}
                  columns={cols}
                  dataSource={getDataSource()}
                  footer={currentData => (
                    <>
                      <span>Total: </span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(
                        currentData.reduce(
                          (acc, current) => acc + current.amount,
                          0
                        )
                      )}
                    </>
                  )}
                  id="outcomesTable"
                  key="outcomesTable"
                  onRow={(item: Outcome) => ({
                    onClick: () => {
                      handleEditOutcome(item);
                    },
                  })}
                  pagination={false}
                  scroll={{ x: 400 }}
                  size="middle"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <div className={styles.backIcon}>
          <Link to={`/periods?tab=${groupId ? 2 : 1}`}>
            <LeftOutlined />
          </Link>
        </div>
        <div className={styles.addIcon}>
          <PlusOutlined
            onClick={() => {
              setShowOutcomeFormModal(true);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default OutcomeList;

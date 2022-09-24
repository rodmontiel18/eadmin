import { DeleteTwoTone, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Card, Modal, Popconfirm, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { FC, Key, MouseEvent, useEffect, useState } from 'react';
import { Category } from '../../models/category';
import { Income } from '../../models/income';
import { Link } from 'react-router-dom';

import styles from '../../styles/incomes.module.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  deleteUserIncomeAction,
  finishRequest,
  getUserIncomesAction,
  selectIncome,
  selectIncomesByPeriodId,
  selectRequestStatus,
  setIncome,
} from '../../app/redux/period/periodSlice';
import IncomeForm from './IncomeForm';
import { RequestStatus } from '../../models/api';
import { setLoading } from '../../app/redux/app/appSlice';

interface IncomeTableType extends Income {
  key: Key;
}

interface IncomeListProps {
  categories: Category[];
  periodId: string;
  userId: string;
}

const IncomeList: FC<IncomeListProps> = ({ categories, periodId, userId }) => {
  const [showIncomeFormModal, setShowIncomeFormModal] = useState(false);

  const dispatch = useAppDispatch();
  const income = useAppSelector(selectIncome);
  const incomes = useAppSelector(selectIncomesByPeriodId(periodId));
  const requestStatus = useAppSelector(selectRequestStatus);

  useEffect(() => {
    if (!incomes || incomes?.length < 1) {
      dispatch(
        getUserIncomesAction({
          parentItemId: periodId,
          userId,
        })
      );
    }
    return () => {
      dispatch(setIncome());
      setShowIncomeFormModal(false);
    };
  }, []);

  useEffect(() => {
    if (
      requestStatus === RequestStatus.FAILED ||
      requestStatus === RequestStatus.SUCCEEDED
    ) {
      dispatch(finishRequest());
    }
    if (requestStatus === RequestStatus.PENDING) {
      dispatch(setLoading(true));
    }
    if (requestStatus === RequestStatus.IDLE) {
      dispatch(setLoading(false));
    }
  }, [requestStatus]);

  const handleDelete = (id: string) => {
    if (id) {
      dispatch(
        deleteUserIncomeAction({
          parentItemId: periodId,
          entityId: id,
          userId: userId,
        })
      );
    }
  };

  const cols: ColumnsType<Income> = [
    {
      key: 'action',
      title: 'Action',
      align: 'center',
      render: (_, inc: Income) => (
        <span
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
          }}
        >
          <Popconfirm
            onConfirm={() => {
              handleDelete(inc?.id || '');
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
      dataIndex: 'incomeDate',
      render: (incomeDate: number) => moment.unix(incomeDate).format('L'),
      sorter: (a: Income, b: Income) =>
        (a.incomeDate || 0) - (b.incomeDate || 0),
      width: 100,
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      width: 200,
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'categoryId',
      render: (categoryId: string) => {
        const cat = categories?.find(c => c.id === categoryId) || null;
        return cat ? cat.name : 'N/A';
      },
      width: 110,
    },
    {
      align: 'right',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount),
      title: 'Amount',
      width: 100,
    },
  ];

  const getDataSource = (): Income[] => {
    if (incomes) {
      return incomes.map<IncomeTableType>(income => ({
        ...income,
        key: income?.id || '',
      }));
    }
    return [];
  };

  const handleEditIncome = (inc: Income) => {
    dispatch(setIncome(inc));
    setShowIncomeFormModal(true);
  };

  return (
    <>
      <div className={styles.incomesContainer}>
        <Modal
          centered
          closable
          destroyOnClose
          footer={null}
          onCancel={() => {
            setShowIncomeFormModal(false);
          }}
          title={`${income ? 'Edit' : 'Add'} new Income`}
          visible={showIncomeFormModal}
        >
          <IncomeForm
            categories={categories}
            income={income}
            periodId={periodId}
            setShowIncomeFormModal={setShowIncomeFormModal}
            userId={userId}
          />
        </Modal>
        <div className={styles.mainTableCard}>
          <Card title={<h2>Incomes</h2>}>
            <Table
              bordered
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
              onRow={(record: Income) => {
                return {
                  onClick: () => {
                    handleEditIncome(record);
                  },
                };
              }}
              pagination={false}
              scroll={{ x: 400 }}
              size="middle"
            />
          </Card>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <div className={styles.backIcon}>
          <Link to="/periods">
            <LeftOutlined />
          </Link>
        </div>
        <div className={styles.addIcon}>
          <PlusOutlined
            onClick={() => {
              setShowIncomeFormModal(true);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default IncomeList;

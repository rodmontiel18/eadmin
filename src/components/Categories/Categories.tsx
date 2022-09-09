import { Button, Card, Modal, notification, Popconfirm, Table } from 'antd';
import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { FC, Key, MouseEvent, useEffect, useState } from 'react';
import { batch } from 'react-redux';
import { Category, CategoryType } from '../../models/category';
import CategoryForm from './CategoryForm';
import { ColumnFilterItem } from 'antd/lib/table/interface';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectUser, setLoading } from '../../app/redux/app/appSlice';
import {
  deleteUserCategoryAction,
  finishRequest,
  getUserCategoriesAction,
  selectCategories,
  selectError,
  selectFormCategory,
  selectRequestStatus,
  setError,
  setFormCategoryAction,
} from '../../app/redux/category/categorySlice';

import styles from '../../styles/categories.module.scss';
import { RequestStatus } from '../../models/api';

type CategoryTableType = {
  key: Key;
} & Category;

const Categories: FC = () => {
  const [showCategoryFormModal, setShowCategoryFormModal] = useState(false);

  const categories = useAppSelector(selectCategories);
  const category = useAppSelector(selectFormCategory);
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const requestStatus = useAppSelector(selectRequestStatus);
  const user = useAppSelector(selectUser);
  const userId = user?.uid || '';

  useEffect(() => {
    if (categories.length < 1) {
      dispatch(
        getUserCategoriesAction({
          userId,
        })
      );
    }
  }, [categories]);

  useEffect(() => {
    if (
      requestStatus === RequestStatus.FAILED ||
      requestStatus === RequestStatus.SUCCEEDED
    ) {
      dispatch(finishRequest());
    }
    if (requestStatus === RequestStatus.IDLE) {
      dispatch(setLoading(false));
    }
    if (requestStatus === RequestStatus.PENDING) {
      dispatch(setLoading(true));
    }
  }, [requestStatus]);

  useEffect(() => {
    if (error) {
      showNotificationError();
    }
  }, [error]);

  const getDataSource = (): CategoryTableType[] => {
    if (categories)
      return categories.map<CategoryTableType>((cat: Category) => ({
        ...cat,
        key: cat.id,
      }));
    return [];
  };

  const getFilters = (): ColumnFilterItem[] => {
    const filters: ColumnFilterItem[] = [];
    if (categories) {
      categories.forEach(item => {
        if (!filters.some(s => s.value === item.type))
          filters.push({
            text: CategoryType[item.type || 1],
            value: item.type || 1,
          });
      });
    }
    return filters;
  };

  const handleDelete = (id: string) => {
    batch(() => {
      dispatch(deleteUserCategoryAction(id))
        .unwrap()
        .then(resp => {
          if (resp.status === 200) {
            notification.open({
              message: 'Category deleted successfully',
              type: 'info',
            });
          } else {
            dispatch(setError(true));
          }
        });
    });
  };

  const handleEditCategory = (currentCategory: Category) => {
    dispatch(setFormCategoryAction(currentCategory));
    setShowCategoryFormModal(true);
  };

  const resetCategory = () => {
    dispatch(setFormCategoryAction(undefined));
  };

  const showNotificationError = () =>
    notification.open({
      message: 'An error has ocurred',
      type: 'error',
    });

  const cols: ColumnsType<Category> = [
    {
      key: 'action',
      title: 'Action',
      align: 'center',
      render: (_, cat: Category) => (
        <div
          className={styles.actionCell}
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
          }}
        >
          <Popconfirm
            onConfirm={() => {
              handleDelete(cat.id);
            }}
            placement="right"
            title="Sure to delete?"
          >
            <DeleteTwoTone />
          </Popconfirm>
          <Button
            disabled
            htmlType="button"
            style={{ backgroundColor: cat.color }}
          />
        </div>
      ),
      width: 80,
    },
    {
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
      title: 'Name',
      width: 90,
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      width: 200,
    },
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
      filters: categories && categories?.length > 0 ? getFilters() : [],
      onFilter: (val, c) => c.type === (val as number),
      render: (type: CategoryType) => CategoryType[type],
      sorter: (a: Category, b: Category) => (a.type || 1) - (b.type || 1),
      width: 100,
    },
  ];

  return (
    <>
      <div className={styles.categoriesC}>
        <div className={styles.categoriesInnerC}>
          <Modal
            centered
            closable
            destroyOnClose
            footer={null}
            onCancel={() => {
              setShowCategoryFormModal(false);
              resetCategory();
            }}
            title={`${category ? 'Edit' : 'Add new'} Category`}
            visible={showCategoryFormModal}
          >
            <CategoryForm
              category={category}
              setError={flag => {
                dispatch(setError(flag));
              }}
              setShowCategoryFormModal={setShowCategoryFormModal}
              userId={userId}
            />
          </Modal>
          <Card title={<h1>Categories</h1>}>
            <Table
              bordered
              columns={cols}
              dataSource={getDataSource()}
              onRow={(record: Category) => {
                return {
                  onClick: () => {
                    handleEditCategory(record);
                  },
                };
              }}
              pagination={false}
              size="middle"
            />
          </Card>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <div className={styles.addIcon}>
          <PlusOutlined
            onClick={() => {
              setShowCategoryFormModal(true);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Categories;

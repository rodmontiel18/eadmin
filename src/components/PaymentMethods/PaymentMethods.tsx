import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons';
import {
  Card,
  Input,
  List,
  Modal,
  notification,
  Popconfirm,
  Typography,
} from 'antd';
import { ChangeEvent, FC, MouseEvent, useEffect, useState } from 'react';
import { PaymentMethod } from '../../models/paymentMethods';
import cx from 'classnames';
import styles from '../../styles/paymentM.module.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectUser, setLoading } from '../../app/redux/app/appSlice';
import {
  addUserPaymentMethodAction,
  deleteUserPaymentMethodAction,
  finishRequest,
  getUserPaymentMethodsAction,
  selectError,
  selectPaymentMethod,
  selectPaymentMethods,
  selectRequestStatus,
  setError,
  setPaymentMethod,
  setUserPaymentMethodAction,
} from '../../app/redux/paymentMethod/paymentMethodSlice';
import { batch } from 'react-redux';
import { RequestStatus } from '../../models/api';

const PaymentMethods: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [pmName, setPmName] = useState<string>();
  const [formError, setFormError] = useState(false);
  const error = useAppSelector(selectError);
  const pMethods = useAppSelector(selectPaymentMethods);
  const paymentMethod = useAppSelector(selectPaymentMethod);
  const requestStatus = useAppSelector(selectRequestStatus);
  const user = useAppSelector(selectUser);
  const userId = user?.uid || '';

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!pMethods || pMethods.length < 1) {
      dispatch(
        getUserPaymentMethodsAction({
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
      dispatch(setLoading(true));
    }
    if (requestStatus === RequestStatus.IDLE) {
      dispatch(setLoading(false));
    }
  }, [requestStatus]);

  useEffect(() => {
    if (paymentMethod) {
      setShowForm(true);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (!showForm) {
      dispatch(setPaymentMethod(undefined));
      setPmName('');
      setFormError(false);
    }
  }, [showForm]);

  useEffect(() => {
    if (error) {
      showNotificationError();
    }
  }, [error]);

  const handleOnChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPmName(value);
    if (!value) setFormError(true);
    else setFormError(false);
  };

  const handleOnCancelForm = () => {
    setShowForm(false);
  };

  const handleOnOkForm = () => {
    if (!pmName) setFormError(true);
    else {
      const newPaymentMethod: PaymentMethod = {
        id: paymentMethod?.id || '',
        name: pmName,
        userId,
      };
      batch(() => {
        dispatch(
          paymentMethod && paymentMethod.id
            ? setUserPaymentMethodAction(newPaymentMethod)
            : addUserPaymentMethodAction(newPaymentMethod)
        )
          .unwrap()
          .then(resp => {
            if (resp.status === 200) {
              const message =
                paymentMethod && paymentMethod.id
                  ? 'Payment method updated successfully'
                  : 'Payment method added successfully';
              notification.open({
                message: message,
                type: 'info',
              });
            } else dispatch(setError(true));
          })
          .finally(() => {
            setShowForm(false);
          });
      });
    }
  };

  const handleEditPM = (pMethod: PaymentMethod) => {
    dispatch(setPaymentMethod(pMethod));
    setPmName(pMethod.name);
  };

  const handleDelete = (pmId: string) => {
    batch(() => {
      dispatch(deleteUserPaymentMethodAction(pmId))
        .unwrap()
        .then(resp => {
          if (resp.status === 200) {
            notification.open({
              message: 'Payment method deleted successfully',
              type: 'success',
            });
          } else dispatch(setError(true));
        })
        .finally(() => {
          setShowForm(false);
        });
    });
  };

  const showNotificationError = () =>
    notification.open({
      message: 'An error has ocurred, please try again later',
      type: 'error',
    });

  return (
    <>
      <div className={styles.paymentMContainer}>
        <div id="paymentInnerContainer" className={styles.paymentMInnerC}>
          {showForm && (
            <Modal
              cancelText="Cancel"
              centered
              closable
              getContainer={() =>
                document.getElementById('paymentInnerContainer') as HTMLElement
              }
              okText="Save"
              onCancel={handleOnCancelForm}
              onOk={handleOnOkForm}
              title={pmName ? 'Edit payment method' : 'Add new payment method'}
              visible={showForm}
            >
              <div
                className={cx(styles.formContainer, {
                  [styles.error]: formError,
                })}
              >
                <div className={styles.nameContainer}>
                  <label htmlFor="name">Name:</label>
                  <Input
                    id="name"
                    onChange={handleOnChangeName}
                    value={pmName}
                  />
                </div>
                <div className={styles.msgContainer}>
                  <div />
                  <span>Name is mandatory</span>
                </div>
              </div>
            </Modal>
          )}
          <Card title={<h1>Payment Methods</h1>}>
            {pMethods && pMethods.length > 0 ? (
              <>
                <List
                  dataSource={pMethods}
                  renderItem={item => (
                    <List.Item
                      onClick={() => {
                        handleEditPM(item);
                      }}
                    >
                      <div className={styles.innerListContainer}>
                        <Typography.Text>{item.name}</Typography.Text>
                        <Popconfirm
                          cancelText="No"
                          getPopupContainer={() =>
                            document.getElementById('deleteIcon') as HTMLElement
                          }
                          icon={null}
                          okText="Yes"
                          onCancel={(e?: MouseEvent<HTMLElement>) => {
                            e && e.stopPropagation();
                          }}
                          onConfirm={(e?: MouseEvent<HTMLElement>) => {
                            e && e.stopPropagation();
                            handleDelete(item?.id);
                          }}
                          placement="left"
                          title="Sure to delete?"
                        >
                          <DeleteTwoTone
                            className={styles.deleteIcon}
                            id="deleteIcon"
                            onClick={(e: MouseEvent<HTMLElement>) => {
                              e.stopPropagation();
                            }}
                          />
                        </Popconfirm>
                      </div>
                    </List.Item>
                  )}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                No data, try to add an payment method
              </div>
            )}
          </Card>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <div className={styles.addIcon}>
          <PlusOutlined
            onClick={() => {
              setShowForm(true);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PaymentMethods;

import { PlusOutlined } from '@ant-design/icons';
import { Card, notification } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Period } from '../../../models/period/Period';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  deleteUserPeriodAction,
  finishRequest,
  getUserPeriodsAction,
  selectPeriod,
  selectPeriods,
  selectRequestStatus,
  setError,
  setUserPeriodAction,
} from '../../../app/redux/period';
import { RequestStatus } from '../../../models/api';

import styles from '../../../styles/periods.module.scss';
import AlertPeriodModal, {
  AlertPeriodModalMode,
  AlertPeriodModalType,
} from './AlertPeriodModal';
import { PeriodLIstItem } from './PeriodListItem';
import PeriodForm from './PeriodForm';

interface PeriodListProps {
  setLoading: (flag: boolean) => void;
  userId: string;
}

const PeriodList: FC<PeriodListProps> = ({ setLoading, userId }) => {
  const [alertPeriodModal, setAlertPeriodModal] =
    useState<AlertPeriodModalType>({
      mode: AlertPeriodModalMode.Close,
      show: false,
    });
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

  const handleActionPeriod = () => {
    setLoading(true);
    if (period?.id) {
      if (alertPeriodModal.mode === AlertPeriodModalMode.Delete) {
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
            setAlertPeriodModal({
              mode: AlertPeriodModalMode.Delete,
              show: false,
            });
          });
      } else {
        const p: Period = {
          ...period,
          closed: !period.closed,
        };
        dispatch(setUserPeriodAction(p))
          .unwrap()
          .then(resp => {
            if (resp.status === 200) {
              notification.open({
                message: `Period ${
                  period.closed ? 'opened' : 'closed'
                } successfully`,
                type: 'success',
              });
            } else {
              dispatch(setError(true));
            }
          })
          .finally(() => {
            setAlertPeriodModal({
              mode: AlertPeriodModalMode.Close,
              show: false,
            });
          });
      }
    }
  };

  if (!periods || periods.length < 1)
    return <div>No hay periodos para mostrar</div>;

  return (
    <div className={styles.innerPeriodListC}>
      {showPeriodForm && (
        <PeriodForm
          period={period}
          setLoading={setLoading}
          setShowPeriodForm={setShowPeriodForm}
        />
      )}
      <div className={styles.mainListCard}>
        <Card title={<h1>Periods</h1>}>
          <AlertPeriodModal
            alertPeriodModal={alertPeriodModal}
            handleActionPeriod={handleActionPeriod}
            isPeriodClosed={period?.closed ?? false}
            setAlertPeriodModal={setAlertPeriodModal}
          />
          <ul className={styles.periodListContainer}>
            {periods.map(cPeriod => (
              <li>
                <PeriodLIstItem
                  period={cPeriod}
                  setAlertPeriodModal={setAlertPeriodModal}
                  setShowPeriodForm={setShowPeriodForm}
                />
              </li>
            ))}
          </ul>
        </Card>
        <div className="actionsContainer">
          <div></div>
          <div className="addIcon">
            <PlusOutlined
              onClick={() => {
                setShowPeriodForm(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodList;

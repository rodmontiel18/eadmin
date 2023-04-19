import { Card, Dropdown, Menu } from 'antd';
import { Link } from 'react-router-dom';
import styles from '../../../styles/periods.module.scss';
import { Period } from '../../../models/period/Period';
import cx from 'classnames';
import { FC, MouseEvent } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { setPeriod } from '../../../app/redux/period';
import { MoreOutlined } from '@ant-design/icons';
import { AlertPeriodModalMode, AlertPeriodModalType } from './AlertPeriodModal';

type Props = {
  period: Period;
  setAlertPeriodModal: (alertPeriodModal: AlertPeriodModalType) => void;
  setShowPeriodForm: (flag: boolean) => void;
};

export const PeriodLIstItem: FC<Props> = ({
  period,
  setAlertPeriodModal,
  setShowPeriodForm,
}) => {
  const dispatch = useAppDispatch();

  const handleEditPeriod = (per: Period) => {
    dispatch(setPeriod(per));
    setShowPeriodForm(true);
  };

  return (
    <Link to={`/periods/${period.id}`}>
      <Card
        className={cx(styles.periodCard, {
          [styles.closedPeriod]: period?.closed,
        })}
        title={
          <div className={styles.head}>
            <div>{period.name}</div>
            <Dropdown
              overlay={
                <Menu
                  items={[
                    {
                      label: 'Edit',
                      key: '0',
                      onClick: info => {
                        info.domEvent.stopPropagation();
                        handleEditPeriod(period);
                      },
                    },
                    {
                      label: period.closed ? 'Open' : 'Close',
                      key: '1',
                      onClick: info => {
                        info.domEvent.stopPropagation();
                        dispatch(setPeriod(period));
                        setAlertPeriodModal({
                          mode: AlertPeriodModalMode.Close,
                          show: true,
                        });
                      },
                    },
                    {
                      label: 'Delete',
                      key: '2',
                      onClick: info => {
                        info.domEvent.stopPropagation();
                        dispatch(setPeriod(period));
                        setAlertPeriodModal({
                          mode: AlertPeriodModalMode.Delete,
                          show: true,
                        });
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
        {period.from.format('L')}
        <br />
        <span>{'To: '}</span>
        <br />
        {period.to.format('L')}
      </Card>
    </Link>
  );
};

import { Modal } from 'antd';
import { setPeriod } from '../../../app/redux/period';
import { FC } from 'react';
import { WarningOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../app/hooks';

export enum AlertPeriodModalMode {
  Delete = 1,
  Close,
}
export interface AlertPeriodModalType {
  mode: AlertPeriodModalMode;
  show: boolean;
}

interface Props {
  alertPeriodModal: AlertPeriodModalType;
  handleActionPeriod: () => void;
  isPeriodClosed: boolean;
  setAlertPeriodModal: (alertPeriodModal: AlertPeriodModalType) => void;
}

const AlertPeriodModal: FC<Props> = ({
  alertPeriodModal,
  isPeriodClosed,
  handleActionPeriod,
  setAlertPeriodModal,
}) => {
  const dispatch = useAppDispatch();

  return (
    <Modal
      cancelText="No"
      centered
      onCancel={() => {
        dispatch(setPeriod(undefined));
        setAlertPeriodModal({
          mode: AlertPeriodModalMode.Delete,
          show: false,
        });
      }}
      onOk={handleActionPeriod}
      okText="Yes"
      title={
        <>
          Waring <WarningOutlined style={{ color: 'yellow' }} />
        </>
      }
      visible={alertPeriodModal.show}
    >
      Are you sure to{' '}
      {alertPeriodModal.mode === AlertPeriodModalMode.Delete
        ? 'delete'
        : isPeriodClosed
        ? 'open'
        : 'close'}{' '}
      this period?
    </Modal>
  );
};

export default AlertPeriodModal;

import { Button, Modal, Popconfirm, Select, notification } from 'antd';
import { FC, useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { setError, setOutcomeGroup } from '../../../app/redux/outcomeGroup';
import { WarningOutlined } from '@ant-design/icons';
import { addOutcomesGroupToPeriod } from '../../../app/redux/period';
import cx from 'classnames';

import styles from '../../../styles/outcomeGroup.module.scss';
import { Period } from '../../../models/period/Period';
import { DefaultOptionType } from 'antd/lib/select';

interface AlertOutcomeGroupModalProps {
  handleDeleteGroup: () => void;
  setShowAlertGroupModal: (flag: boolean) => void;
}
const AlertOutcomeGroupModal: FC<AlertOutcomeGroupModalProps> = ({
  handleDeleteGroup,
  setShowAlertGroupModal,
}) => {
  const dispatch = useAppDispatch();

  return (
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
      visible
    >
      Are you sure to delete this group?
    </Modal>
  );
};

interface AddToPeriodModalProps {
  groupId: string;
  periods: Period[];
  setShowAddToPeriodModal: (flag: boolean) => void;
}

const AddToPeriodModal: FC<AddToPeriodModalProps> = ({
  groupId,
  periods,
  setShowAddToPeriodModal,
}) => {
  const dispatch = useAppDispatch();
  const [formError, setFormError] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  const handleAddToPeriod = () => {
    if (!selectedPeriodId) setFormError(true);
    else if (groupId) {
      dispatch(
        addOutcomesGroupToPeriod({
          parentItemId: selectedPeriodId,
          entityId: groupId,
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
      visible
    >
      <div className={cx(styles.formContainer, { [styles.error]: formError })}>
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
  );
};

export { AlertOutcomeGroupModal, AddToPeriodModal };

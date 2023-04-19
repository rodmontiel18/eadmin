import { PlusOutlined } from '@ant-design/icons';
import { Card, notification } from 'antd';
import { FC, useEffect, useState } from 'react';
import { OutcomeGroup } from '../../../models/outcomeGroup/OutcomeGroup';
import OutcomeGroupForm from '../OutcomeGroupForm';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  deleteUserOutcomeGroupAction,
  finishRequest as ogFinishRequest,
  getUserOutcomeGroupsAction,
  selectOutcomeGroup,
  selectOutcomeGroups,
  selectRequestStatus as selectOutcomeGroupRequestStatus,
  setError,
  setOutcomeGroup,
} from '../../../app/redux/outcomeGroup';
import {
  finishRequest as pFinishRequest,
  getUserPeriodsAction,
  selectPeriods,
  selectRequestStatus as selectPeriodRequestStatus,
} from '../../../app/redux/period';
import { RequestStatus } from '../../../models/api';
import { AddToPeriodModal, AlertOutcomeGroupModal } from './OutcomeGroupModals';

import styles from '../../../styles/outcomeGroup.module.scss';
import { OutcomeGroupListItem } from './OutcomeGroupListItem';

interface OutcomeGroupListProps {
  setLoading: (flag: boolean) => void;
  userId: string;
}

const OutcomeGroupList: FC<OutcomeGroupListProps> = ({
  setLoading,
  userId,
}) => {
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
    if ((!periods || periods.length < 1) && (!groups || groups.length < 1)) {
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
      if (!periods || periods.length < 1) {
        dispatch(
          getUserPeriodsAction({
            userId,
          })
        );
      }
      if (!groups || groups.length < 1) {
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

  return (
    <div
      id="outcomeGLInnerContainer"
      className={styles.outcomesGLInnerContainer}
    >
      {showAlertGroupModal && (
        <AlertOutcomeGroupModal
          handleDeleteGroup={handleDeleteGroup}
          setShowAlertGroupModal={setShowAlertGroupModal}
        />
      )}
      {showAddToPeriodModal && group?.id && periods && (
        <AddToPeriodModal
          groupId={group?.id}
          periods={periods}
          setShowAddToPeriodModal={setShowAddToPeriodModal}
        />
      )}
      {showOutcomeGroupForm && (
        <OutcomeGroupForm
          group={group}
          setLoading={setLoading}
          setShowOutcomeGroupForm={setShowOutcomeGroupForm}
          userId={userId}
        />
      )}
      <div className={styles.mainListCard}>
        <Card title={<h1>Outcome groups</h1>}>
          {groups && groups?.length > 0 && periods && periods?.length > 0 ? (
            <ul className={styles.groupListContainer}>
              {groups.map(og => (
                <li>
                  <OutcomeGroupListItem
                    handleEditGroup={handleEditGroup}
                    outcomeGroup={og}
                    periods={periods}
                    setShowAddToPeriodModal={setShowAddToPeriodModal}
                    setShowAlertGroupModal={setShowAlertGroupModal}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center' }}>
              No data, try to add a group
            </div>
          )}
        </Card>
      </div>
      <div className="actionsContainer">
        <div className="addIcon">
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

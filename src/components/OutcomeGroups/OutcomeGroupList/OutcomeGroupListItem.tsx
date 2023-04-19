import { Card, Dropdown, Menu } from 'antd';
import { Link } from 'react-router-dom';

import styles from '../../../styles/outcomeGroup.module.scss';
import { MoreOutlined } from '@ant-design/icons';
import { FC, MouseEvent } from 'react';
import { OutcomeGroup } from '../../../models/outcomeGroup/OutcomeGroup';
import { useAppDispatch } from '../../../app/hooks';
import { setOutcomeGroup } from '../../../app/redux/outcomeGroup';
import { Period } from '../../../models/period/Period';

interface Props {
  handleEditGroup: (outcomeGroup: OutcomeGroup) => void;
  outcomeGroup: OutcomeGroup;
  periods: Period[];
  setShowAddToPeriodModal: (flag: boolean) => void;
  setShowAlertGroupModal: (flag: boolean) => void;
}

const OutcomeGroupListItem: FC<Props> = ({
  handleEditGroup,
  outcomeGroup,
  periods,
  setShowAddToPeriodModal,
  setShowAlertGroupModal,
}) => {
  const dispatch = useAppDispatch();

  return (
    <Link to={`/outcome-group/${outcomeGroup.id}`}>
      <Card
        className={styles.outcomeGroupCard}
        title={
          <div className={styles.head}>
            <div>{outcomeGroup.name}</div>
            <Dropdown
              overlay={
                <Menu
                  items={[
                    {
                      label: 'Edit',
                      key: '0',
                      onClick: info => {
                        info.domEvent.stopPropagation();
                        handleEditGroup(outcomeGroup);
                      },
                    },
                    {
                      label: 'Delete',
                      key: '1',
                      onClick: info => {
                        info.domEvent.stopPropagation();
                        dispatch(setOutcomeGroup(outcomeGroup));
                        setShowAlertGroupModal(true);
                      },
                    },
                    {
                      disabled: !periods || periods?.length < 1,
                      key: '2',
                      label: 'Add to period',
                      onClick: info => {
                        info.domEvent.stopPropagation();
                        dispatch(setOutcomeGroup(outcomeGroup));
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
        {outcomeGroup.description}
      </Card>
    </Link>
  );
};

export { OutcomeGroupListItem };

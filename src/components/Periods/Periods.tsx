import { notification, Tabs } from 'antd';
import { FC, useEffect, useState } from 'react';
import { OutcomeTabs } from '../../models/outcome';
import PeriodList from './PeriodList/PeriodList';

import styles from '../../styles/periods.module.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectUser, setLoading } from '../../app/redux/app';
import { ParamKeyValuePair, useSearchParams } from 'react-router-dom';
import { selectError } from '../../app/redux/period';
import OutcomeGroupList from '../OutcomeGroups/OutcomeGroupList/OutcomeGroupList';

const Periods: FC = () => {
  const [activeTab, setActiveTab] = useState<OutcomeTabs>(OutcomeTabs.Periods);
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const userId = useAppSelector(selectUser)?.uid;

  useEffect(() => {
    const queryStrTab = searchParams.get('tab');
    const tabParam: ParamKeyValuePair = [
      'tab',
      `${queryStrTab || OutcomeTabs.Periods}`,
    ];
    setActiveTab(
      (queryStrTab && parseInt(queryStrTab, 10)) || OutcomeTabs.Periods
    );
    setSearchParams([tabParam]);
  }, []);

  useEffect(() => {
    if (error) {
      showNotificationError();
    }
  }, [error]);

  const handleOnChangeTab = (key: string) => {
    const numKey = parseInt(key, 10);
    const tabParam: ParamKeyValuePair = ['tab', `${numKey}`];
    setSearchParams([tabParam]);
    setActiveTab(numKey);
  };

  const handleSetLoading = (flag: boolean) => {
    dispatch(setLoading(flag));
  };

  const showNotificationError = () =>
    notification.open({
      message: 'An error has ocurred, try again later',
      type: 'error',
    });

  return (
    <div className={styles.periodsContainer}>
      {userId && (
        <Tabs activeKey={`${activeTab}`} onChange={handleOnChangeTab}>
          <Tabs.TabPane tab="Periods" key={`${OutcomeTabs.Periods}`}>
            <PeriodList setLoading={handleSetLoading} userId={userId} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Groups" key={`${OutcomeTabs.Groups}`}>
            <OutcomeGroupList setLoading={handleSetLoading} userId={userId} />
          </Tabs.TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default Periods;

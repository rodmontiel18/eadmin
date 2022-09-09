import { notification, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { Category, CategoryType } from '../../models/category';
import OutcomeList from '../Outcomes/OutcomeList';
import Graphs from './Graphs/Graphs';
import styles from '../../styles/periods.module.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectUser, setLoading } from '../../app/redux/app/appSlice';
import {
  getUserCategoriesAction,
  selectCategories,
} from '../../app/redux/category/categorySlice';
import {
  Link,
  ParamKeyValuePair,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  getUserPeriodsAction,
  selectError,
  selectPeriodById,
} from '../../app/redux/period/periodSlice';
import IncomeList from '../Incomes/IncomeList';
import moment from 'moment';

enum PeriodTabs {
  Outcomes = 1,
  Incomes,
  Graphs,
}

const PeriodDetail = () => {
  const [activeTab, setActiveTab] = useState<PeriodTabs>(PeriodTabs.Outcomes);
  const params = useParams();

  const periodId = params?.periodId || '';
  const period = useAppSelector(selectPeriodById(periodId));

  const categories = useAppSelector(selectCategories);
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = useAppSelector(selectUser)?.uid || '';

  useEffect(() => {
    if (periodId) {
      const queryStrTab = searchParams.get('tab');
      const tabParam: ParamKeyValuePair = [
        'tab',
        `${queryStrTab || PeriodTabs.Outcomes}`,
      ];
      setActiveTab(
        (queryStrTab && parseInt(queryStrTab, 10)) || PeriodTabs.Outcomes
      );
      setSearchParams([tabParam]);

      if (categories.length < 1) {
        dispatch(
          getUserCategoriesAction({
            userId,
          })
        );
      }

      if (period === undefined) {
        dispatch(getUserPeriodsAction({ userId }));
      }
    }
  }, []);

  useEffect(() => {
    if (categories && categories.length === 0) handleSetLoading(false);
  }, [categories]);

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

  const getTabCategories = (type: CategoryType): Category[] => {
    if (categories && categories?.length > 0)
      return categories.filter(c => c.type === type);
    return [];
  };

  const showNotificationError = () =>
    notification.open({
      message: 'An error has ocurried, try again later',
      type: 'error',
    });

  const outcomeCategories = getTabCategories(CategoryType.Outcomes);
  const incomeCategories = getTabCategories(CategoryType.Income);

  if (categories && categories?.length > 0) {
    return (
      <div className={styles.periodDContainer}>
        <h1>{period?.name}</h1>
        <div style={{ textAlign: 'center' }}>
          <span>
            {moment.unix(period?.from || 0).format('L')} -{' '}
            {moment.unix(period?.to || 0).format('L')}
          </span>
        </div>
        <Tabs defaultActiveKey={`${activeTab}`} onChange={handleOnChangeTab}>
          <Tabs.TabPane key={`${PeriodTabs.Outcomes}`} tab="Outcomes">
            <div className={styles.periodDOutcomesListC}>
              <OutcomeList
                categories={outcomeCategories}
                setLoading={handleSetLoading}
                periodId={periodId}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key={`${PeriodTabs.Incomes}`} tab="Incomes">
            <div className={styles.periodDIncomesListC}>
              <IncomeList
                categories={incomeCategories}
                periodId={periodId}
                userId={userId}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key={`${PeriodTabs.Graphs}`} tab="Graphs">
            <Graphs categories={categories} periodId={periodId} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  } else {
    return (
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <p>
            Before to begin here, you need to add some{' '}
            <Link to="/categories">Categories</Link> first
          </p>
        </div>
      </div>
    );
  }
};

export default PeriodDetail;

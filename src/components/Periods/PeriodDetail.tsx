import { notification, Tabs } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Category, CategoryType } from '../../models/category';
import OutcomeList from '../Outcomes/OutcomeList';
import Graphs from './Graphs/Graphs';
import styles from '../../styles/periodDetail.module.scss';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectUser, setLoading } from '../../app/redux/app';
import {
  getUserCategoriesAction,
  selectCategories,
} from '../../app/redux/category';
import {
  Link,
  ParamKeyValuePair,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  getUserPeriodsAction,
  selectError,
  selectPeriodById,
  selectPeriods,
} from '../../app/redux/period';
import IncomeList from '../Incomes/IncomeList';

enum PeriodTabs {
  Outcomes = 1,
  Incomes,
  Graphs,
}

const PeriodDetail = () => {
  const [activeTab, setActiveTab] = useState<PeriodTabs>(PeriodTabs.Outcomes);
  const params = useParams();
  const navigation = useNavigate();

  const periodId = params?.periodId || '';
  const period = useAppSelector(selectPeriodById(periodId));
  const periods = useAppSelector(selectPeriods);

  const categories = useAppSelector(selectCategories);
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = useAppSelector(selectUser)?.uid || '';
  const currentPeriodIndex = useMemo(() => {
    if (periods) {
      return periods.findIndex(p => p.id === periodId);
    }
    return -1;
  }, [periodId, JSON.stringify(periods)]);

  useEffect(() => {
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
    if (!periods || periods.length === 0) {
      dispatch(
        getUserPeriodsAction({
          userId,
        })
      );
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

  const stickyButtonAction = (action: string) => {
    if (periods && periods?.length > 0) {
      if (action == 'prev') {
        if (currentPeriodIndex > 0) {
          navigation(`/periods/${periods[currentPeriodIndex - 1].id}`, {
            replace: true,
          });
        }
      } else {
        if (currentPeriodIndex < periods.length - 1) {
          navigation(`/periods/${periods[currentPeriodIndex + 1].id}`, {
            replace: true,
          });
        }
      }
    }
  };

  const outcomeCategories = getTabCategories(CategoryType.Outcomes);
  const incomeCategories = getTabCategories(CategoryType.Income);

  if (categories && categories?.length > 0) {
    return (
      <div className={styles.periodDContainer}>
        <div className={styles.periodStickyBar}>
          {periods && currentPeriodIndex !== 0 ? (
            <div
              className={styles.prev}
              title="Previous period"
              onClick={() => stickyButtonAction('prev')}
            >
              <LeftOutlined />
            </div>
          ) : (
            <div />
          )}
          {periods && currentPeriodIndex !== periods.length - 1 && (
            <div
              className={styles.next}
              title="Next period"
              onClick={() => stickyButtonAction('next')}
            >
              <RightOutlined />
            </div>
          )}
        </div>
        <h1>{period?.name}</h1>
        <div className={styles.periodDates}>
          <span>
            {period?.from.format('L')} - {period?.to.format('L')}
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
        <div className="noData">
          <p>
            Before to begin here, you need to add some{' '}
            <Link
              to="/categories"
              style={{ color: 'darkblue', textDecoration: 'underline' }}
            >
              Categories
            </Link>{' '}
            first
          </p>
        </div>
      </div>
    );
  }
};

export default PeriodDetail;

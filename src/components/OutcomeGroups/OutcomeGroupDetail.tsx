import { useEffect } from 'react';
import OutcomeList from '../Outcomes/OutcomeList';
import { selectUser, setLoading } from '../../app/redux/app';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Link, useParams } from 'react-router-dom';
import {
  getUserOutcomeGroupsAction,
  selectError,
  selectOutcomeGroupById,
} from '../../app/redux/outcomeGroup';
import {
  getUserCategoriesAction,
  selectCategories,
} from '../../app/redux/category';
import { notification } from 'antd';

import styles from '../../styles/outcomeGroup.module.scss';

const OutcomeGroupDetail = () => {
  const categories = useAppSelector(selectCategories);
  const error = useAppSelector(selectError);
  const params = useParams();
  const groupId = params?.groupId || '';
  const group = useAppSelector(selectOutcomeGroupById(groupId));
  const userId = useAppSelector(selectUser)?.uid || '';

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (categories.length < 1) {
      dispatch(
        getUserCategoriesAction({
          userId,
        })
      );
    }

    if (!group) {
      dispatch(getUserOutcomeGroupsAction({ userId }));
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

  const handleSetLoading = (flag: boolean) => {
    dispatch(setLoading(flag));
  };

  const noCategories = (): JSX.Element => {
    return (
      <div className="container">
        <div className="noData">
          <p>
            Before to begin here, you need to add some{' '}
            <Link to="/categories">Categories</Link> first
          </p>
        </div>
      </div>
    );
  };

  const showNotificationError = () =>
    notification.open({
      message: 'An error has ocurried, try again later',
      type: 'error',
    });

  if (categories && categories?.length > 0 && groupId)
    return (
      <div className={styles.outcomeDC}>
        <h1 style={{ marginBottom: 20 }}>{group?.name}</h1>
        <OutcomeList
          categories={categories}
          groupId={groupId}
          setLoading={handleSetLoading}
        />
      </div>
    );
  else return noCategories();
};

export default OutcomeGroupDetail;

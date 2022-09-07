import { useEffect } from 'react';
import OutcomeList from '../Outcomes/OutcomeList';
import { selectUser, setLoading } from '../../app/redux/app/appSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Link, useParams } from 'react-router-dom';
import { selectError } from '../../app/redux/outcomeGroup/outcomeGroupSlice';
import {
  getUserCategoriesAction,
  selectCategories,
} from '../../app/redux/category/categorySlice';
import { notification } from 'antd';

import styles from '../../styles/outcomeGroup.module.scss';

const OutcomeGroupDetail = () => {
  const categories = useAppSelector(selectCategories);
  const error = useAppSelector(selectError);
  const params = useParams();
  const groupId = params?.groupId || '';
  const userId = useAppSelector(selectUser)?.uid || '';

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (categories === undefined) {
      dispatch(
        getUserCategoriesAction({
          userId,
        })
      );
    }
  }, []);

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
        <div style={{ textAlign: 'center' }}>
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

  return (
    <div className={styles.outcomeDC}>
      {categories && categories?.length > 0 && groupId ? (
        <OutcomeList
          categories={categories}
          groupId={groupId}
          setLoading={handleSetLoading}
        />
      ) : (
        noCategories()
      )}
    </div>
  );
};

export default OutcomeGroupDetail;

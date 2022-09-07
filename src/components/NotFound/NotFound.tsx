import { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setLoading } from '../../app/redux/app/appSlice';

const NotFound = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setLoading(false));
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        fontSize: 48,
        fontWeight: 'bolder',
        textAlign: 'center',
      }}
    >
      <span>Page not found</span>
    </div>
  );
};

export default NotFound;

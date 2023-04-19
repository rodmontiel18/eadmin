import { Alert, Button, Form, Input } from 'antd';
import Cookies from 'js-cookie';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { login, setLoading } from '../../app/redux/app';
import styles from '../../styles/signin.module.scss';

interface SigninFormModel {
  email: string;
  password: string;
}

const SignIn: FC = () => {
  const [signinError, setSigninError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cookieToken = Cookies.get('token');

  useEffect(() => {
    dispatch(setLoading(false));
    if (cookieToken) {
      navigate('/');
    }
  }, []);

  const handleOnFinish = (values: SigninFormModel) => {
    const { email, password } = values;
    dispatch(login({ email, password }))
      .unwrap()
      .then(res => {
        if (res?.user?.uid) {
          navigate('/');
        } else {
          setSigninError('an error ocurred');
        }
      })
      .catch(error => {
        if (
          ['auth/user-not-found', 'auth/wrong-password'].includes(error?.code)
        ) {
          setSigninError('Usuario invalido');
        }
      });
  };

  return (
    <div className={styles.signinContainer}>
      <div className={styles.innerSigninContainer}>
        <Form
          name="signin"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          initialValues={{ remember: true }}
          onFinish={handleOnFinish}
          autoComplete="off"
        >
          <h1>Login</h1>
          {signinError && (
            <Alert
              closable
              message={signinError}
              style={{ marginBottom: 20 }}
              type="error"
            />
          )}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required', type: 'email' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password />
          </Form.Item>
          <div style={{ textAlign: 'end' }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignIn;

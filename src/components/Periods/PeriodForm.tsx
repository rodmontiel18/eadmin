import { Button, DatePicker, Form, Input, notification } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { Moment } from 'moment';
import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectUser } from '../../app/redux/app/appSlice';
import {
  addUserPeriodAction,
  setError,
  setPeriod,
  setUserPeriodAction,
} from '../../app/redux/period/periodSlice';
import { Period } from '../../models/period/Period';

interface PeriodFormProps {
  period?: Period;
  setLoading: (flag: boolean) => void;
  setShowPeriodForm: (flag: boolean) => void;
}

interface PeriodFormInputs {
  name: string;
  rangeDates: [Moment, Moment];
}

const PeriodForm: FC<PeriodFormProps> = ({
  period,
  setLoading,
  setShowPeriodForm,
}) => {
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUser)?.uid;

  useEffect(() => {
    if (period) {
      const { from, name, to } = period;
      if (from && name && to) {
        const tRangeDates = [from, to];
        form.setFieldsValue({
          name: name,
          rangeDates: tRangeDates,
        });
      }
    }
    setLoading(false);
    return () => {
      form.resetFields();
      dispatch(setPeriod(undefined));
    };
  }, []);

  const handleOnSubmit = (inputs: PeriodFormInputs) => {
    setLoading(true);
    const { rangeDates, name } = inputs;
    const [from, to] = rangeDates;
    const p: Period = {
      closed: false,
      from: from,
      id: period?.id || '',
      name,
      to: to,
      userId: userId || '',
    };
    dispatch(period?.id ? setUserPeriodAction(p) : addUserPeriodAction(p))
      .unwrap()
      .then(resp => {
        if (resp.status === 200) {
          const message = period?.id
            ? 'Period updated successfully'
            : 'Period added succesfully';
          notification.open({
            message: message,
            type: 'info',
          });
        } else dispatch(setError(true));
      })
      .finally(() => {
        setShowPeriodForm(false);
      });
  };

  return (
    <Form
      autoComplete="off"
      form={form}
      labelCol={{ span: 6 }}
      name="period"
      onFinish={handleOnSubmit}
      wrapperCol={{ span: 18 }}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Name is mandatory' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Range dates"
        name="rangeDates"
        rules={[{ required: true, message: 'Range date is mandatory' }]}
      >
        <DatePicker.RangePicker inputReadOnly size="small" />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button
          htmlType="button"
          onClick={() => {
            setShowPeriodForm(false);
          }}
          style={{ marginRight: 10 }}
        >
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PeriodForm;

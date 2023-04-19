import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Switch,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { Moment } from 'moment';
import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectUser } from '../../../app/redux/app';
import {
  addUserPeriodAction,
  setError,
  setPeriod,
  setUserPeriodAction,
} from '../../../app/redux/period';
import { Period } from '../../../models/period/Period';

interface PeriodFormProps {
  period?: Period;
  setLoading: (flag: boolean) => void;
  setShowPeriodForm: (flag: boolean) => void;
}

interface PeriodFormInputs {
  closed: boolean;
  name: string;
  outcomeLimit?: number;
  rangeDates: [Moment, Moment];
}

const PeriodForm: FC<PeriodFormProps> = ({
  period,
  setLoading,
  setShowPeriodForm,
}) => {
  const [form] = useForm<PeriodFormInputs>();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUser)?.uid;

  useEffect(() => {
    if (period) {
      const { closed, from, name, outcomeLimit, to } = period;
      if (from && name && to) {
        const tRangeDates = [from, to];
        form.setFieldsValue({
          closed,
          name: name,
          outcomeLimit,
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
    const { closed = false, name, outcomeLimit = -1, rangeDates } = inputs;
    const [from, to] = rangeDates;
    const p: Period = {
      closed,
      from,
      id: period?.id || '',
      name,
      outcomeLimit,
      to,
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
    <Modal
      centered
      closable
      destroyOnClose
      footer={null}
      onCancel={() => {
        setShowPeriodForm(false);
      }}
      title={`${period ? 'Edit' : 'Add new'} period`}
      visible
    >
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
        <Form.Item label="Outcome limit" name="outcomeLimit">
          <InputNumber />
        </Form.Item>
        <Form.Item label="Period closed" name="closed" valuePropName="checked">
          <Switch />
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
    </Modal>
  );
};

export default PeriodForm;

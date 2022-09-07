import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { RangePickerProps } from 'antd/lib/date-picker';
import { useForm } from 'antd/lib/form/Form';
import moment, { Moment } from 'moment';
import { FC, useEffect } from 'react';
import { Category } from '../../models/category';
import { Outcome, OutcomeState } from '../../models/outcome';
import { PaymentMethod } from '../../models/paymentMethods';

import globals from '../../styles/globals.module.scss';
import { useAppSelector } from '../../app/hooks';
import { selectPeriodById } from '../../app/redux/period/periodSlice';

const { Option } = Select;

interface OutcomeFormType {
  amount: number;
  categoryId: string;
  description: string;
  outcomeDate: Moment;
  paymentMethodId: string;
  responsible: string;
  state: OutcomeState;
}

interface OutcomeFormProps {
  categories: Category[];
  outcome?: Outcome;
  groupId?: string;
  paymentMethods: PaymentMethod[];
  periodId?: string;
  resetOutcome: () => void;
  setLoading: (flag: boolean) => void;
  setOutcomeAction: (outcome: Outcome) => void;
  setShowOutcomeFormModal: (flag: boolean) => void;
  userId: string;
}

const OutcomeForm: FC<OutcomeFormProps> = ({
  categories,
  outcome,
  groupId = '',
  paymentMethods,
  periodId = '',
  resetOutcome,
  setOutcomeAction,
  setShowOutcomeFormModal,
  userId,
}) => {
  const [form] = useForm();
  const period = useAppSelector(selectPeriodById(periodId));

  useEffect(() => {
    return () => {
      form.resetFields();
      resetOutcome();
    };
  }, []);

  const handleOnSubmit = (lOutcome: OutcomeFormType) => {
    const outcomeToSave: Outcome = {
      amount: lOutcome.amount,
      categoryId: lOutcome.categoryId,
      description: lOutcome.description,
      groupId: groupId,
      paymentMethodId: lOutcome.paymentMethodId,
      periodId,
      responsible: lOutcome.responsible,
      state: lOutcome?.state || OutcomeState.Pending,
      userId,
    };

    if (outcome && outcome.id) outcomeToSave.id = outcome.id;
    if (lOutcome?.outcomeDate)
      outcomeToSave.outcomeDate = lOutcome.outcomeDate.unix();

    setOutcomeAction(outcomeToSave);
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current): boolean => {
    if (!period) return false;
    const from = moment.unix(period.from);
    const to = moment.unix(period.to);
    return from.subtract(1, 'days') >= current || to < current;
  };

  return (
    <Form
      autoComplete="off"
      className={globals.form}
      form={form}
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 17 }}
      name="outcome"
      onFinish={handleOnSubmit}
      size="small"
    >
      {!groupId && (
        <Form.Item
          initialValue={
            outcome?.outcomeDate ? moment.unix(outcome.outcomeDate) : ''
          }
          label="Date"
          name="outcomeDate"
          rules={[
            { required: true, message: 'Date is mandadory', type: 'date' },
          ]}
        >
          <DatePicker
            disabledDate={disabledDate}
            inputReadOnly
            showToday={false}
          />
        </Form.Item>
      )}
      <Form.Item
        initialValue={outcome?.description || ''}
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Description is mandadory' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        initialValue={outcome?.categoryId || ''}
        label="Category"
        name="categoryId"
        rules={[{ required: true, message: 'Category is mandadory' }]}
      >
        <Select
          options={categories.map<DefaultOptionType>(c => ({
            label: c.name,
            value: c.id,
          }))}
        />
      </Form.Item>
      <Form.Item
        initialValue={outcome?.paymentMethodId || ''}
        label="Payment Method"
        name="paymentMethodId"
        rules={[{ required: true, message: 'Payment method is mandadory' }]}
      >
        <Select
          options={[
            ...paymentMethods.map<DefaultOptionType>(p => ({
              label: p.name,
              value: p.id,
            })),
          ]}
        />
      </Form.Item>
      <Form.Item
        initialValue={outcome?.responsible || ''}
        label="Responsible"
        name="responsible"
        rules={[{ required: true, message: 'Responsible is mandadory' }]}
      >
        <Input />
      </Form.Item>
      {!groupId && (
        <Form.Item
          initialValue={outcome?.state || ''}
          label="State"
          name="state"
          rules={[{ required: true, message: 'State is mandadory' }]}
        >
          <Select>
            <Option value={OutcomeState.Paid}>Paid</Option>
            <Option value={OutcomeState.Pending}>Pending</Option>
            <Option value={OutcomeState.Separated}>Separated</Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item
        initialValue={outcome?.amount || ''}
        label="Amount"
        name="amount"
        rules={[
          {
            required: true,
            message: 'Amount is mandadory',
            type: 'number',
          },
        ]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button
          htmlType="button"
          onClick={() => {
            setShowOutcomeFormModal(false);
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

export default OutcomeForm;

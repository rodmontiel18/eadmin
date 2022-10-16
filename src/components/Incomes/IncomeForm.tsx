import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { RangePickerProps } from 'antd/lib/date-picker';
import { useForm } from 'antd/lib/form/Form';
import moment, { Moment } from 'moment';
import { FC, useEffect } from 'react';
import { Category } from '../../models/category';
import { Income } from '../../models/income';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addUserIncomeAction,
  selectPeriodById,
  setIncome,
  setUserIncomeAction,
} from '../../app/redux/period/periodSlice';

interface IncomeFormType {
  amount: number;
  categoryId: string;
  description: string;
  incomeDate: Moment;
}

type IncomeFormProps = {
  categories: Category[];
  income?: Income;
  periodId: string;
  setShowIncomeFormModal: (flag: boolean) => void;
  userId: string;
};

const IncomeForm: FC<IncomeFormProps> = ({
  categories,
  income,
  periodId = '',
  setShowIncomeFormModal,
  userId,
}) => {
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const period = useAppSelector(selectPeriodById(periodId));

  useEffect(() => {
    return () => {
      dispatch(setIncome());
      form.resetFields();
    };
  }, []);

  const handleOnSubmit = (lIncome: IncomeFormType) => {
    const incomeToSave: Income = {
      amount: lIncome.amount,
      categoryId: lIncome.categoryId,
      description: lIncome.description,
      periodId: periodId,
      userId: userId,
    };

    if (income && income.id) incomeToSave.id = income.id;
    if (lIncome?.incomeDate) incomeToSave.incomeDate = lIncome.incomeDate;

    if (incomeToSave.id) {
      dispatch(
        setUserIncomeAction({
          parentItemId: periodId,
          entity: incomeToSave,
          entityId: incomeToSave.id,
        })
      );
    } else {
      dispatch(
        addUserIncomeAction({ parentItemId: periodId, entity: incomeToSave })
      );
    }
    setShowIncomeFormModal(false);
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current): boolean => {
    if (!period) return false;
    const from = moment(period.from.toDate());
    const to = moment(period.to);
    return current < from || current > to;
  };

  return (
    <Form
      autoComplete="off"
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      name="income"
      onFinish={handleOnSubmit}
    >
      <Form.Item
        initialValue={
          income?.incomeDate ? income.incomeDate : period?.from || ''
        }
        label="Date"
        name="incomeDate"
        rules={[{ required: true, message: 'Date is mandadory', type: 'date' }]}
      >
        <DatePicker
          disabledDate={disabledDate}
          inputReadOnly
          showToday={false}
        />
      </Form.Item>
      <Form.Item
        initialValue={income?.description || ''}
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Description is mandadory' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        initialValue={income?.categoryId || ''}
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
        initialValue={income?.amount || ''}
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
            setShowIncomeFormModal(false);
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

export default IncomeForm;

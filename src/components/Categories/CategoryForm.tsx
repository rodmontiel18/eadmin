import { Button, Form, Input, notification, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { FC, KeyboardEvent, useEffect, useState } from 'react';
import { Popover } from 'antd';
import { Category, CategoryType } from '../../models/category';
import { CirclePicker, ColorResult } from 'react-color';
import { useAppDispatch } from '../../app/hooks';
import {
  addUserCategoryAction,
  setUserCategoryAction,
} from '../../app/redux/category';

const { Option } = Select;

type CategoryFormProps = {
  category?: Category;
  setError: (flag: boolean) => void;
  setShowCategoryFormModal: (flag: boolean) => void;
  userId: string;
};

const CategoryForm: FC<CategoryFormProps> = ({
  category,
  setError,
  setShowCategoryFormModal,
  userId,
}) => {
  const [form] = useForm();
  const [lColor, setLColor] = useState(category?.color || '');
  const dispatch = useAppDispatch();

  useEffect(() => {
    form.setFieldsValue({
      name: category?.name || '',
      description: category?.description || '',
      type: category?.type || '',
      color: category?.color || '',
    });

    return () => {
      form.resetFields();
    };
  }, []);

  const handleOnSubmit = (lCategory: Category) => {
    dispatch(
      category && category.id
        ? setUserCategoryAction({
            ...lCategory,
            id: category.id,
            color: lColor,
            userId,
          })
        : addUserCategoryAction({
            ...lCategory,
            color: lColor,
            userId,
          })
    )
      .unwrap()
      .then(resp => {
        if (resp.status === 200) {
          const message =
            category && category.id
              ? 'Category updated successfully'
              : 'Category added successfully';
          notification.open({
            message: message,
            type: 'info',
          });
        } else {
          setError(true);
        }
      })
      .finally(() => {
        setShowCategoryFormModal(false);
      });
  };

  const getColorPicker = (): JSX.Element => {
    const handleOnChange = (color: ColorResult) => {
      const { b, g, r, a } = color.rgb;
      const rgbColor = `rgba(${r}, ${g}, ${b}, ${a})`;
      form.setFieldsValue({ color: rgbColor });
      setLColor(rgbColor);
    };

    return <CirclePicker onChange={handleOnChange} />;
  };

  return (
    <Form
      autoComplete="off"
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      name="category"
      onFinish={handleOnSubmit}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Name is mandadory' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Description is mandadory' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Category Type"
        name="type"
        rules={[
          { required: true, message: 'Type is mandadory', type: 'number' },
        ]}
      >
        <Select>
          <Option value={CategoryType.Income}>Income</Option>
          <Option value={CategoryType.Outcomes}>Outcome</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Color"
        name="color"
        rules={[{ required: true, message: 'Color is mandadory' }]}
      >
        <Popover
          placement="top"
          title="Chose a color"
          trigger="click"
          content={getColorPicker()}
        >
          <Input
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              e.preventDefault();
            }}
            onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
              e.preventDefault();
            }}
            style={{ borderWidth: 3, borderColor: lColor }}
            value={lColor}
          />
        </Popover>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button
          htmlType="button"
          onClick={() => {
            setShowCategoryFormModal(false);
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

export default CategoryForm;

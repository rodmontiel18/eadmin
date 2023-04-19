import { Button, Form, Input, Modal, notification } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { FC, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import {
  addUserOutcomeGroupAction,
  setError,
  setOutcomeGroup,
  setUserOutcomeGroupAction,
} from '../../app/redux/outcomeGroup';
import { OutcomeGroup } from '../../models/outcomeGroup/OutcomeGroup';

interface OutcomeGroupFormProps {
  group?: OutcomeGroup;
  setLoading: (flag: boolean) => void;
  setShowOutcomeGroupForm: (flag: boolean) => void;
  userId: string;
}

interface OutcomeGroupFormInputs {
  name: string;
  description: string;
}

const OutcomeGroupForm: FC<OutcomeGroupFormProps> = ({
  group,
  setLoading,
  setShowOutcomeGroupForm,
  userId,
}) => {
  const [form] = useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (group) {
      const { description, name } = group;
      if (description && name) {
        form.setFieldsValue({
          name,
          description,
        });
      }
    }
    setLoading(false);
    return () => {
      form.resetFields();
      dispatch(setOutcomeGroup(undefined));
    };
  }, []);

  const handleOnSubmit = (inputs: OutcomeGroupFormInputs) => {
    setLoading(true);
    const { description, name } = inputs;
    const outcGroup: OutcomeGroup = {
      description,
      id: group?.id || '',
      name,
      userId,
    };
    dispatch(
      group?.id
        ? setUserOutcomeGroupAction(outcGroup)
        : addUserOutcomeGroupAction(outcGroup)
    )
      .unwrap()
      .then(resp => {
        if (resp.status === 200) {
          const message = group?.id
            ? 'Outcome Group updated succesfully'
            : 'Outcome Group added succesfully';
          notification.open({
            message: message,
            type: 'info',
          });
        } else dispatch(setError(true));
      })
      .finally(() => {
        setShowOutcomeGroupForm(false);
      });
  };

  return (
    <Modal
      centered
      closable
      destroyOnClose
      footer={null}
      onCancel={() => {
        setShowOutcomeGroupForm(false);
      }}
      title={`${group ? 'Edit' : 'Add new'} outcome group`}
      visible
    >
      <Form
        autoComplete="off"
        form={form}
        labelCol={{ span: 6 }}
        name="outcomeGroup"
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
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Description is mandatory' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button
            htmlType="button"
            onClick={() => {
              setShowOutcomeGroupForm(false);
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

export default OutcomeGroupForm;

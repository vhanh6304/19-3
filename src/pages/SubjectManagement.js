import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Space, Button, Table, message, Modal, Form, Input } from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách môn học
  const fetchSubjectList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/subject/pageable?page=1&limit=10');
      const remoteData = res.data || res;
      if (Array.isArray(remoteData)) {
        const formattedData = remoteData.map((item, index) => ({
          ...item,
          subjectName: item.name, // Map 'name' từ API sang 'subjectName' cho UI
          key: item.id || item._id,
          stt: index + 1,
        }));
        setSubjects(formattedData);
      }
    } catch (err) {
      message.error("Không thể tải danh sách môn học!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjectList();
  }, [fetchSubjectList]);

  // Xử lý Form Thêm/Sửa
  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      // API kỳ vọng 'name', nhưng form của chúng ta sử dụng 'subjectName'. Ta cần chuyển đổi nó.
      const { subjectName, ...restValues } = values;
      const payload = {
        ...restValues,
        name: subjectName,
      };

      try {
        if (editingRecord) {
          await axiosClient.put(`/subject/${editingRecord.id || editingRecord.key}`, payload);
          message.success(`Đã cập nhật môn học: ${values.subjectName}`);
        } else {
          await axiosClient.post('/subject', payload);
          message.success(`Đã thêm mới môn học: ${values.subjectName}`);
        }
        setIsModalOpen(false);
        fetchSubjectList(); // Tải lại danh sách
      } catch (err) {
        message.error("Có lỗi xảy ra khi lưu môn học!");
      }
    }).catch(info => console.log('Validate Failed:', info));
  };

  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Mã môn học', dataIndex: 'subjectCode', key: 'subjectCode' },
    { title: 'Tên môn học', dataIndex: 'subjectName', key: 'subjectName' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <EditOutlined style={{ color: '#faad14', cursor: 'pointer' }} onClick={() => showModal(record)} />
          <DeleteOutlined 
            style={{ color: '#ff4d4f', cursor: 'pointer' }} 
            onClick={async () => {
              try {
                await axiosClient.delete(`/subject/${record.id || record.key}`);
                message.success('Đã xóa môn học thành công!');
                fetchSubjectList();
              } catch (err) {
                message.error('Không thể xóa môn học này!');
              }
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý môn học</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#303d6b' }} onClick={() => showModal()}>Thêm môn học</Button>
          <Button icon={<DownloadOutlined />}>Export danh sách</Button>
        </Space>
      </div>
      <Table dataSource={subjects} columns={columns} loading={loading} pagination={{ pageSize: 10 }} bordered />

      <Modal title={editingRecord ? 'Chỉnh sửa môn học' : 'Thêm mới môn học'} open={isModalOpen} onOk={handleModalOk} onCancel={() => setIsModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" name="subjectForm">
          <Form.Item name="subjectCode" label="Mã môn học" rules={[{ required: true, message: 'Vui lòng nhập mã môn học!' }]}><Input placeholder="Ví dụ: INT1234" /></Form.Item>
          <Form.Item name="subjectName" label="Tên môn học" rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}><Input placeholder="Nhập tên môn học" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SubjectManagement;
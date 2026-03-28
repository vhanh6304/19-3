import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Space, Button, Table, message, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;

const ChapterManagement = () => {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]); // Chứa danh sách tất cả môn học
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách chương
  const fetchChapterList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/chapter/pageable?page=1&limit=10');
      const remoteData = res.data || res;
      if (Array.isArray(remoteData)) {
        const formattedData = remoteData.map((item, index) => ({
          ...item,
          key: item.id || item._id,
          stt: index + 1,
          name: item.name,
          subjectName: item.subjectId?.name || 'N/A',
          subjectId: item.subjectId?._id || item.subjectId?.id,
          chapterNumber: item.chapterNumber
        }));
        setChapters(formattedData);
      }
    } catch (err) {
      message.error("Không thể tải danh sách chương!");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách tất cả môn học cho dropdown <Select>
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await axiosClient.get('/subject/all');
      const data = res.data || res;
      if (Array.isArray(data)) setSubjects(data);
    } catch (err) {
      console.error("Lỗi tải danh sách môn học", err);
    }
  }, []);

  useEffect(() => {
    fetchChapterList();
    fetchSubjects();
  }, [fetchChapterList, fetchSubjects]);

  // Xử lý Form Thêm/Sửa
  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      const payload = {
        ...values,
        chapterNumber: Number(values.chapterNumber) // Ép kiểu về số
      };
      try {
        if (editingRecord) {
          await axiosClient.put(`/chapter/${editingRecord.id || editingRecord.key}`, payload);
          message.success(`Đã cập nhật chương thành công!`);
        } else {
          await axiosClient.post('/chapter', payload);
          message.success(`Đã thêm mới chương thành công!`);
        }
        setIsModalOpen(false);
        fetchChapterList();
      } catch (err) {
        message.error("Có lỗi xảy ra khi lưu chương!");
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
    { title: 'Tên chương', dataIndex: 'name', key: 'name' },
    { title: 'Môn học', dataIndex: 'subjectName', key: 'subjectName' },
    { title: 'Chương số', dataIndex: 'chapterNumber', key: 'chapterNumber' },
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
                await axiosClient.delete(`/chapter/${record.id || record.key}`);
                message.success('Đã xóa chương thành công!');
                fetchChapterList();
              } catch (err) {
                message.error('Không thể xóa chương này!');
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
        <Title level={4} style={{ margin: 0 }}>Quản lý chương</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#303d6b' }} onClick={() => showModal()}>Thêm chương mới</Button>
        </Space>
      </div>
      <Table dataSource={chapters} columns={columns} loading={loading} pagination={{ pageSize: 10 }} bordered />

      <Modal title={editingRecord ? 'Chỉnh sửa chương' : 'Thêm mới chương'} open={isModalOpen} onOk={handleModalOk} onCancel={() => setIsModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" name="chapterForm">
          <Form.Item name="name" label="Tên chương" rules={[{ required: true, message: 'Vui lòng nhập tên chương!' }]}><Input placeholder="Nhập tên chương" /></Form.Item>
          <Form.Item name="subjectId" label="Thuộc môn học" rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}>
            <Select placeholder="Chọn môn học">
              {subjects.map(sub => (
                <Select.Option key={sub.id || sub._id} value={sub.id || sub._id}>{sub.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="chapterNumber" label="Chương số" rules={[{ required: true, message: 'Vui lòng nhập số chương!' }]}><Input type="number" placeholder="Nhập số thứ tự chương" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ChapterManagement;
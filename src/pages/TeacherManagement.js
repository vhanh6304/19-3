import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Tag, Typography, message, Modal, Form, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [form] = Form.useForm();

  const fetchTeacherList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/teacher/pageable?page=1&limit=10');
      const remoteData = res.data || res;

      if (Array.isArray(remoteData)) {
        const formattedData = remoteData.map((item, index) => ({
          key: item.id || item._id,
          stt: index + 1,
          name: item.fullName,
          email: item.email,
          department: item.department,
          identityCode: item.identityCode, 
          phoneNumber: item.phoneNumber,
        }));
        setTeachers(formattedData);
      }
    } catch (err) {
      message.error("Không thể tải danh sách giảng viên!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeacherList();
  }, [fetchTeacherList]);

  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record); 
    } else {
      form.resetFields(); 
    }
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Map lại trường dữ liệu từ form sang payload chuẩn backend
      const payload = {
        fullName: values.name,
        email: values.email,
        department: values.department,
        identityCode: values.identityCode,
        phoneNumber: values.phoneNumber,
      };

      // Nếu là tạo mới, gửi kèm theo cả mật khẩu khởi tạo
      if (!editingRecord && values.password) {
        payload.password = values.password;
      }

      if (editingRecord) {
        await axiosClient.put(`/teacher/${editingRecord.id || editingRecord.key}`, payload);
        message.success(`Đã cập nhật thông tin: ${values.name}`);
      } else {
        await axiosClient.post('/teacher', payload);
        message.success(`Đã thêm mới: ${values.name}`);
      }
      setIsModalOpen(false);
      fetchTeacherList(); // Gọi lại hàm fetch để làm mới dữ liệu bảng
    } catch (error) {
      if (error.name !== 'ValidationError') {
        message.error('Lưu thông tin thất bại, vui lòng thử lại!');
        console.error(error);
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Hàm hiển thị Modal Xem chi tiết
  const showViewModal = (record) => {
    setViewingRecord(record);
    setIsViewModalOpen(true);
  };

  const handleViewModalCancel = () => {
    setIsViewModalOpen(false);
    setViewingRecord(null);
  };

  const teacherColumns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Khoa/Bộ môn', dataIndex: 'department', key: 'department' },
    { title: 'Mã giảng viên', dataIndex: 'identityCode', key: 'identityCode' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <EyeOutlined 
            style={{ color: '#1890ff', cursor: 'pointer' }} 
            onClick={() => showViewModal(record)} 
          />
          <EditOutlined style={{ color: '#faad14', cursor: 'pointer' }} onClick={() => showModal(record)} />
          <DeleteOutlined 
            style={{ color: '#ff4d4f', cursor: 'pointer' }} 
            onClick={async () => {
              try {
                await axiosClient.delete(`/teacher/${record.id || record.key}`);
                message.success(`Đã xóa giảng viên ${record.name}`);
                fetchTeacherList(); // Tự động load lại bảng sau khi xoá
              } catch (err) {
                message.error('Không thể xóa giảng viên này!');
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
        <Title level={4} style={{ margin: 0 }}>Quản lý giảng viên</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#303d6b' }} onClick={() => showModal()}>Thêm mới</Button>
          <Button icon={<DownloadOutlined />}>Import danh sách</Button>
        </Space>
      </div>
      <div style={{ textAlign: 'right', marginBottom: 10 }}>
        <span>Tổng số: <Tag color="blue">{teachers.length}</Tag></span>
      </div>
      <Table dataSource={teachers} columns={teacherColumns} loading={loading} pagination={{ pageSize: 10 }} bordered />

      <Modal title={editingRecord ? 'Chỉnh sửa giảng viên' : 'Thêm mới giảng viên'} open={isModalOpen} onOk={handleModalOk} onCancel={handleModalCancel} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" name="teacherForm">
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}><Input placeholder="Nhập họ tên đầy đủ" /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}><Input placeholder="Ví dụ: example@ptit.edu.vn" /></Form.Item>
          <Form.Item name="department" label="Khoa/Bộ môn" rules={[{ required: true, message: 'Vui lòng nhập thông tin!' }]}><Input placeholder="Nhập Khoa hoặc Bộ môn" /></Form.Item>
          <Form.Item name="identityCode" label="Mã giảng viên" rules={[{ required: true, message: 'Vui lòng nhập mã định danh!' }]}><Input placeholder="Nhập mã định danh" /></Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại"><Input placeholder="Nhập số điện thoại" /></Form.Item>
          {!editingRecord && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu khởi tạo!' }]}><Input.Password placeholder="Nhập mật khẩu cho giảng viên" /></Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal Xem chi tiết giảng viên */}
      <Modal
        title="Thông tin chi tiết giảng viên"
        open={isViewModalOpen}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="close" onClick={handleViewModalCancel}>Đóng</Button>
        ]}
      >
        {viewingRecord && (
          <div style={{ fontSize: '15px', lineHeight: '2' }}>
            <p><strong>Họ tên:</strong> {viewingRecord.name}</p>
            <p><strong>Email:</strong> {viewingRecord.email}</p>
            <p><strong>Khoa/Bộ môn:</strong> {viewingRecord.department}</p>
            <p><strong>Mã giảng viên:</strong> {viewingRecord.identityCode}</p>
            <p><strong>Số điện thoại:</strong> {viewingRecord.phoneNumber || 'Trống'}</p>
          </div>
        )}
      </Modal>
    </>
  );
};
export default TeacherManagement;
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Modal,
  Form,
  Input,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title } = Typography;

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [form] = Form.useForm();

  const fetchStudentList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/student/pageable?page=1&limit=10");
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
        setStudents(formattedData);
      }
    } catch (err) {
      message.error("Không thể tải danh sách sinh viên!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentList();
  }, [fetchStudentList]);

  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingRecord) {
          setStudents(
            students.map((item) =>
              item.key === editingRecord.key ? { ...item, ...values } : item,
            ),
          );
          message.success(`Đã cập nhật thông tin: ${values.name}`);
        } else {
          const newRecord = {
            ...values,
            key: Date.now(),
            stt: students.length + 1,
          };
          setStudents([...students, newRecord]);
          message.success(`Đã thêm mới: ${values.name}`);
        }
        setIsModalOpen(false);
      })
      .catch((info) => console.log("Validate Failed:", info));
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

  const studentColumns = [
    { title: "STT", dataIndex: "stt", key: "stt", width: 60 },
    { title: "Họ tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Lớp hành chính", dataIndex: "department", key: "department" },
    { title: "Mã sinh viên", dataIndex: "identityCode", key: "identityCode" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <EyeOutlined
            style={{ color: "#1890ff", cursor: "pointer" }}
            onClick={() => showViewModal(record)}
          />
          <EditOutlined
            style={{ color: "#faad14", cursor: "pointer" }}
            onClick={() => showModal(record)}
          />
          <DeleteOutlined
            style={{ color: "#ff4d4f", cursor: "pointer" }}
            onClick={() => {
              setStudents(students.filter((item) => item.key !== record.key));
              message.success(`Đã xóa sinh viên ${record.name}`);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Quản lý sinh viên
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: "#303d6b" }}
            onClick={() => showModal()}
          >
            Thêm mới
          </Button>
          <Button icon={<DownloadOutlined />}>Import danh sách</Button>
        </Space>
      </div>
      <div style={{ textAlign: "right", marginBottom: 10 }}>
        <span>
          Tổng số: <Tag color="blue">{students.length}</Tag>
        </span>
      </div>
      <Table
        dataSource={students}
        columns={studentColumns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={editingRecord ? "Chỉnh sửa sinh viên" : "Thêm mới sinh viên"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" name="studentForm">
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nhập họ tên đầy đủ" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Vui lòng nhập email hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Ví dụ: example@ptit.edu.vn" />
          </Form.Item>
          <Form.Item
            name="department"
            label="Lớp hành chính"
            rules={[{ required: true, message: "Vui lòng nhập thông tin!" }]}
          >
            <Input placeholder="Nhập lớp hành chính" />
          </Form.Item>
          <Form.Item
            name="identityCode"
            label="Mã sinh viên"
            rules={[{ required: true, message: "Vui lòng nhập mã định danh!" }]}
          >
            <Input placeholder="Nhập mã định danh" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xem chi tiết sinh viên */}
      <Modal
        title="Thông tin chi tiết sinh viên"
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
            <p><strong>Lớp hành chính:</strong> {viewingRecord.department}</p>
            <p><strong>Mã sinh viên:</strong> {viewingRecord.identityCode}</p>
            <p><strong>Số điện thoại:</strong> {viewingRecord.phoneNumber || 'Trống'}</p>
          </div>
        )}
      </Modal>
    </>
  );
};
export default StudentManagement;

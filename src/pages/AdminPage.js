import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Menu, Table, theme, Button, Space, Tag, Typography, message, Modal, Form, Input } from 'antd';
import { 
  UserOutlined, LogoutOutlined, TeamOutlined, 
  EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, DownloadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 1. Hàm lấy danh sách sinh viên
  const fetchStudentList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/student/pageable?page=1&limit=10'); 
      const remoteData = res.data || res; 

      if (Array.isArray(remoteData)) {
        const formattedData = remoteData.map((item, index) => ({
          key: item.id || item._id,
          stt: index + 1,
          name: item.fullName, 
          email: item.email,
          department: item.department,
          identityCode: item.identityCode,
          phoneNumber: item.phoneNumber 
        }));
        setStudents(formattedData);
      }
    } catch (err) {
      message.error("Không thể tải danh sách sinh viên!");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Hàm lấy danh sách giảng viên
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
          identityCode: item.identityCode, // Giả sử giảng viên cũng có mã định danh
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

  // Hàm hiển thị Modal (có truyền record nếu là chỉnh sửa)
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record); // Đổ dữ liệu cũ vào form nếu đang Edit
    } else {
      form.resetFields(); // Làm trống form nếu Thêm mới
    }
    setIsModalOpen(true);
  };

  // Hàm xử lý xác nhận Form
  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingRecord) {
        // Logic Cập nhật (Hiển thị tạm trên giao diện state)
        if (activeTab === 'student') {
          setStudents(students.map(item => item.key === editingRecord.key ? { ...item, ...values } : item));
        } else {
          setTeachers(teachers.map(item => item.key === editingRecord.key ? { ...item, ...values } : item));
        }
        message.success(`Đã cập nhật thông tin: ${values.name}`);
      } else {
        // Logic Thêm mới (Hiển thị tạm trên giao diện state)
        const newRecord = { ...values, key: Date.now(), stt: (activeTab === 'student' ? students.length : teachers.length) + 1 };
        if (activeTab === 'student') setStudents([...students, newRecord]);
        else setTeachers([...teachers, newRecord]);
        message.success(`Đã thêm mới: ${values.name}`);
      }
      setIsModalOpen(false);
    }).catch(info => console.log('Validate Failed:', info));
  };

  // Hàm xử lý hủy/đóng Modal
  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Khởi tạo trang: Lấy thông tin user và DSSV
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      
      try {
        const userRes = await axiosClient.get('/user/info/me');
        setUser(userRes.data || userRes);
        fetchStudentList(); // Mặc định load sinh viên trước
      } catch (err) {
        if(err.response?.status === 401) navigate('/login');
      }
    };
    init();
  }, [navigate, fetchStudentList]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Định nghĩa cột cho Sinh viên
  const studentColumns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Lớp hành chính', dataIndex: 'department', key: 'department' },
    { title: 'Mã sinh viên', dataIndex: 'identityCode', key: 'identityCode' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <EyeOutlined
           style={{ color: '#1890ff', cursor: 'pointer' }}
           onClick={() => {
           }}
          />
          <EditOutlined style={{ color: '#faad14', cursor: 'pointer' }} onClick={() => showModal(record)} />
          <DeleteOutlined 
            style={{ color: '#ff4d4f', cursor: 'pointer' }} 
            onClick={() => {
              setStudents(students.filter(item => item.key !== record.key));
              message.success(`Đã xóa sinh viên ${record.name}`);
            }}
          />
        </Space>
      ),
    },
  ];

  // Định nghĩa cột cho Giảng viên
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
          <EditOutlined 
            style={{ color: '#faad14', cursor: 'pointer' }}
            onClick={() => showModal(record)}
          />
          <DeleteOutlined 
            style={{ color: '#ff4d4f', cursor: 'pointer' }} 
            onClick={() => {
              setTeachers(teachers.filter(item => item.key !== record.key));
              message.success(`Đã xóa giảng viên ${record.name}`);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#303d6b', padding: '0 20px' }}>
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>VIRTUAL ELECTRONICS LABS</div>
        <div style={{ color: 'white' }}>
          <UserOutlined style={{ marginRight: 8 }} />
          {user?.fullName || user?.email}
          <Button type="link" danger icon={<LogoutOutlined />} onClick={handleLogout} style={{ marginLeft: 15 }}>Thoát</Button>
        </div>
      </Header>

      <Layout>
        <Sider width={250} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={(e) => {
              setActiveTab(e.key);
              if (e.key === 'teacher') fetchTeacherList();
              else if (e.key === 'student') fetchStudentList();
            }}
            items={[
              { key: 'student', icon: <TeamOutlined />, label: 'Quản lý sinh viên' },
              { key: 'teacher', icon: <UserOutlined />, label: 'Quản lý giảng viên' },
            ]}
          />
        </Sider>

        <Content style={{ padding: '24px', background: '#f5f7f9' }}>
          <div style={{ background: colorBgContainer, padding: 24, borderRadius: borderRadiusLG, minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Title level={4} style={{ margin: 0 }}>
                {activeTab === 'student' ? 'Quản lý sinh viên' : 'Quản lý giảng viên'}
              </Title>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} style={{ background: '#303d6b' }} onClick={() => showModal()}>Thêm mới</Button>
                <Button icon={<DownloadOutlined />}>Import danh sách</Button>
              </Space>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 10 }}>
              <span>Tổng số: <Tag color="blue">{activeTab === 'student' ? students.length : teachers.length}</Tag></span>
            </div>

            <Table 
              dataSource={activeTab === 'student' ? students : teachers} 
              columns={activeTab === 'student' ? studentColumns : teacherColumns} 
              loading={loading}
              pagination={{ pageSize: 10 }}
              bordered
            />

            {/* Modal Form */}
            <Modal
              title={editingRecord ? (activeTab === 'student' ? 'Chỉnh sửa sinh viên' : 'Chỉnh sửa giảng viên') : (activeTab === 'student' ? 'Thêm mới sinh viên' : 'Thêm mới giảng viên')}
              open={isModalOpen}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              okText="Lưu"
              cancelText="Hủy"
            >
              <Form form={form} layout="vertical" name="adminForm">
                <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                  <Input placeholder="Nhập họ tên đầy đủ" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                  <Input placeholder="Ví dụ: example@ptit.edu.vn" />
                </Form.Item>
                <Form.Item name="department" label={activeTab === 'student' ? 'Lớp hành chính' : 'Khoa/Bộ môn'} rules={[{ required: true, message: 'Vui lòng nhập thông tin!' }]}>
                  <Input placeholder="Nhập lớp hành chính hoặc Khoa" />
                </Form.Item>
                <Form.Item name="identityCode" label={activeTab === 'student' ? 'Mã sinh viên' : 'Mã giảng viên'} rules={[{ required: true, message: 'Vui lòng nhập mã định danh!' }]}>
                  <Input placeholder="Nhập mã định danh" />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Số điện thoại">
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
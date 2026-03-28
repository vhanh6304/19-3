import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import { 
  UserOutlined, LogoutOutlined, TeamOutlined, BookOutlined, FolderOpenOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import StudentManagement from './StudentManagement';
import TeacherManagement from './TeacherManagement';
import SubjectManagement from './SubjectManagement';
import ChapterManagement from './ChapterManagement';

const { Header, Content, Sider } = Layout;

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('student');
  const navigate = useNavigate();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  // Khởi tạo trang: Lấy thông tin user và DSSV
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      
      try {
        const userRes = await axiosClient.get('/user/info/me');
        setUser(userRes.data || userRes);
      } catch (err) {
        if(err.response?.status === 401) navigate('/login');
      }
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
            }}
            items={[
              { key: 'student', icon: <TeamOutlined />, label: 'Quản lý sinh viên' },
              { key: 'teacher', icon: <UserOutlined />, label: 'Quản lý giảng viên' },
              { key: 'subject', icon: <BookOutlined />, label: 'Quản lý môn học' },
              { key: 'chapter', icon: <FolderOpenOutlined />, label: 'Quản lý chương' },
            ]}
          />
        </Sider>

        <Content style={{ padding: '24px', background: '#f5f7f9' }}>
          <div style={{ background: colorBgContainer, padding: 24, borderRadius: borderRadiusLG, minHeight: '80vh' }}>
            {activeTab === 'student' && <StudentManagement />}
            {activeTab === 'teacher' && <TeacherManagement />}
            {activeTab === 'subject' && <SubjectManagement />}
            {activeTab === 'chapter' && <ChapterManagement />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
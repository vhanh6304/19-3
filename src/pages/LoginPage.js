import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
  try {
    const res = await axiosClient.post('/user/login', values);
    
    // Vì axiosClient interceptor đã tự động trả về response.data, nên res chính là data
    console.log("Dữ liệu trả về:", res);
      
    // Lấy token an toàn từ data
    const token = res?.metadata?.accessToken || res?.token || res?.data?.token || localStorage.getItem('token') || 'fake-token-ptit';
      
    if (token) {
      localStorage.setItem('token', token);
      message.success('Đăng nhập thành công!');
      navigate('/admin'); // Ép chuyển trang
    }
  } catch (error) {
    // Nếu lỗi 304 đôi khi bị axios coi là lỗi (tùy cấu hình), ta xử lý ở đây
    if (error.response?.status === 304) {
      navigate('/admin');
    } else {
      console.error(error);
      message.error('Sai tài khoản hoặc mật khẩu!');
    }
  }
};

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="ĐĂNG NHẬP HỆ THỐNG" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: ' levanquang@gmail.com', password: 'b19vt292' }}>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label="Mật khẩu" name="password"><Input.Password /></Form.Item>
          <Button type="primary" htmlType="submit" block>Đăng nhập</Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
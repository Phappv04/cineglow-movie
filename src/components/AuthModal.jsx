import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef(null);

  // Reset fields when modal toggled
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setFullName('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, mode]);

  // Dynamically load Google GSI script and render button
  useEffect(() => {
    if (!isOpen) return;

    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      try {
        /* global google */
        if (!window.google) return;
        
        window.google.accounts.id.initialize({
          // Replace this with your actual Google Client ID from Google Cloud Console
          client_id: '999999999999-mockclientid.apps.googleusercontent.com', 
          callback: handleGoogleCredentialResponse,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 320,
          });
        }
      } catch (err) {
        console.error('Google Sign-In initialization failed:', err);
      }
    };

    loadGoogleScript();
  }, [isOpen, mode]);

  const handleGoogleCredentialResponse = async (response) => {
    setSubmitting(true);
    setError('');
    
    try {
      // Decode JWT credential token from Google payload
      const payloadBase64 = response.credential.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64));
      
      const email = payloadDecoded.email;
      const name = payloadDecoded.name || email.split('@')[0];
      const googleId = payloadDecoded.sub;

      const result = await loginWithGoogle(email, name, googleId);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Đăng nhập Google thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi giải mã Google Token.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!email || !password || (mode === 'register' && !fullName)) {
      setError('Vui lòng điền đầy đủ các thông tin cần thiết.');
      setSubmitting(false);
      return;
    }

    if (mode === 'login') {
      const result = await login(email, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Sai tên đăng nhập hoặc mật khẩu.');
      }
    } else {
      const result = await register(email, password, fullName);
      if (result.success) {
        setSuccess('Đăng ký tài khoản thành công! Hãy đăng nhập.');
        setMode('login');
      } else {
        setError(result.error || 'Email đã được đăng ký.');
      }
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay">
      <div className="auth-modal glass-container">
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className="auth-header">
          <h2 className="glow-text text-2xl font-bold mb-1">
            {mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? 'Chào mừng bạn quay lại với CineGlow' : 'Tham gia cộng đồng CineGlow ngay hôm nay'}
          </p>
        </div>

        {/* Message Notifications */}
        {error && <div className="auth-alert error-alert">{error}</div>}
        {success && <div className="auth-alert success-alert">{success}</div>}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="auth-form mt-4">
          {mode === 'register' && (
            <div className="form-group">
              <label>Họ và Tên</label>
              <div className="input-container">
                <User className="input-icon" size={16} />
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Địa chỉ Email</label>
            <div className="input-container">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mật Khẩu</label>
            <div className="input-container">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn glow-button mt-4" disabled={submitting}>
            {submitting ? 'Vui lòng chờ...' : mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        {/* Google OAuth Login Button Container */}
        <div className="auth-divider mt-4 mb-4">
          <span>Hoặc đăng nhập nhanh bằng</span>
        </div>
        
        <div className="google-btn-wrapper">
          <div ref={googleBtnRef} id="google-signin-btn"></div>
        </div>

        {/* Footer Toggle Mode */}
        <div className="auth-footer mt-6">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <span className="auth-toggle-link" onClick={() => setMode('register')}>
                Đăng ký ngay
              </span>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <span className="auth-toggle-link" onClick={() => setMode('login')}>
                Đăng nhập tại đây
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

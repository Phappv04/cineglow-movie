import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, Calendar, Key, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = ({ setRoute }) => {
  const { user, fetchWithAuth, updateUserProfile } = useAuth();
  
  // States
  const [profileDetails, setProfileDetails] = useState(null);
  const [fullName, setFullName] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetchWithAuth('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileDetails(data);
          setFullName(data.fullName || '');
        } else {
          const errData = await response.json();
          setError(errData.error || 'Không thể tải thông tin cá nhân.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 1. Validation for Name
    const nameClean = fullName.trim();
    if (nameClean.length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    if (!nameRegex.test(nameClean)) {
      setError('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
      return;
    }
    if (!nameClean.includes(' ')) {
      setError('Họ và tên phải bao gồm cả Họ và Tên (ví dụ: Nguyễn Văn A).');
      return;
    }

    // 2. Validation for Password
    if (showPasswordFields) {
      if (profileDetails && !profileDetails.googleId) {
        if (!oldPassword) {
          setError('Vui lòng nhập mật khẩu hiện tại.');
          return;
        }
      }
      if (!newPassword) {
        setError('Vui lòng nhập mật khẩu mới.');
        return;
      }
      if (newPassword.length < 8) {
        setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
        return;
      }
      if (!/[a-z]/.test(newPassword)) {
        setError('Mật khẩu mới phải chứa ít nhất 1 chữ cái thường (a-z).');
        return;
      }
      if (!/[A-Z]/.test(newPassword)) {
        setError('Mật khẩu mới phải chứa ít nhất 1 chữ cái in hoa (A-Z).');
        return;
      }
      if (!/[0-9]/.test(newPassword)) {
        setError('Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9).');
        return;
      }
      if (!/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)) {
        setError('Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp.');
        return;
      }
    }

    setSaving(true);
    try {
      const body = { fullName: nameClean };
      if (showPasswordFields) {
        body.oldPassword = oldPassword;
        body.newPassword = newPassword;
      }

      const response = await fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Cập nhật thông tin cá nhân thành công!');
        updateUserProfile({ fullName: nameClean }); // Sync with Navbar
        
        // Reset password fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordFields(false);
        
        // Update local state
        setProfileDetails(prev => ({ ...prev, fullName: nameClean }));
      } else {
        setError(data.error || 'Cập nhật thất bại.');
      }
    } catch (err) {
      setError('Lỗi máy chủ, không thể cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="watchlist-container" style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div className="loader"></div>
      </div>
    );
  }

  const isGoogleUser = profileDetails?.googleId ? true : false;
  const avatarLetter = (fullName || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="watchlist-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="watchlist-header" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <User size={30} color="var(--accent-purple)" />
        <h1 className="search-page-title" style={{ margin: 0 }}>Hồ Sơ Cá Nhân</h1>
      </div>

      {error && (
        <div className="auth-alert error-alert" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-alert success-alert" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Left Column - User Info Card */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
          
          {/* Avatar circle */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            boxShadow: '0 0 20px var(--accent-purple-glow)'
          }}>
            {avatarLetter}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {profileDetails?.fullName}
          </h2>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            {profileDetails?.email}
          </p>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={16} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vai trò</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profileDetails?.role === 'ADMIN' ? 'Quản trị viên (ADMIN)' : 'Thành viên'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="var(--accent-purple)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ngày gia nhập</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatJoinDate(profileDetails?.createdAt) || 'Đang cập nhật...'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={16} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Loại tài khoản</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isGoogleUser ? 'Đăng nhập qua Google' : 'Tài khoản thường (Email/Mật khẩu)'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-primary)' }}>Chỉnh sửa thông tin</h3>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email input (Disabled) */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Địa chỉ Email (Không thể thay đổi)
              </label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', opacity: 0.7, border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px 12px' }}>
                <Mail size={16} style={{ marginRight: '10px', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  value={profileDetails?.email || ''} 
                  disabled 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', width: '100%', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Họ và Tên
              </label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px 12px', transition: 'border-color 0.2s' }}>
                <User size={16} style={{ marginRight: '10px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập Họ và Tên đầy đủ"
                  required
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Password Change Toggle */}
            {!isGoogleUser && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={showPasswordFields}
                    onChange={(e) => {
                      setShowPasswordFields(e.target.checked);
                      setError('');
                    }}
                    style={{ accentColor: 'var(--accent-purple)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Thay đổi mật khẩu tài khoản</span>
                </label>
              </div>
            )}

            {/* Password Fields */}
            {showPasswordFields && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderLeft: '2px solid var(--accent-purple)', paddingLeft: '15px', marginTop: '10px' }}>
                
                {/* Old Password */}
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Mật khẩu hiện tại
                  </label>
                  <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Lock size={14} style={{ marginRight: '10px', color: 'var(--text-secondary)' }} />
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Mật khẩu hiện tại"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Mật khẩu mới
                  </label>
                  <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Lock size={14} style={{ marginRight: '10px', color: 'var(--text-secondary)' }} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Lock size={14} style={{ marginRight: '10px', color: 'var(--text-secondary)' }} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
              style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {saving ? <div className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Lưu Thay Đổi'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;

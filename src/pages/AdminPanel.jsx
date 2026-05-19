import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Film, Plus, Trash2, Edit2, Save, X, ArrowLeft, ExternalLink } from 'lucide-react';

const AdminPanel = () => {
  const { user, fetchWithAuth } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [originName, setOriginName] = useState('');
  const [content, setContent] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [quality, setQuality] = useState('FHD');
  const [lang, setLang] = useState('Vietsub');
  const [videoUrl, setVideoUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    loadMovies();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingId && name) {
      const generated = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accent marks
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  }, [name, editingId]);

  const loadMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('http://localhost:8080/api/admin/movies');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Không thể tải danh sách phim từ server.');
      }
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setOriginName('');
    setContent('');
    setPosterUrl('');
    setYear(new Date().getFullYear());
    setQuality('FHD');
    setLang('Vietsub');
    setVideoUrl('');
    setEmbedUrl('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Vui lòng nhập tên bộ phim.');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      originName: originName.trim(),
      content: content.trim(),
      posterUrl: posterUrl.trim(),
      thumbUrl: posterUrl.trim(), // Use same URL for thumbnail for simplicity
      year: parseInt(year) || new Date().getFullYear(),
      quality,
      lang,
      videoUrl: videoUrl.trim(),
      embedUrl: embedUrl.trim()
    };

    try {
      let url = 'http://localhost:8080/api/admin/movies';
      let method = 'POST';

      if (editingId) {
        url = `http://localhost:8080/api/admin/movies/${editingId}`;
        method = 'PUT';
      }

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi lưu thông tin phim.');
      }

      setSuccess(editingId ? 'Cập nhật phim thành công!' : 'Thêm phim mới thành công!');
      resetForm();
      loadMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (movie) => {
    setEditingId(movie.id);
    setName(movie.name || '');
    setSlug(movie.slug || '');
    setOriginName(movie.originName || '');
    setContent(movie.content || '');
    setPosterUrl(movie.posterUrl || '');
    setYear(movie.year || new Date().getFullYear());
    setQuality(movie.quality || 'FHD');
    setLang(movie.lang || 'Vietsub');
    setVideoUrl(movie.videoUrl || '');
    setEmbedUrl(movie.embedUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, movieName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phim "${movieName}"?`)) {
      setError('');
      setSuccess('');
      try {
        const res = await fetchWithAuth(`http://localhost:8080/api/admin/movies/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Xóa phim thất bại.');
        }
        setSuccess('Đã xóa phim thành công!');
        loadMovies();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '100px 5%', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--accent-pink)' }}>Cảnh Báo: Truy Cập Bị Từ Chối</h2>
        <p>Bạn không có quyền hạn truy cập vào khu vực quản trị.</p>
        <button className="btn btn-primary mt-4" onClick={() => window.history.pushState(null, '', '/')}>
          Quay lại Trang Chủ
        </button>
      </div>
    );
  }

  return (
    <div className="watchlist-container" style={{ padding: '40px 5%', minHeight: '90vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Film size={32} color="var(--accent-cyan)" />
          <div>
            <h1 className="search-page-title" style={{ margin: 0, fontSize: '1.8rem' }}>Quản Trị Kho Phim</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Thêm và sửa đổi các phim tự tải lên hệ thống</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => window.history.pushState(null, '', '/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Quay về Trang chủ
        </button>
      </div>

      {/* Grid: Form + List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="admin-grid">
        
        {/* 1. Form Section */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: editingId ? 'var(--accent-pink)' : 'var(--accent-cyan)' }}>
            {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
            {editingId ? `Đang chỉnh sửa: ${name}` : 'Thêm phim tự tải mới'}
          </h2>

          {error && <div className="auth-alert error-alert" style={{ marginBottom: '15px' }}>{error}</div>}
          {success && <div className="auth-alert success-alert" style={{ marginBottom: '15px' }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Tên phim *</label>
              <input
                type="text"
                placeholder="Ví dụ: Phim Lịch Sử Việt Nam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div className="form-group">
              <label>Đường dẫn tĩnh (Slug) *</label>
              <input
                type="text"
                placeholder="phim-lich-su-viet-nam"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div className="form-group">
              <label>Tên gốc (Tiếng Anh/Phụ)</label>
              <input
                type="text"
                placeholder="Vietnamese History Movie"
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Năm phát hành</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Độ phân giải</label>
              <select value={quality} onChange={(e) => setQuality(e.target.value)} style={{ width: '100%' }}>
                <option value="FHD">Full HD (FHD)</option>
                <option value="4K">Ultra HD (4K)</option>
                <option value="HD">HD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ngôn ngữ dịch</label>
              <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ width: '100%' }}>
                <option value="Vietsub">Vietsub (Phụ đề)</option>
                <option value="Thuyết Minh">Thuyết Minh</option>
                <option value="Lồng Tiếng">Lồng Tiếng</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Link ảnh Poster / Banner (URL)</label>
              <input
                type="url"
                placeholder="https://imgur.com/example.jpg"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Link phát Video trực tiếp (M3U8 / HLS Stream URL - Khuyên Dùng)</label>
              <input
                type="url"
                placeholder="https://example.com/stream/index.m3u8"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Link trình nhúng Player (Iframe Embed URL - Dự Phòng)</label>
              <input
                type="url"
                placeholder="https://ok.ru/videoembed/123456789"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mô tả nội dung phim</label>
              <textarea
                placeholder="Tóm tắt sơ lược cốt truyện của bộ phim..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} /> Hủy chỉnh sửa
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {editingId ? 'Cập nhật thông tin' : 'Đăng tải phim'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. List Section */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
            Danh sách phim tự up hiện có ({movies.length})
          </h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="loader"></div>
            </div>
          ) : movies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              Chưa có phim tự tải nào được tạo. Hãy sử dụng form phía trên để đăng bộ phim đầu tiên!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 8px' }}>Tên Phim</th>
                    <th style={{ padding: '12px 8px' }}>Năm</th>
                    <th style={{ padding: '12px 8px' }}>Độ phân giải</th>
                    <th style={{ padding: '12px 8px' }}>Ngôn ngữ</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', hover: { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                        <div>{movie.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{movie.slug}</div>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{movie.year}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className="badge-top badge-quality" style={{ position: 'static' }}>{movie.quality}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className="badge-top badge-lang" style={{ position: 'static' }}>{movie.lang}</span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => window.history.pushState(null, '', `/detail/${movie.slug}`)}
                            className="btn-clear"
                            title="Xem trang phát"
                            style={{ color: 'var(--accent-cyan)', padding: '6px', cursor: 'pointer' }}
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(movie)}
                            className="btn-clear"
                            title="Sửa thông tin"
                            style={{ color: 'var(--text-primary)', padding: '6px', cursor: 'pointer' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(movie.id, movie.name)}
                            className="btn-clear"
                            title="Xóa phim"
                            style={{ color: 'var(--accent-pink)', padding: '6px', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;

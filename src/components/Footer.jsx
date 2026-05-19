import React from 'react';
import { Film } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="navbar-brand footer-logo">
          <Film size={22} color="var(--accent-purple)" />
          <span className="brand-text">CineGlow</span>
        </div>
        <p className="footer-text">
          Nền tảng xem phim trực tuyến hiện đại với tốc độ truyền tải cực nhanh. 
          Dữ liệu phim được tự động đồng bộ từ các nguồn công khai trực tuyến phục vụ cho mục đích học tập và nghiên cứu.
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <a href="#/" style={{ hover: { color: 'white' } }}>Trang chủ</a>
          <span>•</span>
          <a href="#/list/phim-le">Phim Lẻ</a>
          <span>•</span>
          <a href="#/list/phim-bo">Phim Bộ</a>
          <span>•</span>
          <a href="#/watchlist">Danh sách yêu thích</a>
        </div>
        <p className="footer-copyright">
          © {new Date().getFullYear()} CineGlow. Được thiết kế với đam mê và công nghệ đỉnh cao.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

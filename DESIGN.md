# Design Specification: Shift & Salary Tracker

> Phong cách: **Morphic Light Minimal** — Không có dấu hiệu của AI, phông sáng, icon basic màu đơn giản, bố cục thoáng đãng và không có thông tin nhiễu.

---

## 1. Triết lý thiết kế (Design Philosophy)
- **Nền sáng tinh tế (Airy Ambient Canvas):** Nền sáng tự nhiên (`#fbfbfe`), điểm xuyết ánh sáng pastel mờ nhạt cực nhẹ ở phía trên (`rgba(219, 234, 254, 0.5)` ngả xanh phấn và `rgba(254, 226, 226, 0.45)` ngả hồng đào), tạo chiều sâu êm dịu, không chói mắt.
- **Biểu tượng hình tròn Graphite (Morphic Icon Aesthetics):**
  - Lấy cảm hứng từ phong cách tối giản của Morphicons: khối tròn than chì `#18181b` kết hợp biểu tượng vector màu trắng `#ffffff` độ tương phản tuyệt đối.
  - Các icon đường nét cơ bản (basic lines), kích thước chuẩn 16–18px, nét vẽ 2px đồng nhất.
- **Bố cục không nhiễu (Zero Visual Noise):**
  - Không nhồi nhét khung hộp (tránh hoàn toàn bẫy thẻ lồng thẻ của AI).
  - Thanh sổ cái tài chính tuần tích hợp gọn trong 1 dải tinh tế, phân tách bằng vạch hairline mỏng `rgba(15, 23, 42, 0.08)`.
  - Khoảng thở rộng rãi (generous whitespace), các nút bấm dạng con nhộng (pill buttons).

---

## 2. Hệ thống màu sắc (Color Tokens)
```css
--bg-app: #f8fafc;              /* Nền chính sáng mát */
--bg-card: #ffffff;             /* Thẻ bề mặt trắng tinh khiết */
--bg-subtle: #f1f5f9;           /* Nền phụ, ô nhập liệu */
--bg-dark: #18181b;             /* Than chì đậm cho nút chính & icon tròn */

--border-light: rgba(15, 23, 42, 0.08);

--text-main: #0f172a;           /* Chữ chính: Đen phiến thạch (Slate 900) */
--text-muted: #64748b;          /* Chữ phụ: Xám trung tính (Slate 500) */
--text-dim: #94a3b8;            /* Chữ chú thích nhỏ */

--accent-emerald: #059669;      /* Trạng thái hoạt động, tiền tệ */
--accent-rose: #e11d48;         /* Kết thúc ca, Xóa */
```

---

## 3. Typography
- **Tiêu đề & Nhãn:** `Plus Jakarta Sans`, sans-serif (nét chữ hiện đại, thanh thoát, đĩnh đạc).
- **Số liệu & Giờ giấc:** `JetBrains Mono` với thuộc tính `font-variant-numeric: tabular-nums` (các con số luôn thẳng hàng thẳng cột).

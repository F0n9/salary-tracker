# Design Specification: Shift & Salary Tracker

> Tuân thủ các nguyên tắc thiết kế **Impeccable Design System (pbakaus/impeccable)**, chế độ **Operate Mode**, loại bỏ hoàn toàn các lỗi thị giác "AI Slop".

---

## 1. Anti-Pattern Refusals (Quy tắc cấm kỵ tuyệt đối)
- ❌ **Không dùng gradient text:** Tiêu đề phải là màu đặc tương phản cao (`#F8FAFC`), nhấn mạnh qua độ đậm và kích thước, không dùng gradient màu tím/xanh lê thê.
- ❌ **Không dùng quầng sáng nhòe (zero-offset glow/halo):** Không dùng `filter: blur()` hay box-shadow hào quang neon. Độ sâu thể hiện qua viền mảnh 1px (`rgba(255,255,255,0.07)`) và bóng đổ tự nhiên có độ lệch trục Y (`0 8px 24px -4px rgba(0,0,0,0.4)`).
- ❌ **Không lồng thẻ trong thẻ (nested card-in-card):** Phân tách thông tin bằng khoảng trắng (whitespace) và đường kẻ phân cách (hairline dividers), không đóng khung mọi thứ trong các hộp bo góc dày đặc.
- ❌ **Không dùng icon hình vuông bo góc vô nghĩa trên mọi tiêu đề:** Chỉ dùng icon khi thể hiện hành động cụ thể, nét vẽ đồng nhất 1.75px – 2px.
- ❌ **Không dùng màu đen tuyệt đối (`#000000`):** Sử dụng tông nền Deep Slate ngả xanh than (`#0B0F17`), bảo vệ mắt khi xem trong bóng tối.
- ❌ **Không dùng chữ xám mờ thiếu tương phản:** Toàn bộ chữ phụ đạt chuẩn WCAG AAA (> 4.5:1), nhuộm nhẹ ánh xanh (`#94A3B8`).

---

## 2. Typography System
- **Display & UI Headings:** `Plus Jakarta Sans`, sans-serif (hình khối chữ chuẩn mực, hiện đại, có cá tính riêng thay vì Inter mặc định).
- **Numbers & Financial Data:** `JetBrains Mono` với thuộc tính `font-variant-numeric: tabular-nums` (các con số thẳng cột hàng dọc, không xô lệch khi số liệu cập nhật).
- **Scale:**
  - H1: `1.25rem` (20px), weight 700, tracking -0.02em.
  - KPI Hero Value: `1.85rem` (29.6px), weight 700.
  - Section Headings: `1.05rem` (16.8px), weight 600.
  - Body / Data: `0.875rem` (14px), line-height 1.5.
  - Meta / Label: `0.75rem` (12px), weight 500, tracking +0.02em.

---

## 3. Color Tokens
```css
--bg-app: #0b0f17;          /* Nền chính, ngả than sâu */
--bg-surface: #121824;      /* Bề mặt thành phần */
--bg-surface-hover: #182030;/* Hover */
--bg-elevated: #1e293b;     /* Modal / Popover */
--bg-input: #080c14;        /* Nền ô nhập liệu */

--border-subtle: rgba(255, 255, 255, 0.08);
--border-strong: rgba(255, 255, 255, 0.16);
--border-focus: #10b981;

--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-tertiary: #64748b;

--accent-emerald: #10b981;  /* Điểm nhấn thu nhập chính */
--accent-emerald-light: #34d399;
--accent-rose: #f43f5e;     /* Xóa / Hủy */
--accent-amber: #f59e0b;    /* Chú thích */
```

---

## 4. Crafted Browser Surfaces
- `::selection`: Nền `rgba(16, 185, 129, 0.25)`, chữ `#ffffff`.
- `caret-color`: `#10b981`.
- Custom Scrollbar: 4px, góc bo tròn, màu `#1e293b`.
- Focus Rings: `outline: 2px solid #10b981; outline-offset: 2px;`

---
name: Salary Tracker
description: Offline-first personal shift and salary tracking progressive web application
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-subtle: "rgba(37, 99, 235, 0.08)"
  primary-border: "rgba(37, 99, 235, 0.25)"
  primary-dark: "#3b82f6"
  money: "#047857"
  money-dark: "#34d399"
  danger: "#ef4444"
  danger-hover: "#dc2626"
  danger-subtle: "rgba(239, 68, 68, 0.08)"
  danger-border: "rgba(239, 68, 68, 0.25)"
  bg-app: "#f8f9fa"
  bg-app-dark: "#0a0b0e"
  bg-card: "#ffffff"
  bg-card-dark: "#121319"
  text-main: "#0f172a"
  text-main-dark: "#f8fafc"
  text-muted: "#475569"
  text-muted-dark: "#94a3b8"
  border-subtle: "#e5e7eb"
  border-subtle-dark: "rgba(255, 255, 255, 0.07)"
  border-default: "#d1d5db"
  border-default-dark: "rgba(255, 255, 255, 0.12)"
typography:
  display:
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  micro:
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.775rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Monaco, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.015em"
rounded:
  2px: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  10px: "10px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-morphic:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    size: "36px"
  card-base:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System

## Overview

Salary Tracker là công cụ chấm công và quản lý thu nhập cá nhân hoạt động theo tiêu chuẩn **Mode: Operate**. Thiết kế ưu tiên tối đa tính rõ ràng, độ chính xác đến từng phút và từng đồng, thao tác ghi ca dưới 5 giây, bảo vệ mắt khi làm việc ca đêm và hoàn toàn không phụ thuộc vào kết nối mạng.

Triết lý cốt lõi:
- **Tối giản & Đậm chất công cụ**: Không trang trí rườm rà, loại bỏ gradient màu mè trên văn bản, sử dụng viền tinh tế 1px và phân tầng độ cao bằng bóng mờ mềm.
- **Số liệu chuẩn mực**: Mọi giá trị tiền tệ và thời gian luôn định dạng bằng font số học cố định JetBrains Mono với `tabular-nums` để luôn gióng thẳng hàng.
- **Không thanh cuộn**: Tuyệt đối ẩn toàn bộ thanh cuộn scrollbar trên tất cả các bề mặt ứng dụng, tạo cảm giác như một ứng dụng gốc (Native App).

## Colors

Hệ màu tuân thủ nghiêm ngặt tiêu chuẩn tương phản WCAG AA ($\ge 4.5:1$ cho văn bản thường, $\ge 3:1$ cho số liệu lớn).

### Palette chính
- **Primary (Xanh dương Sapphire)**: `#2563eb` (Light), `#3b82f6` (Dark). Thể hiện sự chuyên nghiệp, tin cậy. Dùng cho nút hành động chính, tab đang chọn.
- **Money (Xanh ngọc lục bảo tiền tệ)**: `#047857` (Light - tương phản 4.8:1), `#34d399` (Dark - tương phản > 10:1). Đồng bộ duy nhất cho toàn bộ số liệu thu nhập, tiền ca làm, tổng tuần, tổng tháng.
- **Danger (Đỏ cảnh báo)**: `#ef4444` (Light), `#fca5a5` (Dark). Dùng cho thao tác hủy, xóa ca, xóa tuần.
- **Neutral Background**:
  - Light Mode: `#f8f9fa` (Nền app), `#ffffff` (Nền thẻ card/hộp thoại).
  - Dark Mode: `#0a0b0e` (Nền app OLED siêu tiết kiệm pin), `#121319` (Nền thẻ card).
- **Text & Borders**:
  - Text Main: `#0f172a` (Light) / `#f8fafc` (Dark).
  - Text Muted: `#475569` (Light) / `#94a3b8` (Dark).
  - Border: `1px solid var(--border-subtle)`.

## Typography

Sự kết hợp giữa 2 họ font:
- **Be Vietnam Pro**: Font chữ văn bản tiếng Việt hiện đại, dấu thanh chuẩn mực, rõ ràng ở mọi kích thước màn hình điện thoại.
- **JetBrains Mono**: Font chữ đơn khoảng cho số liệu (giờ, phút, lương, tỷ lệ OT). Bắt buộc kích hoạt `font-feature-settings: "tnum" 1` để các số luôn có độ rộng bằng nhau.

Phân cấp kích thước:
- Hero Metric: `1.65rem` (`700`, line-height `1.2`, tracking `-0.025em`).
- Modal / Section Title: `1.15rem` (`600`, line-height `1.3`).
- Body Text: `0.875rem` (`400` / `500`, line-height `1.5`).
- Subtitle & Meta: `0.75rem` (`500` / `600`, uppercase tracking `0.05em`).

## Layout

- **Mobile First Container**: Cố định độ rộng tối đa `100%` trên mobile, tối đa `680px` (trang chính) hoặc `880px` (hộp thoại thống kê rộng) trên máy tính để bàn, canh giữa màn hình.
- **Floating Dock Navigation**: Thanh điều hướng nổi cố định dưới đáy màn hình với `bottom: calc(env(safe-area-inset-bottom, 0px) + 1.25rem)`, đảm bảo an toàn tuyệt đối với thanh vuốt Home của iPhone và thanh điều hướng Android.
- **Grid & Rhythm**: Khoảng cách cơ sở bội số 4px (4px, 8px, 12px, 16px, 24px).

## Elevation & Depth

- **Shadows**:
  - Thẻ nhẹ (`--shadow-sm`): `0 1px 2px rgba(0, 0, 0, 0.04)`.
  - Thẻ nổi (`--shadow-md`): `0 4px 12px rgba(0, 0, 0, 0.05)`.
  - Hộp thoại & Dock (`--shadow-lg`): `0 12px 32px -4px rgba(0, 0, 0, 0.08)`.
  - Dark Mode: Thêm đường viền sáng nhẹ bên trong `inset 0 1px 0 rgba(255, 255, 255, 0.05)` để tạo cảm giác khắc nổi sang trọng.

## Shapes

- Bo góc theo thang:
  - Nút con & Tag: `var(--radius-xs)` (4px) và `var(--radius-sm)` (6px).
  - Nút chính & Ô nhập: `var(--radius-md)` (8px).
  - Thẻ card & Hộp thoại: `var(--radius-lg)` (12px).
  - Badge trạng thái & Nút bo tròn: `var(--radius-pill)` (9999px).

## Components

- **Morphic Button (`.btn-morphic`)**: Nút xúc giác kích thước tối thiểu 36x36px với vùng chạm thực tế 44x44px. Hiệu ứng nhấn giảm tỷ lệ mượt mà `active: scale(0.96)`.
- **Shift Ledger Row (`.shift-ledger-row`)**: Hàng ghi nhận ca làm việc chia 3 khối: Thẻ ngày tháng cố định bên trái, thông tin ca/nơi làm ở giữa, số tiền và nút sửa ở bên phải.
- **Custom Select (`.custom-select-wrap`)**: Dropdown tùy biến hoàn toàn hỗ trợ chọn nhanh, icon chevron xoay mượt mà, đồng bộ giá trị với thẻ select ẩn.
- **Canvas Slip (`#slipCanvas`)**: Bộ vẽ phiếu lương Canvas 2x Retina sắc nét, hỗ trợ sao chép trực tiếp vào bộ nhớ tạm để gửi qua Zalo/Messenger.

## Do's and Don'ts

### Do's
- Luôn sử dụng `--color-money` cho mọi vị trí hiển thị số tiền lương.
- Luôn hiển thị số tiền sạch không dấu `+` (ví dụ: `150.000 đ`, `1.250.000 đ`).
- Luôn bọc văn bản người dùng nhập trong `escapeHtml()` khi render động.
- Luôn đảm bảo chế độ `@media (prefers-reduced-motion: reduce)` được tôn trọng.

### Don'ts
- Không sử dụng gradient màu mè trên văn bản.
- Không sử dụng hiệu ứng nảy thô thiển (`bounce easing`). Chỉ dùng `cubic-bezier(0.16, 1, 0.3, 1)` (exponential deceleration).
- Không để xuất hiện thanh cuộn scrollbar trên bất kỳ bề mặt nào.
- Tuyệt đối không thêm comment vào mã nguồn HTML, CSS, JavaScript.


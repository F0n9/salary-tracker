# 💸 Lương Ca Làm (Shift & Salary Tracker)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/Vanilla_CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Ứng dụng quản lý ca làm việc, chấm công và tự động tính thu nhập linh hoạt** — Thiết kế tối giản, hệ nút bấm **Icon Morphism** xúc giác cao cấp, hỗ trợ xuất phiếu chấm công Zalo 1 chạm và tự động đồng bộ đám mây qua GitHub Gist.

---

## 🌟 Điểm nổi bật (Key Features)

### 1. 🖲️ Giao diện Icon Morphism & Minimal Light Theme
- **Không chữ rườm rà:** Toàn bộ thanh công cụ và nút thao tác được tinh gọn thành các nút tròn **Icon Morphism** cơ học với hệ đổ bóng kép (`dual-shadow elevation`), hiệu ứng thụt chìm cơ học khi bấm (`:active inset`) và độ tương phản cao đạt chuẩn **WCAG AAA**.
- **Font chữ chọn lọc:** Kết hợp giữa `Outfit` thanh lịch và `JetBrains Mono` hiển thị giờ giấc dạng số cố định (`tabular-nums`), không dùng font mặc định hay phong cách AI đại trà.
- **Floating Morphic Dockbar:** Thanh dock điều hướng nổi bồng bềnh dưới đáy màn hình, tối ưu hoàn hảo cho thao tác ngón cái trên điện thoại và máy tính bảng.

### 2. 📋 Xuất phiếu chấm công Zalo 1 Chạm (Slip Generator)
- **Tự động sinh ảnh phiếu công chuẩn nét cao (PNG Retina 2x):**
  - Tái tạo bảng chấm công đúng cấu trúc thực tế: `Thứ & Ca`, `Giờ vào`, `Giờ ra`, `Số giờ` (định dạng `h:mm` như `3:00`, `2:45`, tổng `15:09`).
  - Màu sắc trực quan: Phân loại ca nền vàng dịu, dòng tổng kết nền xanh dương.
- **Copy ảnh trực tiếp vào Clipboard:** Chỉ cần bấm 1 nút, mở khung chat Zalo / Messenger bấm `Ctrl + V` là ảnh được gửi ngay, không cần chụp màn hình hay lưu file tạm.
- **Sao chép tin nhắn văn bản:** Tự động định dạng đoạn chat lịch sự để gửi nhanh qua tin nhắn.
- **Tùy chọn linh hoạt:** Bật/tắt hiển thị số tiền lương tùy theo nhu cầu gửi cho quản lý.

### 3. 🗓️ Quản lý tuần & Đơn giá linh hoạt
- **Độc lập theo từng tuần:** Tự động tính tổng giờ, tổng thu nhập và số ca cho từng tuần làm việc.
- **Đơn giá biến thiên:** Tùy biến đơn giá VNĐ/giờ riêng cho từng tuần (hỗ trợ tăng lương hoặc phụ cấp theo giai đoạn).
- **Ca mẫu nhanh:** 1 click chọn ca Trưa (`10:00 – 13:30`) hoặc ca Tối (`17:00 – 20:30`), tự động nhận diện ca xuyên đêm qua 0h.
- **Bảng tổng kết sự nghiệp (All-Time):** Theo dõi tổng thu nhập tích lũy, tổng giờ công và mức trung bình trên tất cả các tuần.

### 4. ☁️ Lưu trữ Offline-First & Đồng bộ GitHub Gist
- **Zero Server & Bảo mật 100%:** Mặc định chạy hoàn toàn trên `localStorage` trình duyệt, không gửi dữ liệu ra bất kỳ máy chủ bên thứ ba nào.
- **Tự động đồng bộ đám mây qua GitHub Gist:**
  - Nhập GitHub Personal Access Token (PAT) và Gist ID trong phần Cài đặt.
  - Tự động đồng bộ hai chiều giữa máy tính và điện thoại mỗi khi thêm/sửa ca khi host trên GitHub Pages.
- **Sao lưu & Khôi phục thủ công:** Xuất và nhập file `.json` hoặc file Excel/CSV bất cứ lúc nào.

---

## 📱 Cài đặt làm ứng dụng điện thoại (PWA)

Chỉ cần mở liên kết trang web trên trình duyệt điện thoại:

### Trên iPhone / iPad (Safari)
1. Mở trang web bằng trình duyệt **Safari**.
2. Nhấn nút **Chia sẻ** (biểu tượng hình vuông có mũi tên đi lên).
3. Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
4. Bấm **Thêm**. Ứng dụng sẽ xuất hiện như một app độc lập, không viền trình duyệt.

### Trên Android (Chrome)
1. Mở trang web bằng **Google Chrome**.
2. Nhấn vào biểu tượng **3 chấm** ở góc trên bên phải.
3. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào Màn hình chính"**.

---

## 🚀 Hướng dẫn triển khai lên GitHub Pages

Ứng dụng được viết hoàn toàn bằng **Vanilla Web (HTML5, CSS3, JS)** không qua build step:

1. **Tạo repository trên GitHub:**
   - Đặt tên repo: `shift-salary-tracker` (hoặc tên tùy chọn).
2. **Đẩy mã nguồn lên:**
   ```bash
   git remote add origin https://github.com/<tên-user-github>/<tên-repo>.git
   git branch -M master
   git push -u origin master
   ```
3. **Kích hoạt GitHub Pages:**
   - Vào repository trên GitHub $\rightarrow$ **Settings** $\rightarrow$ **Pages** (cột trái).
   - Tại mục **Build and deployment** $\rightarrow$ **Branch**: chọn `master` và thư mục `/ (root)`.
   - Nhấn **Save**.
4. **Truy cập:** Sau 1-2 phút, ứng dụng của bạn sẽ hoạt động tại:
   ```
   https://<tên-user-github>.github.io/<tên-repo>/
   ```

---

## 💻 Chạy thử nghiệm Local (Offline)

Bạn có thể chạy thử trực tiếp trên máy tính mà không cần cài đặt môi trường phức tạp:

```bash
# Cách 1: Mở trực tiếp file index.html trong trình duyệt
start index.html

# Cách 2: Chạy web server đơn giản với Python
python -m http.server 8080
# Sau đó mở http://localhost:8080
```

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML5 Semantic, Modern Vanilla CSS3, Vanilla ES6+ JavaScript.
- **Typography:** Google Fonts (`Outfit` & `JetBrains Mono`).
- **Icons:** Inline Vector SVG tối ưu hóa hiệu năng, không tải thư viện font icon cồng kềnh.
- **Design System:** Tuân thủ chuẩn thiết kế chống AI-slop được kiểm chứng bởi `npx impeccable detect` (0 anti-patterns).

---

## 📄 Bản quyền (License)

Phát hành theo giấy phép [MIT License](LICENSE). Tự do sử dụng và tùy biến cá nhân.

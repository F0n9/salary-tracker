# Shift & Salary Tracker

Ứng dụng web PWA theo dõi ca làm việc, chấm công và tự động tính thu nhập linh hoạt, tối ưu cho cả điện thoại di động và máy tính. Hoạt động 100% offline, không phụ thuộc server và chi phí vận hành 0 đồng.

Dữ liệu lịch sử 8 tuần đã được di chuyển và đồng bộ trực tiếp từ file `Salary.xlsx`.

---

## 1. Tính năng chính

- **Chấm công linh hoạt theo ca:**
  - Ca mẫu nhanh: Ca Trưa (10:00 – 13:30) và Ca Tối (17:00 – 20:30).
  - Tự do nhập giờ bất kỳ, hệ thống tự tính số giờ làm và quy đổi ra số thập phân + định dạng giờ phút (`3.25h ~ 3h 15m`).
  - Tự động xử lý ca làm việc qua đêm (qua 0h).
- **Đồng hồ bấm giờ trực tiếp (Live Punch-in):**
  - Bấm "Bắt đầu ca" khi vào làm: đồng hồ đếm giây và nhảy số tiền tạm tính theo thời gian thực.
  - Lưu trạng thái vào bộ nhớ máy: dù tắt trình duyệt hay hết pin khởi động lại vẫn không mất phiên đang bấm giờ.
  - Bấm "Kết thúc ca" để tự động điền vào danh sách ca làm việc.
- **Thống kê & Quản lý nhiều tuần:**
  - Phân tách theo từng tuần (Tuần 1, Tuần 2,...). Nút "+ Tuần mới" tạo tuần kế tiếp chỉ với 1 click.
  - Tùy chỉnh đơn giá theo từng tuần (ví dụ Tuần 1–4: 35.000đ/h, từ Tuần 5 trở đi: 40.000đ/h).
  - Bảng tổng kết toàn bộ các tuần: tổng tích lũy, số giờ làm, số ca và thu nhập trung bình mỗi tuần.
- **Xuất dữ liệu & Sao lưu:**
  - Xuất bảng chấm công tuần hoặc toàn bộ các tuần ra file **Excel / CSV** chuẩn UTF-8 (mở trên Excel không bị lỗi font Tiếng Việt).
  - Xuất file sao lưu dự phòng JSON và khôi phục khi đổi máy hoặc trình duyệt.

---

## 2. Hướng dẫn cài đặt lên điện thoại (PWA)

Chỉ cần mở liên kết trang web (hoặc sau khi đưa lên GitHub Pages), bạn có thể cài ứng dụng về màn hình chính điện thoại như một App thông thường:

### Trên iPhone (Safari)
1. Mở trang web trên trình duyệt **Safari**.
2. Bấm vào biểu tượng **Chia sẻ (Share)** ở thanh điều hướng bên dưới (hình ô vuông có mũi tên chỉ lên).
3. Cuộn xuống và chọn **"Thêm vào MH chính" (Add to Home Screen)**.
4. Bấm **Thêm**. Ứng dụng sẽ xuất hiện với icon riêng biệt và chạy toàn màn hình, mượt mà như app gốc.

### Trên Android (Chrome)
1. Mở trang web trên trình duyệt **Chrome**.
2. Bấm vào menu **3 chấm** ở góc trên bên phải.
3. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào Màn hình chính"**.

---

## 3. Hướng dẫn đưa lên GitHub Pages (Miễn phí 100%)

Nếu muốn dùng qua mạng internet trên mọi thiết bị:

1. Tạo một repository mới trên GitHub (ví dụ: `shift-tracker`).
2. Tải toàn bộ các file trong thư mục này lên repository.
3. Vào tab **Settings** của repository trên GitHub $\rightarrow$ Mục **Pages** (cột bên trái).
4. Tại phần **Branch**, chọn `main` (hoặc `master`) $\rightarrow$ Thư mục `/(root)` $\rightarrow$ Nhấn **Save**.
5. Sau 1-2 phút, GitHub sẽ cung cấp link truy cập dạng:
   ```
   https://<username>.github.io/<tên-repo>/
   ```
   Lưu link này lại trên điện thoại là có thể dùng trọn đời không tốn bất kỳ chi phí nào.

---

## 4. Chạy thử trên máy tính

- Bạn có thể nhấp đúp trực tiếp vào file `index.html` để mở ngay trên trình duyệt.
- Hoặc chạy local server bằng lệnh đơn giản:
  ```bash
  python -m http.server 3000
  ```
  Sau đó mở `http://localhost:3000`.

# Product Context: Shift & Salary Tracker

## 1. Product Truth
- **Core Purpose:** Công cụ theo dõi ca làm việc, chấm công và tự động tính lương theo tuần dành cho người đi làm theo ca không cố định.
- **Operating Context:** Người dùng thường mở ứng dụng trên điện thoại ngay khi tan ca (vội, mệt, ánh sáng môi trường thay đổi) hoặc trên máy tính khi rà soát bảng lương cuối tuần/tháng.
- **Primary Mode:** **Operate**. Mọi chi tiết ưu tiên tốc độ quét mắt (scanability), thao tác 1 chạm (ergonomics), và độ tin cậy tuyệt đối của các con số. Không có chỗ cho sự màu mè trang trí dư thừa.

## 2. Audience & Constraints
- **Người dùng:** Cần một công cụ nghiêm túc, không quảng cáo, không văn phong chatbot/AI, không phụ thuộc máy chủ bên thứ ba, bảo mật dữ liệu cá nhân tại chỗ (local-first storage).
- **Ràng buộc:** Hoạt động offline 100%, tải tức thì < 200ms, không cần cài đặt Node.js/bundler, chạy được ngay trên GitHub Pages hoặc tệp HTML nội bộ.

## 3. Voice & Tone
- Chuẩn mực, gãy gọn, dứt khoát.
- Số liệu tài chính rõ ràng, minh bạch, định dạng tiền tệ Việt Nam (VNĐ) chuẩn hóa.
- Phản hồi tức thì qua giao diện (micro-interactions tự nhiên, không giật nảy).

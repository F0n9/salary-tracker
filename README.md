# ⏱️ Salary Tracker

[![Platform: Web / PWA](https://img.shields.io/badge/Platform-Web%20%2F%20PWA-0d1117?style=flat-square&logo=googlechrome&logoColor=white)](https://f0n9.github.io/salary-tracker/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Security: RLS Protected](https://img.shields.io/badge/Security-Row_Level_Security-blue?style=flat-square)](https://supabase.com/docs/guides/auth)
[![PWA: Offline First](https://img.shields.io/badge/PWA-Offline_First-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](https://f0n9.github.io/salary-tracker/)

**Ứng dụng quản lý ca làm và tính lương thông minh**, thiết kế tinh giản, hỗ trợ PWA offline-first và đồng bộ dữ liệu đám mây đa thiết bị theo thời gian thực qua Supabase PostgreSQL.

---

## ✨ Tính năng nổi bật

- ⚡ **Chấm công tức thì & Động cơ 24h:** Giao diện nhập ca trực quan, tự động tính toán tổng số giờ và tiền lương chính xác. Hỗ trợ xử lý trơn tru các ca làm xuyên đêm vượt qua mốc 00:00.
- 🏢 **Quản lý đa cơ sở làm việc:** Dễ dàng thêm, sửa, đổi vị trí làm việc với mức lương theo giờ và tỷ lệ hoa hồng riêng biệt cho từng cơ sở.
- ☁️ **Đồng bộ đám mây Supabase đa thiết bị:** Dữ liệu được mã hóa và bảo vệ bằng Row Level Security (RLS). Tự động đồng bộ ngay lập tức (Realtime Sync) và tự động kéo dữ liệu mới nhất khi chuyển qua lại giữa điện thoại và máy tính (`syncOnFocus`).
- 📱 **PWA Offline-First:** Hoạt động mượt mà kể cả khi không có mạng thông qua Service Worker. Cài đặt trực tiếp lên màn hình chính trên iOS, Android, Windows và macOS.
- 🧾 **Xuất phiếu lương Canvas HD:** Tạo ảnh bảng lương gọn gàng, độ phân giải cao được render trực tiếp từ Canvas, hỗ trợ sao chép nhanh vào clipboard để gửi qua Zalo/Telegram hoặc lưu về máy.
- 📊 **Thống kê & Phân tích trực quan:** Bảng điều khiển KPI theo dõi tổng thu nhập, số giờ công, biểu đồ xu hướng và phân bố tỷ trọng làm việc theo từng cơ sở qua các mốc thời gian.
- 🎨 **Giao diện Impeccable chuẩn xác:** Trải nghiệm thị giác tinh gọn, chuyển đổi Light/Dark mode mượt mà với hoạt ảnh ripple mở rộng, viền 1px sắc nét và hiển thị số liệu tối ưu với font `Outfit` & `JetBrains Mono`.

---

## 📁 Cấu trúc dự án

```text
salary-tracker/
├── assets/
│   └── icons/               # 🎨 Biểu tượng ứng dụng và favicon PWA
├── css/
│   ├── base.css             # 🧱 Design tokens, CSS variables, typography & reset
│   ├── components.css       # 🧩 Header, navigation dock, card và bảng ca làm
│   └── modals.css           # 🪟 Hộp thoại, form nhập liệu, toast notification & chart
├── js/
│   ├── config.js            # ⚙️ Cấu hình Supabase client và hằng số toàn cục
│   ├── i18n.js              # 🌐 Bộ đa ngôn ngữ (Tiếng Việt / English)
│   ├── theme.js             # 🌓 Quản lý chủ đề Light / Dark và hiệu ứng chuyển đổi
│   ├── state.js             # 📦 Quản lý trạng thái ứng dụng & LocalStorage fallback
│   ├── calculator.js        # 🧮 Thuật toán tính giờ, ca qua đêm và tổng lương
│   ├── services/
│   │   └── supabase.js      # ☁️ Dịch vụ xác thực, Realtime sync & Cloud backup
│   ├── ui/
│   │   ├── toast.js         # 🔔 Hệ thống thông báo toast hiện đại
│   │   ├── select.js        # 🔽 Dropdown tùy chỉnh cao cấp
│   │   ├── chart.js         # 📈 Biểu đồ thống kê thu nhập và giờ công
│   │   ├── canvas-slip.js   # 🧾 Render phiếu lương HD từ Canvas
│   │   ├── export.js        # 📤 Xuất dữ liệu JSON và hình ảnh
│   │   └── modals.js        # 💬 Điều khiển đóng mở và tương tác hộp thoại
│   └── app.js               # 🚀 File khởi chạy trung tâm (Native ES Modules)
├── index.html               # 📄 Điểm vào HTML chính
├── manifest.json            # 📱 Cấu hình Web App Manifest cho PWA
├── sw.js                    # 🔄 Service Worker phục vụ offline caching
├── package.json             # 📦 Cấu hình dự án & scripts
├── .gitignore               # 🙈 Quy tắc bỏ qua file của Git
├── LICENSE                  # ⚖️ Giấy phép mã nguồn mở MIT
└── README.md                # 📖 Tài liệu hướng dẫn sử dụng
```

---

## 🛠️ Công nghệ sử dụng

| Tầng công nghệ | Công nghệ | Mục đích |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5 / Modern JavaScript (ES Modules) | Kiến trúc thuần chuẩn web, không phụ thuộc bundler cồng kềnh |
| **Design System** | Modern CSS3 Custom Properties | Hệ thống token màu sắc, typography và bố cục co giãn linh hoạt |
| **Typography** | `Outfit` & `JetBrains Mono` | Tối ưu khả năng đọc số liệu tài chính và thời gian |
| **Cloud Database** | Supabase (PostgreSQL 15) | Lưu trữ đám mây bảo mật, phát hiện xung đột và đồng bộ realtime |
| **Bảo mật truy cập**| Supabase Row Level Security (RLS) | Phân quyền truy cập độc lập đến từng dòng bản ghi theo `auth.uid()` |
| **Bộ nhớ đệm** | Service Worker Cache API & LocalStorage | Đảm bảo ứng dụng sẵn sàng mở tức thì 100% khi offline |

---

## 🚀 Khởi chạy cục bộ (Quick Start)

### Yêu cầu hệ thống
- Trình duyệt web hiện đại hỗ trợ ES Modules (Chrome, Edge, Safari, Firefox).
- [Node.js](https://nodejs.org/) (tùy chọn) hoặc bất kỳ static server nào.

### 1. Clone repository
```bash
git clone https://github.com/F0n9/salary-tracker.git
cd salary-tracker
```

### 2. Khởi chạy ứng dụng

Sử dụng `npm`:
```bash
npm start
```

Hoặc dùng Python tích hợp sẵn:
```bash
python -m http.server 8080
```

Mở trình duyệt tại địa chỉ: `http://localhost:8080`.

---

## 🔐 Cấu hình Supabase & Row Level Security

Để kết nối với hệ thống lưu trữ đám mây của bạn, mở **SQL Editor** trong bảng điều khiển Supabase và thực thi câu lệnh khởi tạo bảng cùng chính sách bảo mật:

```sql
create table if not exists public.user_salary_data (
  user_id uuid references auth.users(id) on delete cascade primary key,
  username text,
  weeks jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.user_salary_data enable row level security;

create policy "Users can view own data" 
  on public.user_salary_data for select 
  using (auth.uid() = user_id);

create policy "Users can insert own data" 
  on public.user_salary_data for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own data" 
  on public.user_salary_data for update 
  using (auth.uid() = user_id);
```

Cập nhật thông tin `SUPABASE_URL` và `SUPABASE_ANON_KEY` trong file `js/config.js` để hoàn tất cấu hình.

---

## 📲 Cài đặt Progressive Web App (PWA)

### Trên điện thoại (iOS / Android)
1. Mở liên kết ứng dụng trên trình duyệt Safari (iOS) hoặc Chrome (Android).
2. Nhấn vào biểu tượng **Chia sẻ** (Safari) hoặc dấu **3 chấm** (Chrome).
3. Chọn **Thêm vào màn hình chính** (**Add to Home Screen**).

### Trên máy tính (Windows / macOS)
1. Truy cập ứng dụng trên Chrome hoặc Edge.
2. Nhấn vào biểu tượng **Cài đặt ứng dụng** (nằm ở thanh địa chỉ phía trên bên phải).
3. Ứng dụng sẽ chạy trong cửa sổ độc lập như phần mềm native.

---

## 📄 Giấy phép

Phát hành dưới giấy phép mã nguồn mở [MIT License](./LICENSE).

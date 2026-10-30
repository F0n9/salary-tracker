# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Người đi làm việc theo ca, nhân viên part-time (sinh viên, nhân viên nhà hàng, F&B, chuỗi bán lẻ, siêu thị, người làm nhiều nơi cùng lúc, người làm việc tự do theo giờ). 

Người dùng cần ghi chép ca làm việc tức thì ngay sau khi tan ca trên điện thoại cá nhân (thường ở nơi ồn ào, vội vã hoặc kết nối mạng chập chờn) và cần tổng hợp số giờ, ước tính số tiền lương để đối soát minh bạch với chủ quán hoặc quản lý cơ sở vào cuối mỗi tuần hoặc cuối tháng.

## Product Purpose

Giải phóng người làm việc theo ca khỏi sự bất tiện, rủi ro sai sót của việc ghi chép sổ tay giấy hoặc các bảng tính Excel phức tạp. 

Sản phẩm cung cấp một công cụ chấm công cá nhân tự động hóa toàn bộ việc tính toán thời gian, ca qua đêm, mức lương theo từng nơi làm việc và tạo phiếu chấm công trực quan. Thành công của sản phẩm được định nghĩa bằng việc: người dùng ghi nhận ca làm việc trong vòng dưới 5 giây và có thể gửi ngay một phiếu đối soát lương rõ ràng, chuẩn xác khiến quản lý không thể chối từ hay nhầm lẫn.

## Positioning

Công cụ chấm công và tính lương cá nhân Progressive Web App (PWA) vận hành theo triết lý Ngoại tuyến là trên hết (Offline-First) kết hợp lưu trữ đám mây Supabase PostgreSQL bảo mật RLS, sở hữu động cơ tính giờ 24h xử lý mượt mà các ca làm việc xuyên đêm, hỗ trợ quản lý đa cơ sở với mức lương riêng biệt, cùng trình xuất phiếu chấm công Canvas sắc nét chia sẻ thẳng vào clipboard cho Zalo và Messenger chỉ với một thao tác chạm.

## Operating Context

- **Thiết bị & Môi trường**: Điện thoại thông minh (iOS Safari, Android Chrome) là môi trường thao tác chính khi tan ca; màn hình máy tính (Desktop Web) phục vụ khi cần theo dõi biểu đồ thống kê chuyên sâu hoặc xuất dữ liệu.
- **Điều kiện thực tế**: Thường xuyên sử dụng trong môi trường mạng yếu, tầng hầm hoặc không có kết nối internet; sử dụng nhiều vào ban đêm hoặc rạng sáng sau các ca làm muộn (đòi hỏi chế độ Dark Mode chuẩn mực, dịu mắt, không gây chói).
- **Quy trình sử dụng chuẩn**: 
  1. Hết ca làm: Mở ứng dụng ngay tại màn hình chính (Standalone PWA).
  2. Bấm "+ Thêm ca" trên thanh điều hướng Dock nổi.
  3. Chọn thứ, loại ca (Sáng/Trưa/Tối), nơi làm việc và khung giờ (tự động gợi ý thông minh).
  4. Xem lương và số giờ ca làm được tính tự động tức thì.
  5. Cuối tuần/cuối tháng: Mở "Phiếu công", chọn "Sao chép ảnh" và dán trực tiếp vào hội thoại trao đổi với quản lý.

## Capabilities and Constraints

- **Chức năng đã xác nhận**:
  - Quản lý linh hoạt danh sách các tuần làm việc và chuyển tuần qua lại nhanh chóng.
  - Hỗ trợ nhiều cơ sở làm việc (Workplaces) với cài đặt mức lương giờ (Hourly Rate) độc lập cho từng cơ sở.
  - Động cơ thời gian 24h tự động xử lý ca làm việc vượt qua nửa đêm (Overnight shift crossing 00:00).
  - Tự động phát hiện loại ca (Sáng, Trưa, Tối, Khác) và gợi ý thông minh dựa trên lịch sử gần nhất.
  - Xuất phiếu lương dạng thẻ ảnh Canvas độ phân giải cao (2x Retina) có tùy chọn ẩn/hiện số tiền lương để linh hoạt gửi đối soát.
  - Báo cáo tổng hợp số liệu theo từng tháng và bảng thống kê trực quan (biểu đồ đường xu hướng tuần, biểu đồ cột thu nhập, biểu đồ tròn phân bổ nơi làm việc).
  - Xuất file dữ liệu CSV từng tuần, tổng hợp toàn bộ các tuần, và cơ chế sao lưu / phục hồi dữ liệu dạng JSON.
  - Xác thực người dùng và đồng bộ đám mây Supabase PostgreSQL kèm hàng đợi đồng bộ ngoại tuyến (Pending Sync Queue) tự động đẩy dữ liệu khi có mạng lại.
- **Ràng buộc kỹ thuật & quy chuẩn bền vững**:
  - Kiến trúc ES Modules thuần (Zero-Bundler), không phụ thuộc webpack/vite để giữ khả năng triển khai trực tiếp tức thì trên GitHub Pages.
  - Offline-first hoàn chỉnh qua Service Worker Cache API.
  - Tuyệt đối không hiển thị thanh cuộn scrollbar trên bất kỳ bề mặt nào của ứng dụng.
  - Tuyệt đối không chứa bất kỳ dòng comment nào trong toàn bộ mã nguồn.
  - Ngôn ngữ giao diện tiếng Việt tự nhiên, gãy gọn, chuẩn mực con người, loại bỏ hoàn toàn các thuật ngữ máy móc của AI.

## Brand Commitments

- **Tên thương hiệu**: Salary Tracker.
- **Ngôn ngữ hình ảnh (Visual Identity)**:
  - Phong cách: Basic mà sang trọng, tối giản, thanh lịch, mang tính công cụ chuyên nghiệp (Operate Mode).
  - Hệ màu sắc: Nền sáng `#f8fafc` sạch sẽ, nền tối `#0b0c10` có chiều sâu; màu xanh thương hiệu Sapphire Blue `#2563eb` và màu xanh lá hoàn thành Emerald `#10b981`.
  - Kiểu chữ: Font văn bản `Inter` hiện đại kết hợp font số học cố định `JetBrains Mono` để các giá trị tiền tệ và thời gian luôn gióng thẳng hàng cột số.
  - Độ sâu & Cấu trúc: Viền mỏng 1px tinh tế xác định ranh giới; bóng đổ mềm nhiều lớp phân tầng độ cao; không lạm dụng hiệu ứng kính mờ hay viền màu lòe loẹt.

## Evidence on Hand

- Ứng dụng web thực tế đã được triển khai công khai trên GitHub Pages tại địa chỉ `https://f0n9.github.io/salary-tracker/`.
- Mã nguồn nguồn mở hoàn chỉnh trên GitHub repository `F0n9/salary-tracker` với cấu trúc thư mục chuẩn `assets/icons/`, `css/`, `js/` và `package.json`.
- Hệ thống cơ sở dữ liệu Supabase PostgreSQL hoạt động ổn định với cơ chế Row Level Security (RLS) bảo vệ quyền riêng tư tuyệt đối cho từng người dùng.

## Product Principles

1. **Tốc độ hơn Phô trương (Speed over Spectacle)**: Thao tác ghi nhận một ca làm việc phải hoàn tất trong dưới 5 giây. Giao diện ưu tiên phản hồi tức thì ($\le 150\text{ms}$), không để hoạt họa chậm chạp cản trở người dùng tan ca.
2. **Ngoại tuyến Tuyệt đối An toàn (Zero-Failure Offline First)**: 100% các tính năng ghi chép, tính tiền, xem biểu đồ và xuất ảnh phiếu lương phải chạy mượt mà ngay cả khi không có mạng. Đám mây là tầng sao lưu âm thầm, không bao giờ chặn luồng thao tác.
3. **Chính xác & Minh bạch (Precision & Transparency)**: Tính toán thời gian và thu nhập rõ ràng đến từng phút và từng đồng, hiển thị song song cả số giờ thập phân (8.83h) và giờ phút thực tế (8h 50m), không làm tròn mập mờ gây tranh cãi khi nhận lương.
4. **Bàn giao Không ma sát (Effortless Handoff)**: Dữ liệu chấm công được chuyển hóa thành hình ảnh trực quan, sắc nét để người dùng có thể gửi ngay qua Zalo, Messenger hoặc tin nhắn mà không yêu cầu người quản lý hay chủ quán phải cài đặt thêm ứng dụng nào khác.

## Accessibility & Inclusion

- Độ tương phản màu sắc đạt chuẩn WCAG AA ($\ge 4.5:1$ cho văn bản thường, $\ge 3:1$ cho số liệu lớn).
- Hỗ trợ tối ưu song song hai giao diện Sáng (ban ngày) và Tối (làm việc đêm), không gây mỏi mắt.
- Toàn bộ hiệu ứng hover được bảo vệ qua `@media (hover: hover)` tránh hiện tượng kẹt dính trạng thái trên màn hình cảm ứng di động.
- Hệ thống thông báo toast phản hồi xúc giác nhẹ nhàng kèm nút "Hoàn tác" kịp thời bảo vệ người dùng khỏi thao tác vô tình xóa ca hay xóa tuần.

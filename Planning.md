# 📋 KẾ HOẠCH TRIỂN KHAI DỰ ÁN (PROJECT PLANNING)

---

## 1. Tổng Quan Tiến Độ

* **Trạng thái hiện tại:** Đã hoàn thành toàn bộ các Phase trong kế hoạch. Hệ thống sẵn sàng vận hành chính thức trên Vercel & Supabase.
* **Thanh tiến độ:** `██████████ 100%`

### Danh sách các hạng mục chi tiết

| Hạng mục | Trạng thái | Mức độ ưu tiên | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Xác định yêu cầu nghiệp vụ (PRD)** | ✅ Đã hoàn thành | **P0** | Đã cấu trúc lại tài liệu mô tả yêu cầu sản phẩm. |
| **Thiết kế kiến trúc hệ thống (System Design)** | ✅ Đã hoàn thành | **P0** | Đã chốt mô hình và thiết kế cấu trúc database, API. |
| **Thiết kế giao diện UI/UX & Wireframe** | ✅ Đã hoàn thành | **P0** | Đã phác thảo giao diện trên các trang HTML mẫu. |
| **Phát triển Front-end Prototype (Mock data)** | ✅ Đã hoàn thành | **P0** | Đã xây dựng coachee.html & coach.html chạy hoàn chỉnh bằng mock data. |
| **Thiết lập Database & Bảo mật Supabase RLS** | ✅ Đã hoàn thành | **P1** | Đã tạo SQL migration khởi tạo các bảng và phân quyền RLS bảo mật. |
| **Tích hợp logic backend & thuật toán tính điểm** | ✅ Đã hoàn thành | **P1** | Đã tích hợp logic tính điểm trung bình và kết nối lưu trữ/truy vấn qua Supabase SDK. |
| **Tự động hóa kết xuất báo cáo PDF & gửi Email** | ✅ Đã hoàn thành | **P1** | Đã tạo serverless API tự động xuất báo cáo PDF (jsPDF), tích hợp Resend API & thêm tính năng tải trực tiếp. |
| **Kiểm thử chất lượng & Tối ưu Responsive** | ✅ Đã hoàn thành | **P2** | Đảm bảo responsive hoàn hảo cho bảng/navbar di động & thêm hiệu ứng fadeIn mượt mà. |

---

## 2. Kế Hoạch Triển Khai Chi Tiết

Kế hoạch được thực hiện theo triết lý **"Front-end / Prototype First"** để tối ưu hóa trải nghiệm người dùng trước khi xây dựng hạ tầng cơ sở dữ liệu.

### Phase 1: Thiết kế UI/UX & Phát triển Front-end Prototype (Prototype First)

| Sprint | Thời gian | Tasks | Output |
| :--- | :--- | :--- | :--- |
| **Sprint 1: UI/UX & Wireframes** | 1 Tuần | ① Phác thảo giao diện làm bài trắc nghiệm / tự luận của Coachee.<br>② Thiết kế trang quản trị, danh sách và bảng chấm sao của Coach.<br>③ Tạo bản thiết kế mẫu (Figma/Wireframes) cho định dạng báo cáo PDF kết quả. | - Bản thiết kế giao diện chi tiết hoàn chỉnh.<br>- Bản vẽ sơ bộ luồng trải nghiệm trên Mobile & Desktop. |
| **Sprint 2: Front-end Prototype** | 1 Tuần | ① Khởi tạo cấu trúc mã nguồn Next.js & cấu hình Tailwind CSS.<br>② Xây dựng giao diện nhập thông tin & làm bài khảo sát của Coachee sử dụng Mock data.<br>③ Tích hợp vẽ biểu đồ mạng nhện trực quan cho Coachee.<br>④ Dựng giao diện đăng nhập và chấm điểm của Coach (chạy thử luồng cho nhận xét & chọn sao). | - Giao diện Front-end hoạt động mượt mà (Mock data).<br>- Bản deploy thử nghiệm trên Vercel để người dùng đánh giá. |

### Phase 2: Database & Core Backend Integration

| Sprint | Thời gian | Tasks | Output |
| :--- | :--- | :--- | :--- |
| **Sprint 3: Database & Auth Setup** | 1 Tuần | ① Tạo project Supabase, triển khai schema DB (`users`, `assessments`, `coach_reviews`).<br>② Cấu hình phân quyền bảo mật Supabase RLS ngăn học viên đọc chéo thông tin.<br>③ Thiết lập phân quyền truy cập cho Coach qua Supabase Auth. | - Database sẵn sàng trên Cloud.<br>- Hệ thống API kết nối Next.js và DB hoạt động ổn định. |
| **Sprint 4: Logic Integration** | 1 Tuần | ① Hiện thực hóa thuật toán quy đổi điểm trắc nghiệm (A-E) sang 4 trục L-P-I-S.<br>② Kết nối dữ liệu nhập từ form Coachee lưu trữ trực tiếp vào DB.<br>③ Đồng bộ hóa luồng chấm điểm, viết nhận xét của Coach cập nhật vào bảng `coach_reviews`. | - Logic tính điểm vận hành chính xác.<br>- Hoàn thiện luồng lưu trữ dữ liệu thực tế từ lúc làm bài tới chấm điểm. |

### Phase 3: Integration & Infrastructure Automation

| Sprint | Thời gian | Tasks | Output |
| :--- | :--- | :--- | :--- |
| **Sprint 5: PDF Engine & Mailer** | 1 Tuần | ① Triển khai Supabase Edge Function / Serverless API chuyển đổi dữ liệu chấm điểm thành file PDF.<br>② Tích hợp Resend API cấu hình gửi mail tự động đính kèm PDF báo cáo.<br>③ Cấu hình gửi đồng thời cho học viên và Coach. | - PDF xuất bản đầy đủ thông tin biểu đồ mạng nhện và nhận xét.<br>- Tác vụ gửi mail tự động thực hiện dưới 5 giây. |
| **Sprint 6: Responsive & Security** | 1 Tuần | ① Kiểm thử độ tương thích responsive trên các thiết bị di động của Coachee.<br>② Tối ưu hóa truy vấn DB, nén ảnh/asset tăng tốc độ tải trang.<br>③ Đánh giá bảo mật, chống khai thác API trái phép từ bên ngoài. | - Sản phẩm hoàn thiện đạt đầy đủ yêu cầu phi chức năng.<br>- Sẵn sàng bàn giao (Go-Live). |

---

## 3. Cấu Trúc Thư Mục Dự Kiến

Cấu trúc thư mục ưu tiên phân bổ rõ ràng phần Front-end và các tác vụ Serverless/Edge Functions:

```
├── .github/                   # Cấu hình GitHub Actions (CI/CD)
├── supabase/                  # Quản lý cơ sở dữ liệu Supabase
│   ├── migrations/            # File script SQL khởi tạo bảng & RLS
│   └── functions/             # Supabase Edge Functions (Tạo PDF & Gửi mail)
│       └── send-assessment/
├── src/
│   ├── app/                   # Next.js App Router (Routing & Pages)
│   │   ├── layout.tsx         # Bố cục chính hệ thống
│   │   ├── page.tsx           # Trang chủ (Khai báo thông tin Coachee)
│   │   ├── assessment/        # Trang làm bài của Coachee (Q1 - Q15)
│   │   ├── coach/             # Phân khu quản lý của Coach
│   │   │   ├── login/         # Đăng nhập Coach
│   │   │   ├── dashboard/     # Danh sách học viên và trạng thái
│   │   │   └── review/[id]/   # Màn hình chấm điểm và đánh giá học viên
│   │   └── api/               # Serverless API routes phục vụ dữ liệu
│   │       ├── assessments/   # API lấy và gửi bài khảo sát
│   │       └── review/        # API nộp kết quả chấm điểm
│   ├── components/            # Các thành phần giao diện tái sử dụng
│   │   ├── UI/                # Button, Input, Modal, StarRating
│   │   ├── RadarChart.tsx     # Component hiển thị biểu đồ mạng nhện
│   │   └── Layout/            # Header, Footer, Sidebar
│   ├── hooks/                 # Custom React Hooks
│   ├── lib/                   # Kết nối Supabase client & các helper utilities
│   └── types/                 # Định nghĩa TypeScript interface
└── tailwind.config.js         # Cấu hình giao diện Tailwind CSS
```

---

## 4. Quyết Định Cần Xác Nhận

| Quyết định kỹ thuật | Đề xuất của Tech Lead | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Thư viện UI chính** | Tailwind CSS | **✅ Đang sử dụng** | Đã cấu trúc hệ màu Lumina và responsive tốt. |
| **Công cụ sinh PDF** | Puppeteer-core (Serverless Edge) | **Chờ xác nhận** | Giải pháp tốt nhất để render biểu đồ Canvas ra file PDF chất lượng. |
| **Nhà cung cấp Email** | Resend API | **Chờ xác nhận** | Đơn giản, miễn phí 3,000 email/tháng, cấu hình DNS dễ dàng. |
| **Thư viện vẽ biểu đồ** | Chart.js (React-chartjs-2) | **✅ Đang sử dụng** | Đã tích hợp vẽ Radar Chart thành công trên React. |

---

## 5. Bước Tiếp Theo Ngay Lập Tức

- [x] 1. Xây dựng bản thiết kế giao diện chi tiết cho Coachee (Form làm bài trắc nghiệm) và Coach (Màn chấm điểm).
- [x] 2. Tạo bộ dữ liệu mẫu (Mock data) cho 15 câu hỏi thực tế dựa trên Bộ câu hỏi đánh giá.
- [x] 3. Phát triển giao diện làm bài của Coachee (tính toán vẽ biểu đồ mạng nhện tự động, loại bỏ hiển thị điểm).
- [x] 4. Phát triển giao diện Coach Portal (đăng nhập bảo mật, xem radar chart, chấm sao theo 3 tiêu chí).
- [x] 5. Khởi tạo mã nguồn dự án Next.js 14+ (App Router, TypeScript) và tích hợp các trang HTML prototype này thành các component React.
- [x] 6. Cấu hình dự án Supabase, triển khai migration Database (bảng users, assessments, reviews) và phân quyền RLS để chuẩn bị tích hợp dữ liệu thật.
- [/] 7. Thiết lập cấu hình Git repository (Đã đẩy code lên GitHub) và triển khai CI/CD tự động deploy lên Vercel.
- [x] 8. Triển khai API Serverless/Edge Function để kết xuất báo cáo PDF và gửi Email tự động qua Resend API (Phase 3).
- [x] 9. Kiểm thử chất lượng hiển thị Responsive trên di động và hoàn tất triển khai Go-live lên Vercel production.

## 2. Kiến Trúc Hệ Thống

### 2.1 Tổng quan kiến trúc

```
┌────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                     │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │ Coachee (Mobile/Web)  │   │   Coach (Desktop)    │  │
│  └───────────┬───────────┘   └───────────┬──────────┘  │
└──────────────┼───────────────────────────┼─────────────┘
               │ HTTPS                     │ HTTPS
               ▼                           ▼
┌────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 Vercel Platform                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Next.js App / Edge Middleware & API Routes │  │  │
│  │  └──────────────────────┬─────────────────────┘  │  │
│  └─────────────────────────┼────────────────────────┘  │
└────────────────────────────┼───────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │ API / Auth / DB       │ Edge Function         │ Email / PDF
     ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                     │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐ │
│  │ Supabase Auth  │ │  Supabase DB   │ │   Resend    │ │
│  │ (Authentication)││ (PostgreSQL)   │ │ (Email/PDF) │ │
│  └────────────────┘ └────────────────┘ └─────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack: github, supabase, vercel.

| Layer | Công nghệ | Ghi chú |
| :--- | :--- | :--- |
| **Source Control** | GitHub | Quản lý mã nguồn, CI/CD tích hợp tự động với Vercel. |
| **Frontend Framework** | Next.js (React) | SSR/ISR tối ưu hóa hiển thị, Responsive UI dùng Tailwind CSS. Vẽ biểu đồ mạng nhện bằng Chart.js hoặc Recharts. |
| **Hosting & CDN** | Vercel | Deploy nhanh, tích hợp Serverless & Edge API Routes đáp ứng tốc độ phản hồi < 3s. |
| **Backend & Database** | Supabase (PostgreSQL) | Lưu trữ thông tin học viên, câu trả lời trắc nghiệm/tự luận, kết quả đánh giá và nhận xét. |
| **Authentication** | Supabase Auth (GoTrue) | Quản lý tài khoản đăng nhập của Coach, phân quyền truy cập trang Admin. |
| **Email & PDF Service** | Resend API / Edge-PDF | Tự động hóa kết xuất báo cáo PDF (biểu đồ mạng nhện + nhận xét) và gửi email tự động cho cả 2 bên. |

---

## 3. Tính Năng Chi Tiết

### 3.1 Giao diện Học viên (Coachee Flow)
- **Khai báo thông tin cá nhân:** Nhập họ tên, email, và chọn giai đoạn huấn luyện (Stage).
- **Bộ câu hỏi trắc nghiệm (Q1 - Q12):** 
  - Hiển thị 12 câu hỏi trắc nghiệm lựa chọn (A, B, C, D, E).
  - Tự động ghi nhận và phân loại điểm số vào 4 nhóm năng lực: Lãnh đạo (L), Hiệu suất (P), Độc lập (I), Hệ thống (S).
- **Bộ câu hỏi tự luận (Q13 - Q15):** 
  - Q13, Q14: Chọn nhiều phương án kết hợp nhập văn bản trả lời lý do.
  - Q15: Ô nhập văn bản dài cam kết hành động.
- **Nộp bài & Trạng thái:** Gửi dữ liệu về database, khóa quyền chỉnh sửa và hiển thị màn hình chờ kết quả từ Coach.

### 3.2 Giao diện Coach (Coach Flow)
- **Đăng nhập hệ thống:** Bảo mật thông tin bằng mật khẩu truy cập phân quyền.
- **Quản lý danh sách học viên:** Hiển thị danh sách học viên, thời gian làm bài, trạng thái chấm điểm ("Chờ nhận xét", "Đã hoàn thành").
- **Chấm điểm & Nhận xét:** 
  - Xem biểu đồ mạng nhện sơ bộ được tính toán tự động từ 12 câu trắc nghiệm.
  - Xem chi tiết câu trả lời Q13, Q14, Q15.
  - Chấm điểm sao nhanh (1★ - 5★) cho từng câu tự luận dựa trên tiêu chí hướng dẫn (Phản hồi học tập, Mức độ sẵn sàng, Mức độ cam kết).
  - Nhập ô nhận xét/khuyên nhủ tự do cho học viên.
- **Xuất bản kết quả:** Bấm "Hoàn thành & Gửi báo cáo" để hệ thống tự động khóa bài, kết xuất PDF và gửi email.

---

## 4. Database Schema

### 4.1 Bảng chính

```
┌───────────────────┐             ┌───────────────────┐
│       users       │             │    assessments    │
├───────────────────┤             ├───────────────────┤
│ PK id (UUID)      │             │ PK id (UUID)      │
│    email (VARCHAR)│◄───────────┐│    coachee_name   │
│    role (VARCHAR) │            ││    coachee_email  │
│    created_at     │            ││    stage (VARCHAR)│
└───────────────────┘            ││    status (STATUS)│
                                 ││    q1_q12 (JSONB) │
                                 ││    q13_text (TEXT)│
                                 ││    q14_text (TEXT)│
                                 ││    q15_text (TEXT)│
                                 ││    submitted_at   │
                                 └──────────┬────────┘
                                            │
                                            │ 1
                                            │
                                            ▼ 1
                                 ┌──────────┴────────┘
                                 │   coach_reviews   │
                                 ├───────────────────┤
                                 │ PK id (UUID)      │
                                 │ FK assessment_id  │
                                 │ FK coach_id (UUID)│───► users.id
                                 │    q13_stars (INT)│
                                 │    q14_stars (INT)│
                                 │    q15_stars (INT)│
                                 │    feedback (TEXT)│
                                 │    created_at     │
                                 └───────────────────┘
```

### 4.2 Tổng cộng: **3 bảng**

1. **`users`**: Quản lý thông tin đăng nhập và phân quyền (chủ yếu dành cho Coach).
2. **`assessments`**: Lưu trữ toàn bộ bài làm khảo sát của học viên (bao gồm thông tin cá nhân, câu trả lời trắc nghiệm dạng JSONB và câu trả lời tự luận).
3. **`coach_reviews`**: Lưu trữ kết quả chấm điểm sao (1-5★) và nhận xét chi tiết của Coach cho từng bài đánh giá.

---

## 5. API Endpoints

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/assessments` | Học viên nộp bài làm khảo sát (Q1 - Q15). |
| `GET` | `/api/coach/assessments` | Coach lấy danh sách tất cả các bài làm (hỗ trợ phân trang, lọc theo trạng thái). |
| `GET` | `/api/coach/assessments/[id]` | Coach xem chi tiết bài làm và biểu đồ mạng nhện sơ bộ của một học viên cụ thể. |
| `POST` | `/api/coach/assessments/[id]/review` | Coach gửi kết quả chấm sao và nhận xét. Kích hoạt trigger xuất PDF và gửi email. |

---

## 6. Yêu Cầu Hạ Tầng

### 6.1 Server & Infrastructure

| Thông số/Layer | Yêu cầu | Ghi chú |
| :--- | :--- | :--- |
| **Frontend & API Hosting** | Vercel (Hobby hoặc Pro Tier) | Serverless Edge Network để giảm thiểu tối đa độ trễ tải trang dưới 3 giây. |
| **Database Engine** | Supabase PostgreSQL (Free hoặc Pro Tier) | Đảm bảo tính toàn vẹn dữ liệu, hỗ trợ lưu trữ JSONB tối ưu cho bộ câu hỏi. |
| **PDF Generation Runtime** | Supabase Edge Functions / Vercel Serverless | Chạy Puppeteer-core/Edge-pdf để kết xuất PDF báo cáo có biểu đồ mạng nhện. |
| **SMTP / Email Delivery** | Resend / Amazon SES | Đảm bảo email gửi đi lập tức (trong vòng dưới 5 giây) và không bị rơi vào hòm thư rác (Spam). |

### 6.2 Chi phí ước tính/tháng

| Hạng mục | Chi phí dự kiến | Ghi chú |
| :--- | :--- | :--- |
| **Hosting (Vercel)** | $0 / tháng | Miễn phí ở giai đoạn MVP (Hobby Tier). Nâng cấp lên Pro ($20/tháng) khi vận hành thực tế. |
| **Database & Auth (Supabase)** | $0 / tháng | Sử dụng Free Tier (đủ cho tối đa 500MB dữ liệu, phù hợp với lượng học viên vừa và nhỏ). |
| **Email API (Resend)** | $0 / tháng | Free Tier hỗ trợ gửi 3,000 email/tháng (đáp ứng tốt nhu cầu gửi báo cáo). |
| **Tên miền (Domain)** | $10 - $15 / năm | Mua qua Namecheap hoặc GoDaddy. |
| **Tổng cộng** | **~$0 - $20 / tháng** | Cực kỳ tối ưu cho giai đoạn vận hành ban đầu. |

---

## 7. Rủi Ro & Giảm Thiểu

| # | Rủi ro | Mức độ | Giảm thiểu |
| :--- | :--- | :--- | :--- |
| 1 | Rò rỉ thông tin đánh giá của học viên khác | **Cao** | Thiết lập chính sách Row Level Security (RLS) trên Supabase để ngăn học viên truy cập API lấy thông tin bài làm của người khác. |
| 2 | Treo hệ thống khi tạo PDF và gửi Email | **Trung bình** | Chuyển việc tạo PDF và gửi Email thành tác vụ bất đồng bộ (Asynchronous) chạy qua Edge Functions, phản hồi client lập tức. |
| 3 | Biểu đồ mạng nhện hiển thị sai lệch trên Mobile | **Thấp** | Sử dụng thư viện Chart.js cấu hình responsive canvas và tỉ lệ khung hình (aspect ratio) phù hợp. |

---

## 8. Metrics Thành Công

| Metric | Mục tiêu Phase 1 | Mục tiêu Full |
| :--- | :--- | :--- |
| **Độ trễ tải trang (Page Load Time)** | < 3.0 giây | < 1.5 giây |
| **Thời gian gửi báo cáo PDF & Email** | < 5.0 giây từ lúc Coach nhấn nút | < 3.0 giây |
| **Tỷ lệ gửi email thành công (Email Delivery Rate)** | 99% | 100% |
| **Tỷ lệ phản hồi lỗi hệ thống (Error Rate)** | < 1% | < 0.1% |

---

## 9. Phụ Lục

### Quy tắc tính điểm và phân loại trắc nghiệm (Q1 - Q12)
- Mỗi đáp án được quy đổi điểm số cố định:
  - `A` = 2 điểm
  - `B` = 4 điểm
  - `C` = 6 điểm
  - `D` = 8 điểm
  - `E` = 10 điểm
- Điểm số được chia đều và tính trung bình theo 4 trục năng lực chính:
  - **L** (Lãnh đạo): Tính từ các câu hỏi quy định.
  - **P** (Hiệu suất): Tính từ các câu hỏi quy định.
  - **I** (Độc lập): Tính từ các câu hỏi quy định.
  - **S** (Hệ thống): Tính từ các câu hỏi quy định.

### Tiêu chí chấm điểm tự luận (Q13 - Q15) dành cho Coach
- **Mức 1 sao (★):** Cần cải thiện nhiều.
- **Mức 2 sao (★★):** Cần nỗ lực thêm.
- **Mức 3 sao (★★★):** Đạt yêu cầu.
- **Mức 4 sao (★★★★):** Tốt / Khá.
- **Mức 5 sao (★★★★★):** Xuất sắc.
- Đánh giá dựa trên 3 trụ cột: Phản hồi học tập, Mức độ sẵn sàng, Mức độ cam kết.

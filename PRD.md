# TÀI LIỆU MÔ TẢ YÊU CẦU SẢN PHẨM (PRD)
**Ứng dụng Web Đánh Giá Tiến Triển Học Viên (Leadership Development Assessment)**

## 1. Tổng quan về sản phẩm

### Vấn đề cần giải quyết
Sau mỗi giai đoạn trong chương trình huấn luyện (coaching) dành cho nhân sự cấp cao ngành bảo hiểm nhân thọ, cả học viên (coachee) và người thầy (coach) đều gặp khó khăn trong việc nhìn nhận, đo lường rõ ràng sự thay đổi về tư duy và năng lực lãnh đạo. Việc đánh giá thủ công bằng giấy hoặc các biểu mẫu rời rạc khiến việc theo dõi tiến độ bị ngắt quãng, thiếu tính trực quan và khó lưu trữ lâu dài.

### Giải pháp
Một ứng dụng trên trang web giúp tự động hóa toàn bộ quy trình này:
- Học viên làm bài trắc nghiệm và trả lời câu hỏi tự luận trực tuyến.
- Hệ thống tự động tính điểm và vẽ biểu đồ mạng nhện (radar chart) trực quan cho các câu hỏi trắc nghiệm.
- Người thầy (coach) có một không gian riêng để đọc câu trả lời tự luận và chấm điểm, đưa ra lời khuyên.
- Kết quả cuối cùng được đóng gói thành một file báo cáo đẹp mắt gửi thẳng vào email của cả hai bên.

### Đối tượng sử dụng chính
- **Học viên (Coachee):** Các quản lý, nhân sự cấp cao trong ngành bảo hiểm nhân thọ đang tham gia chương trình huấn luyện.
- **Người thầy (Coach):** Người trực tiếp dẫn dắt, theo dõi và đưa ra nhận xét cho học viên.

## 2. Hình mẫu người dùng điển hình (Personas)

### Hình mẫu 1: Anh Hùng (Học viên - Coachee)
- **Thông tin:** 45 tuổi, Quản lý vùng cao cấp tại một công ty bảo hiểm lớn.
- **Đặc điểm:** Lịch trình làm việc dày đặc, thường xuyên di chuyển và gặp gỡ khách hàng. Không quá rành về công nghệ sâu nhưng sử dụng điện thoại và máy tính hằng ngày cho công việc.
- **Nhu cầu:** Muốn có một nơi làm bài đánh giá nhanh chóng, giao diện sạch sẽ, làm xong nhìn thấy ngay biểu đồ thay đổi của bản thân và nhận được file tổng hợp qua email để lưu trữ.

### Hình mẫu 2: cô Hạnh (Người thầy - Coach)
- **Thông tin:** 63 tuổi, Chuyên gia huấn luyện cao cấp của chương trình.
- **Đặc điểm:** Quản lý cùng lúc nhiều học viên. Đòi hỏi sự chính xác, quản lý thông tin khoa học và cần một công cụ giúp anh đọc nhanh các câu trả lời tự luận của học viên để đưa ra nhận xét chấm điểm ngay lập tức.
- **Nhu cầu:** Muốn biết ngay khi nào học viên làm xong bài, có một danh sách học viên rõ ràng để vào chấm điểm và hệ thống tự gửi kết quả cho học viên sau khi anh hoàn thành việc nhận xét.

## 3. Các bước thao tác của người dùng (User Flows)

### Luồng 1: Học viên làm bài đánh giá
1. Học viên truy cập vào đường dẫn trang web của chương trình.
2. Học viên nhập thông tin cá nhân (Họ tên, Email, Giai đoạn đánh giá).
3. Hệ thống hiển thị lần lượt các câu hỏi:
   - Từ câu 1 đến câu 12: Chọn 1 trong 5 đáp án (A, B, C, D, E).
   - Câu 13, 14, 15: Điền câu trả lời bằng cách tích chọn nhiều ô hoặc gõ chữ (tự luận).
4. Học viên bấm "Nộp bài".
5. Màn hình hiển thị thông báo nộp bài thành công và cho biết: "Kết quả trắc nghiệm đã được ghi nhận. Vui lòng đợi người thầy (coach) nhận xét để nhận báo cáo đầy đủ qua email."

### Luồng 2: Người thầy (Coach) chấm điểm và gửi kết quả
1. Người thầy đăng nhập vào khu vực dành riêng cho mình trên trang web.
2. Xem danh sách các học viên đã nộp bài và trạng thái (Ví dụ: "Chờ nhận xét" hoặc "Đã hoàn thành").
3. Bấm chọn một học viên đang "Chờ nhận xét" để xem chi tiết.
4. Màn hình hiển thị:
   - Biểu đồ mạng nhện sơ bộ từ câu 1-12.
   - Nội dung trả lời chi tiết câu 13, 14, 15 của học viên.
5. Người thầy thực hiện:
   - Chọn mức sao (★, ★★, ★★★) cho các câu 13, 14, 15 dựa trên bảng hướng dẫn có sẵn trên màn hình.
   - Gõ lời khuyên/nhận xét chung cho học viên vào ô văn bản.
6. Người thầy bấm "Hoàn thành & Gửi báo cáo".
7. Hệ thống tự động tạo file PDF và gửi vào email của cả học viên và người thầy.

## 4. Danh sách tính năng chi tiết theo từng giai đoạn

### GIAI ĐOẠN 1: Sản phẩm cốt lõi (MVP - Ưu tiên làm ngay)

#### Tính năng dành cho Học viên (Coachee)
- **Giao diện làm bài:** Hiển thị trọn vẹn 15 câu hỏi rõ ràng, dễ nhìn trên cả máy tính và điện thoại.
- **Bộ câu hỏi trắc nghiệm (Câu 1-12):** Cho phép chọn đáp án. Mỗi chữ cái tương ứng với số điểm cụ thể (A=2đ, B=4đ, C=6đ, D=8đ, E=10đ) chia theo 4 trục: Lãnh đạo (L), Hiệu suất (P), Độc lập (I), Hệ thống (S).
- **Bộ câu hỏi tự luận (Câu 13-15):** Ô tích chọn nhiều phương án cho câu 13, 14 và ô nhập văn bản dài cho các phần trả lời lý do, cam kết.
- **Nhận email tự động:** Nhận được file PDF đính kèm chứa: kết quả trắc nghiệm (dạng biểu đồ mạng nhện), câu trả lời tự luận và lời nhận xét của người thầy.

#### Tính năng dành cho Người thầy (Coach)
- **Trang quản lý danh sách:** Nơi hiển thị tên tất cả học viên đã làm bài, ngày làm bài và trạng thái chấm điểm.
- **Trang chấm điểm tự luận:** Hiển thị câu trả lời của học viên đối với câu 13, 14, 15. Có các nút bấm chọn nhanh mức 1 sao, 2 sao hoặc 3 sao tương ứng với các tiêu chí (Phản hồi học tập, Mức độ sẵn sàng, Mức độ cam kết).
- **Ô gõ nhận xét tự do:** Cho phép người thầy viết lời nhắn nhủ riêng cho học viên.
- **Nút bấm gửi kết quả:** Bấm để hệ thống tự khóa bài và gửi email PDF cho cả hai bên.

## 5. Yêu cầu ngoài chức năng (Chất lượng trải nghiệm)

### Tốc độ và vận hành mượt mà
- Trang web phải mở ra ngay lập tức khi bấm vào link, không được để người dùng chờ đợi quá 3 giây.
- Khi học viên bấm "Nộp bài" hoặc người thầy bấm "Gửi kết quả", hệ thống xử lý việc tính điểm, vẽ biểu đồ và gửi email trong vòng tối đa 5 giây, không bị treo máy.

### Bảo mật và an toàn thông tin
- Thông tin cá nhân (Tên, Email) và đặc biệt là nội dung nhận xét, điểm số của học viên là bảo mật. Học viên này không thể xem được bài làm và nhận xét của học viên khác.
- Khu vực quản lý của người thầy phải có mật khẩu bảo vệ an toàn để tránh người ngoài truy cập vào xem dữ liệu nội bộ.

### Sự tương thích (Responsive)
- Giao diện làm bài của học viên phải hiển thị đẹp, dễ bấm nút trên cả màn hình máy tính, máy tính bảng và điện thoại di động (vì học viên ngành bảo hiểm rất hay làm bài trên điện thoại khi đi thị trường).
- Giao diện chấm điểm của người thầy được tối ưu tốt nhất trên máy tính để thuận tiện cho việc gõ chữ nhận xét dài.
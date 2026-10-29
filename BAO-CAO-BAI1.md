# Báo cáo Bài 1: TDMU Notes API - Đặc tính điện toán đám mây NIST

- Môn: Thực hành Điện toán đám mây (LING270)
- Sinh viên: Lưu Lý Công
- Repo: https://github.com/LuuLyCong/tdmu-cloud-lab-LuuLyCong
- API: https://nightmarish-spooky-skeleton-v6jg54v6564wf66w-3000.app.github.dev (cần Codespace đang chạy và cổng 3000 để Public)
- Trang Pages: https://luulycong.github.io/tdmu-cloud-lab-LuuLyCong/ (sau khi bật Pages từ `main` `/docs`)

## 1. Số liệu thời gian phản hồi

Lệnh đo, chạy 10 lần trong Codespace ngày 29/10/2026:

```bash
curl -s -o /dev/null -w "%{time_total}\n" http://localhost:3000/hello
```

| Lần | time_total (s) |
|---:|---:|
| 1 | 0.001298 |
| 2 | 0.001011 |
| 3 | 0.001049 |
| 4 | 0.001043 |
| 5 | 0.000814 |
| 6 | 0.001629 |
| 7 | 0.002236 |
| 8 | 0.000753 |
| 9 | 0.001811 |
| 10 | 0.000741 |
| **Trung bình** | **0.001** |

Tổng 10 lần là 0.012385 s, nên trung bình là 0.0012385 s, tức khoảng 1.24 ms. Làm tròn 3 chữ số thập phân được **0.001 s**. Lần nhanh nhất là 0.000741 s và lần chậm nhất là 0.002236 s.

## 2. Mô tả môi trường

| Mục | Giá trị |
|---|---|
| Nền tảng | GitHub Codespaces (`nightmarish-spooky-skeleton-v6jg54v6564wf66w`; số đo lấy từ codespace trước, cấu hình tương đương), 2 vCPU, ~8 GB RAM |
| Hệ điều hành | Alpine Linux 3.23.7 (musl libc), kernel `6.8.0-1064-azure` |
| Node.js | v22.23.4 (bản musl), npm 10.9.9 |
| Express | 4.22.3 |
| Java / Docker | Không có trong container (Bài 1 không cần) |

**Có cài thủ công.** Theo `.devcontainer/devcontainer.json`, môi trường lẽ ra phải dùng image `mcr.microsoft.com/devcontainers/javascript-node:22`, có sẵn Node 22. Nhưng codespace này lại chạy Alpine Linux và không có `node`. Trên Alpine, các bản Node chính thức mà nvm tải về được build cho glibc nên không chạy được. Vì vậy em tải bản Node 22 build cho musl từ `unofficial-builds.nodejs.org`, kiểm tra SHA-256, rồi giải nén vào `~/.local/node22` (không dùng sudo). File `devcontainer.json` vẫn giữ nguyên. Do môi trường khác với môi trường lớp dự kiến, số đo có thể hơi khác so với các bạn khác.

Cách chạy:

```bash
export PATH="$HOME/.local/node22/bin:$PATH"   # chỉ cần ở codespace này
npm install
npm start            # in ra: Server chạy tại cổng 3000
curl http://localhost:3000/hello
```

## 3. Câu hỏi phản biện

**Câu 1. Codespaces đáp ứng đặc tính NIST nào và bằng chứng là gì?**

Codespaces đáp ứng cả 5 đặc tính:
- **Tự phục vụ theo nhu cầu:** em tự bấm tạo Codespace và có ngay máy 2 vCPU, ~8 GB RAM, không phải xin ai.
- **Truy cập mạng rộng:** chỉ cần trình duyệt là code được. API ở cổng 3000 được GitHub chuyển tiếp ra URL `https://...-3000.app.github.dev`.
- **Gộp tài nguyên:** hostname trả về từ `/hello` là `codespaces-0375bf` (codespace hiện tại; số đo ở codespace trước có hostname khác) và kernel là `azure`, tức là máy này nằm trên hạ tầng Azure dùng chung, còn em không biết nó chạy trên máy chủ vật lý nào.
- **Co giãn nhanh:** có thể dừng, tạo lại hoặc đổi loại máy bất cứ lúc nào. Ngay cả khi phải cài lại Node, em cũng chỉ mất vài giây.
- **Đo lường được:** GitHub tính theo core-giờ và lưu dung lượng (GB-tháng). Máy 2 core chạy 1 giờ sẽ trừ 2 core-giờ.

**Câu 2. Khác nhau giữa trang Pages (tĩnh) và API chạy trên Codespace?**

GitHub Pages chỉ phục vụ file có sẵn (HTML, CSS) trong thư mục `docs/`. Không có code chạy phía server, ai vào cũng thấy cùng một nội dung, và trang vẫn hoạt động khi Codespace đã tắt. API trên Codespace là một tiến trình Node.js đang chạy, nên mỗi lần gọi sẽ tính kết quả mới: `/hello` trả về `time` khác nhau mỗi lần và `/health` trả về `uptime_seconds` tăng dần. API chỉ hoạt động khi Codespace còn bật, server đã `npm start`, và cổng 3000 đang Public. Khi em thử gọi URL công khai lúc cổng chưa Public, kết quả là HTTP 302 (chuyển sang trang đăng nhập GitHub). URL của API cũng có thể đổi, còn URL Pages thì cố định.

**Câu 3. Vì sao không được commit `.env`? Nếu lỡ commit thì xử lý thế nào?**

`.env` thường chứa bí mật như mật khẩu database hay khóa API. Repo được đẩy lên GitHub, nếu repo công khai thì ai cũng đọc được, và có bot chuyên quét các repo để tìm khóa bị lộ. Vì vậy em đưa `.env` và `node_modules/` vào `.gitignore` ngay từ đầu. Nếu lỡ commit thì:
1. **Thu hồi và đổi khóa ngay** (revoke/rotate), vì khóa đã lên lịch sử Git thì coi như đã lộ.
2. Xóa file khỏi repo bằng `git rm --cached .env`, thêm `.env` vào `.gitignore`, rồi commit.
3. Xóa file khỏi toàn bộ lịch sử bằng `git filter-repo` hoặc BFG, rồi force push. Báo nhóm clone lại.
4. Dùng GitHub Secret Scanning hoặc Codespaces Secrets để lưu bí mật thay cho file trong repo.

**Câu 4. Số liệu thời gian phản hồi phản ánh điều gì và chịu ảnh hưởng bởi yếu tố nào?**

Trung bình em đo được 0.001 s (~1.24 ms), dao động từ 0.000741 s đến 0.002236 s. Số này rất nhỏ vì curl gọi qua `localhost`, tức là gói tin không ra Internet. Nó chủ yếu phản ánh thời gian Express xử lý một route đơn giản, cộng với chi phí mở kết nối TCP trong cùng một máy. Lần chậm nhất chậm gấp khoảng 3 lần lần nhanh nhất. Theo em, nguyên nhân là máy chỉ có 2 vCPU chạy chung với VS Code server và các tiến trình khác, và máy ảo cũng chia CPU với người dùng khác trên cùng host. Bộ đếm `time_total` cũng có sai số ở mức micro-giây. Nếu gọi qua URL công khai `*.app.github.dev` thì thời gian sẽ tăng lên vì có thêm DNS, TLS, khoảng cách mạng và proxy chuyển tiếp cổng của GitHub. Ngoài ra, 10 lần đo chưa đủ để kết luận chắc chắn, mà cần đo nhiều hơn và đo cả qua URL công khai để so sánh.

## 4. Giới hạn miễn phí

- Tài khoản GitHub cá nhân miễn phí có **120 core-giờ/tháng** cho Codespaces (cộng 15 GB-tháng lưu trữ). Máy 2 core chạy 1 giờ trừ 2 core-giờ, tức là dùng được khoảng 60 giờ/tháng.
- Khi không dùng thì vào github.com/codespaces và chọn **Stop codespace**, để không tốn core-giờ. Codespace cũng tự dừng sau thời gian chờ (mặc định 30 phút).
- Dừng codespace thì URL API tạm không truy cập được. Vì vậy khi giảng viên đang chấm thì em giữ codespace chạy.

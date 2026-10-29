# Báo cáo tiến trình Bài 1

Ngày thực hiện: 29/10/2026. Codespace: `alarming-phantasm-5g7496qg9gwp24qgx`.

## Bước 0: Đối chiếu yêu cầu của lớp

Ngoài `.devcontainer/devcontainer.json`, repo không có trang hướng dẫn Bài 1 (không có `README.md`, `docs/` hay file hướng dẫn nào khác). Vì vậy repo **chưa có mục Điểm kiểm tra chi tiết**. Em dựa vào 5 đặc tính NIST và API 3 endpoint để tự lập danh sách kiểm tra:

- [x] API Express chạy ở cổng `process.env.PORT || 3000`, in ra `Server chạy tại cổng 3000`
- [x] `GET /`, `GET /health`, `GET /hello` trả về JSON đúng đặc tả
- [x] Trang `docs/index.html` có bảng 5 đặc tính NIST, mục Số liệu và mục API
- [x] Có 10 số đo thời gian phản hồi thật và giá trị trung bình
- [x] Có câu trả lời cho 4 câu hỏi phản biện
- [x] `.gitignore` có `node_modules/` và `.env`, và không có bí mật trong repo

Mục tiêu theo rubric (10 điểm):

| Mục | Điểm |
|---|---:|
| Sản phẩm chạy đúng, mọi mục kiểm tra đạt | 4 |
| Minh chứng và số liệu | 2 |
| Câu hỏi phản biện | 2 |
| Mã nguồn và an toàn (lộ bí mật thì 0 điểm mục này) | 2 |

## Bước 1: Kiểm tra môi trường

| Lệnh | Kết quả |
|---|---|
| `node -v` | `node: command not found` |
| `npm -v` | `npm: command not found` |
| `java -version` | `java: command not found` (Bài 1 không cần) |
| `docker --version` | `docker: command not found` (Bài 1 không cần) |
| `git status` | `On branch main`, `nothing to commit, working tree clean` |
| `git branch --show-current` | `main` |
| `echo $CODESPACE_NAME` | `alarming-phantasm-5g7496qg9gwp24qgx` |
| `git remote -v` | `origin https://github.com/LuuLyCong/tdmu-cloud-lab-LuuLyCong` (fetch/push) |

Hệ điều hành của container là **Alpine Linux 3.23.7 (musl libc)**, kernel `6.8.0-1064-azure`, 2 vCPU, ~8 GB RAM. Image này không phải `mcr.microsoft.com/devcontainers/javascript-node:22` như `devcontainer.json` khai báo.

**Node được cài thủ công**, và đây là cách em đã chọn:
- Đề yêu cầu dùng nvm, nhưng nvm tải bản Node chính thức build cho glibc. Bản đó không chạy được trên Alpine/musl.
- Vì vậy em tải `node-v22.23.4-linux-x64-musl.tar.xz` từ `unofficial-builds.nodejs.org`, đối chiếu với `SHASUMS256.txt` (kết quả `OK`), rồi giải nén vào `~/.local/node22`. Em không dùng sudo và không sửa `devcontainer.json`.
- Kết quả: `node -v` → `v22.23.4`, `npm -v` → `10.9.9`.
- Việc thêm `~/.local/node22/bin` vào PATH qua `~/.bashrc` bị công cụ chặn. Vì vậy mỗi terminal mới cần chạy `export PATH="$HOME/.local/node22/bin:$PATH"` trước khi `npm start`.
- Môi trường khác với môi trường lớp dự kiến, nên số đo có thể hơi khác.

## Bước 2: Tạo sản phẩm

Repo ban đầu chỉ có `.devcontainer/devcontainer.json`, nên mọi file dưới đây đều được tạo mới, không ghi đè file nào:

- `package.json`: name `tdmu-notes-api`, version `1.0.0`, script `start`, dependency `express`
- `package-lock.json`: do `npm install` sinh ra (express 4.22.3)
- `.gitignore`: `node_modules/`, `.env`
- `server.js`: 3 endpoint `/`, `/health`, `/hello`
- `docs/index.html`: trang GitHub Pages
- `BAO-CAO-BAI1.md`: số liệu, mô tả môi trường, phản biện, giới hạn miễn phí
- `BAO-CAO-TIEN-TRINH.md`: file này

## Bước 3: Chạy và kiểm thử API

`npm install` thành công. Chạy `nohup npm start > /tmp/server.log 2>&1 &`, và log in ra:

```
> tdmu-notes-api@1.0.0 start
> node server.js

Server chạy tại cổng 3000
```

Kết quả nguyên văn:

```
$ curl -s http://localhost:3000/
{"message":"Hello Cloud!","service":"TDMU Notes API"}

$ curl -s http://localhost:3000/health
{"status":"ok","uptime_seconds":2}

$ curl -s http://localhost:3000/hello
{"message":"Hello Cloud từ TDMU Notes API","hostname":"codespaces-280b25","time":"2026-10-29T08:31:54.110Z"}
```

Bước này không gặp lỗi, nên không phải sửa lần nào.

Em cũng thử gọi URL công khai `https://alarming-phantasm-5g7496qg9gwp24qgx-3000.app.github.dev/hello` và nhận HTTP `302` (chuyển sang trang đăng nhập GitHub). Nghĩa là cổng 3000 đang ở chế độ Private và cần đặt Public bằng tay.

## Bước 4: Đo thời gian phản hồi

Lệnh: `curl -s -o /dev/null -w "%{time_total}\n" http://localhost:3000/hello`, chạy 10 lần.

| Lần | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| s | 0.001298 | 0.001011 | 0.001049 | 0.001043 | 0.000814 | 0.001629 | 0.002236 | 0.000753 | 0.001811 | 0.000741 |

Trung bình là 0.0012385 s, làm tròn được **0.001 s** (≈ 1.24 ms). Số này đã được điền vào `BAO-CAO-BAI1.md` và `docs/index.html`.

Server được dừng bằng `pkill -f "node server.js"`. Lệnh trả mã 144 vì `pkill -f` khớp luôn dòng lệnh của shell đang chạy nó. Em kiểm tra lại bằng `pgrep` và thấy không còn tiến trình `node server.js` nào.

## Bước 5: Kiểm tra an toàn

- `git status` trước khi commit: file mới là `.gitignore`, `BAO-CAO-BAI1.md`, `BAO-CAO-TIEN-TRINH.md`, `docs/`, `package-lock.json`, `package.json`, `server.js`.
- `node_modules/` nằm trong nhóm ignored (`!!`), và repo không có file `.env`. Cả hai đều không có trong danh sách commit.
- Grep tìm các từ khóa nhạy cảm (token/secret/password/api key) ngoài `node_modules` và `.git`: chỉ khớp ở văn bản giải thích, cụ thể là câu "GitHub Secret Scanning" trong câu 3 của `BAO-CAO-BAI1.md` và chính phần mô tả này. **Không có bí mật thật.**
- Grep tìm placeholder chưa điền: không còn kết quả nào.
- `.devcontainer/devcontainer.json` không bị thay đổi.

## Bước 6: Commit và push

Xem mục "Trạng thái push" ở dưới.

## Bước 7: Báo cáo cuối

**Môi trường:** codespace chạy Alpine Linux và không có Node. Em đã cài Node v22.23.4 (bản musl) thủ công ở mức người dùng. Java và Docker không có, nhưng Bài 1 không cần.

**Mức đạt theo rubric:**

| Mục | Trạng thái |
|---|---|
| Sản phẩm chạy đúng (4đ) | 3 endpoint chạy đúng trên localhost. Còn thiếu việc bật Pages và đặt cổng 3000 Public, phải làm bằng tay. |
| Minh chứng và số liệu (2đ) | Có 10 số đo thật và trung bình. Còn thiếu 4 ảnh chụp màn hình, phải chụp bằng tay. |
| Câu hỏi phản biện (2đ) | Đủ 4 câu, có ví dụ và số đo thật. |
| Mã nguồn và an toàn (2đ) | Đạt: không có bí mật, không commit `.env` hay `node_modules/`. |

**Lỗi gặp phải và cách sửa:**
1. Không có Node và container là Alpine/musl. Em cài bản Node 22 musl từ unofficial-builds, có kiểm tra checksum, thay cho nvm.
2. Không ghi được PATH vào `~/.bashrc` vì bị chặn. Em dùng PATH tạm trong từng lệnh và ghi hướng dẫn `export PATH` vào báo cáo.
3. `pkill -f` trả mã 144. Server vẫn đã dừng, và em đã kiểm tra lại bằng `pgrep`.

**Việc còn lại phải làm bằng tay:**
- Bật GitHub Pages: Settings → Pages → Deploy from a branch → `main`, thư mục `/docs`.
- Mở terminal và chạy `export PATH="$HOME/.local/node22/bin:$PATH" && npm start`. Sau đó trong tab PORTS, đặt cổng 3000 thành **Public**.
- Chụp 4 ảnh: Codespace đang chạy, kết quả curl, trang API trên trình duyệt, trang Pages đã bật.
- Giữ Codespace chạy khi giảng viên chấm, không Stop trước đó.
- Nộp theo hướng dẫn lớp: dán URL repo, URL API, URL Pages, đính kèm ảnh và bảng số liệu.

## Trạng thái push

Commit `Hoàn thiện Bài 1: API Hello Cloud, trang Pages, báo cáo` đã tạo thành công ở máy cục bộ. Lệnh `git push origin main` **bị lỗi xác thực**, nguyên văn (exit 128):

```
fatal: could not read Username for 'https://github.com': No such device or address
```

Theo ràng buộc của bài, em dừng bước push: không tìm token, không tạo token, không đổi remote. Vì commit chưa lên GitHub, lệnh `git show origin/main:docs/index.html` chưa có nội dung mới.

Cách tự push: mở terminal của Codespace trong VS Code/trình duyệt, nơi GitHub tự cấp quyền git cho Codespace, rồi chạy `git push origin main`. Hoặc dùng nút **Sync Changes** trong tab Source Control.

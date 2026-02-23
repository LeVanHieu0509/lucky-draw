## Tổng quan dự án

**Random Name Picker / Lucky Draw** là ứng dụng web tĩnh cho phép quay số chọn người/ số trúng thưởng, sử dụng Web Animations API và AudioContext API, build bằng **Vite + TypeScript + Pug + SCSS**.

- **Mục đích**: công cụ quay số nhanh, chạy trực tiếp trên trình duyệt (cắm máy chiếu là dùng được), không cần backend.
- **Kiểu app**: Single Page Application chạy hoàn toàn phía client, build ra HTML/CSS/JS tĩnh trong thư mục `dist`.
- **Entry chính**: `src/main.ts` (giao diện quay tên), dùng layout Pug ở `src/index.pug` + `pages/landing.pug`.
- **Entry phụ**: trang `src/slot/index.pug` phục vụ giao diện quay số dạng "slot-number" (dùng `SlotNumber`).

### Tech stack chính

- **Bundler / Dev server**: Vite (`vite.config.js`)
- **Ngôn ngữ**: TypeScript (source chính trong `src/` và `src/assets/js/`)
- **Template**: Pug (`src/index.pug`, `src/pages/landing.pug`, `src/partials/**/*`)
- **Style**: SCSS (`src/assets/scss/**/*.scss`) build ra `style.css` / `output.css`
- **UI/UX**: Web Animations API, Canvas confetti (`canvas-confetti`), fullscreen API, custom sound effects
- **Âm thanh**: Web Audio (`AudioContext`) – class `SoundEffects`

### Luồng hoạt động tóm tắt

1. Người dùng mở trang quay số (build từ `index.pug`).
2. `main.ts` khởi tạo:
   - Bắt reference tới các nút `Draw`, `Stop`, `Fullscreen`, `Settings`, form nhập danh sách tên.
   - Tạo `SoundEffects` và `Slot` với `reelContainerSelector: "#reel"`.
3. Người dùng nhập danh sách tên trong phần cài đặt (mỗi dòng 1 tên), chọn:
   - Có **xóa người trúng khỏi danh sách** sau mỗi lần quay hay không.
   - Có **bật tiếng** hay không.
4. Nhấn **Draw**:
   - Nếu chưa có danh sách tên: tự mở popup Settings.
   - Nếu đã có: gọi `slot.spin()`, phát nhạc quay (`soundEffects.spin()`), khoá nút.
5. `Slot.spin()`:
   - Shuffle danh sách tên, replicate đến tối đa `maxReelItems`.
   - Render danh sách vào container `#reel`.
   - Tạo animation quay dọc (blur + translateY) bằng Web Animations API.
   - Khi kết thúc animation: giữ lại item cuối (winner), optionally xóa người trúng khỏi `nameList`.
6. Khi quay xong (`onSpinEnd`):
   - Hiển thị hiệu ứng sunburst + confetti (`canvas-confetti`).
   - Phát nhạc thắng (`soundEffects.win()`).
   - Mở lại nút Draw / Settings.

Các file chi tiết hơn được mô tả trong các tài liệu con:

- `docs/usage.md`: cách chạy, build, deploy, scripts.
- `docs/architecture.md`: kiến trúc thư mục, Vite config, Pug/SCSS integration.
- `docs/modules.md`: mô tả chi tiết các class `Slot`, `SlotNumber`, `SoundEffects`, constants, v.v.
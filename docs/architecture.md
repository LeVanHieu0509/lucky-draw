## Kiến trúc tổng thể

### Tổng quan

- **Kiểu app**: web client-side thuần tĩnh, không backend.
- **Build tool**: Vite (`vite.config.js`).
- **Root build**: `src`.
- **Output**: `dist` với cấu trúc:
  - `assets/js/*.js` – bundle JS
  - `assets/css/*.css` – CSS
  - `assets/images/*` – hình ảnh, favicon, touch icons

### Cấu trúc thư mục chính

- **`src/`** – root Vite
  - **`index.pug`** – layout chính, include:
    - `partials/csp.pug` – Content Security Policy
    - `partials/seo.pug`, `open-graph.pug` – meta SEO & OG
    - `partials/webapp.pug` – PWA meta, manifest link
    - `partials/gtm-script.html`, `gtm-noscript.html` – Google Tag Manager
    - `pages/landing.pug` – nội dung UI chính
    - `partials/footer.pug` – footer
  - **`slot/index.pug`** – trang slot-number, dùng `src/slot/index.ts`.
  - **`main.ts`** – entry TypeScript cho trang quay **tên** (import `./style.css`, `SoundEffects`, `Slot`).
  - **`index.ts` / `main.js`** – legacy/không quan trọng bằng `main.ts` (tuỳ bản cũ).
  - **`style.css`** – CSS build (từ SCSS) dùng cho root app.
  - **`assets/`**
    - **`images/`** – logo, confetti, sunburst, icons, touch icons, og-image.
    - **`scss/`** – SCSS chia module:
      - `_base.scss`, `_buttons.scss`, `_inputs.scss`, `_slot.scss`, v.v.
      - `index.scss` là entry SCSS.
    - **`js/`** – logic TS chính:
      - `app.ts` – phiên bản logic quay tên (gốc).
      - `Slot.ts` – core class quay tên.
      - `slot-number.ts` – class quay **số** dạng slot machine.
      - `SoundEffects.ts` – xử lý âm thanh bằng AudioContext.
      - `constants/` – constants cho audio (`pianoKeys.constant.ts`, `index.ts`).

### Cấu hình Vite (`vite.config.js`)

- **root**: `src`.
- **base**: `./` (phù hợp deploy static vào subdir).
- **plugins**:
  - `vite-plugin-pug` – build `.pug` thành `.html`.
- **build.rollupOptions.input**:
  - `main: src/index.html`
  - `slot: src/slot/index.html`
- **build.rollupOptions.output**:
  - `chunkFileNames: assets/js/[name].[hash].chunk.js`
  - `entryFileNames: assets/js/[name].[hash].js`
  - `assetFileNames`: route file `.css`, hình (`png/jpg/svg/ico`), `.js/.ts` theo thư mục con.
- **alias**:
  - `@ -> src`
  - `@images -> src/assets/images`
  - `@scss -> src/assets/scss`
  - `@js -> src/assets/js`
- **SCSS preprocessorOptions**:
  - Tự động `@use` `_colors.scss`, `_breakpoints.scss`, `_variables.scss` vào mọi file SCSS.

### Flow hiển thị chính

1. Trình duyệt tải HTML (từ Pug build ra) + CSS + JS.
2. `main.ts`/`slot/index.ts` chạy, query các DOM elements (button, input, canvas, etc.).
3. Tạo instance `SoundEffects` + `Slot` hoặc `SlotNumber`.
4. Gán event listener cho các nút (Draw/Spin/Stop, Settings, Fullscreen).
5. Khi người dùng tương tác:
   - Cập nhật `Slot.names` (tên hoặc list số).
   - Gọi `spin()` để play animation + âm thanh.
   - Sau khi kết thúc: hiển thị winner, dừng âm thanh, bắn confetti.

### PWA / Meta

- `manifest.json` trong `src`:
  - Định nghĩa name, short_name, icons (touch-icons trong `assets/images/touch-icons`).
- `partials/webapp.pug` thêm link tới manifest, theme-color, v.v.
- Dùng để app "Add to Home Screen" trên mobile.

Không có router SPA phức tạp; mỗi entry HTML tương ứng một màn (index, slot). Logic điều khiển UI nằm hoàn toàn trong TS ở `assets/js/` và `src/slot/index.ts`.
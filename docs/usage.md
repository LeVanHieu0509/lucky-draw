## Cách chạy và phát triển

### Cài đặt

- **Yêu cầu**:
  - Node.js >= 18
  - Yarn (khuyến nghị) hoặc npm

```bash
yarn install
# hoặc
npm install
```

### Chạy dev

Chạy server development của Vite (root là thư mục `src`):

```bash
yarn dev
# hoặc
npm run dev
```

- Vite sẽ mở trình duyệt tới trang chính (build từ `src/index.pug` -> `index.html`).
- Bạn chỉnh sửa file trong `src/` (TS, Pug, SCSS); Vite HMR sẽ tự reload.

### Build production

```bash
yarn build
# hoặc
npm run build
```

- Output sẽ nằm trong thư mục `dist/`.
- Cấu hình build nằm trong `vite.config.js` (root = `src`, `outDir = dist`).
- Có 2 entry HTML chính:
  - `src/index.html` (từ `index.pug`) => trang quay **tên**.
  - `src/slot/index.html` (từ `slot/index.pug`) => trang quay **số dạng slot-machine**.

### Preview bản build

```bash
yarn start
# hoặc
npm run start
```

Lệnh này chạy `vite preview` để serve thư mục `dist` với server tĩnh.

### Scripts khác

- **`yarn prepare`**: cài đặt Husky hooks.
- **`yarn release`**: chạy `standard-version` để tạo changelog + bump version theo conventional commits.
- **`yarn first-release`**: tương tự `release` nhưng force version đầu tiên `1.0.0`.
- **`yarn extract-latest-change-log`**: chạy script `scripts/extractLatestChangeLog.js` để lấy phần changelog mới nhất.

## Deploy

App build ra static files, có thể host ở bất kỳ static hosting nào (Netlify, Vercel, S3 + CloudFront, GitHub Pages, Nginx…).

Quy trình chung:

1. Build:
   ```bash
   yarn install
   yarn build
   ```
2. Upload toàn bộ nội dung trong thư mục `dist/` lên hosting tĩnh.
3. Nếu dùng CI/CD:
   - Bước 1: checkout code, setup Node + Yarn.
   - Bước 2: cache `node_modules` (tùy CI).
   - Bước 3: `yarn install && yarn build`.
   - Bước 4: deploy thư mục `dist/` (tuỳ provider).

Không có backend / database, nên chỉ cần đảm bảo static hosting phục vụ đúng thư mục `dist` là app hoạt động.
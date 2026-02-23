## Modules / Classes chính

### 1. `Slot` – quay tên (`src/assets/js/Slot.ts`)

**Vai trò**: core logic để quay **tên** (chuỗi string), render danh sách vào reel và chọn winner.

- **Props quan trọng**:
  - `nameList: string[]` – danh sách tên hiện tại.
  - `reelContainer: HTMLElement | null` – container chứa các div item.
  - `maxReelItems: number` – số item tối đa trên reel (mặc định 100 / có thể tùy chỉnh).
  - `shouldRemoveWinner: boolean` – có xóa người trúng khỏi list không.
  - `reelAnimation?: Animation` – instance Web Animations.
  - Callback: `onSpinStart`, `onSpinEnd`, `onNameListChanged`.

- **Setter / Getter**:
  - `set names(names: string[])` – set danh sách tên, clear reel, gọi `onNameListChanged`.
  - `get names(): string[]` – trả về list hiện tại.
  - `set shouldRemoveWinnerFromNameList(bool)` / `get shouldRemoveWinnerFromNameList()` – kiểm soát remove winner.

- **Phương thức chính**:
  - `private static shuffleNames<T>(array: T[]): T[]` – shuffle array.
  - `async spin(): Promise<boolean>`:
    - Validate list rỗng.
    - Gọi `onSpinStart`.
    - Shuffle, replicate list đến `maxReelItems`, render vào `reelContainer`.
    - Tạo animation `translateY` + blur bằng Web Animations API.
    - Khi kết thúc animation:
      - Lấy phần tử cuối làm winner.
      - Nếu `shouldRemoveWinner`: xóa winner khỏi `nameList`.
      - Xóa các item thừa, chỉ giữ winner.
      - Gọi `onSpinEnd`.
  - `async stop()`:
    - Hủy animation nếu còn.
    - Lấy item cuối hiện tại làm winner, render lại để chỉ hiển thị winner.
    - Gọi `onSpinEnd`.

### 2. `SlotNumber` – quay số (`src/assets/js/slot-number.ts`)

**Vai trò**: biến thể của `Slot`, dùng cho trang slot-machine quay **số** 3-digit.

- Logic gần giống `Slot`, nhưng:
  - `maxReelItems` nhỏ hơn (default 30).
  - `spin(number: string)` nhận tham số là chữ số cuối cùng mong muốn (ví dụ `"7"`) rồi concat vào cuối list random để đảm bảo kết quả.
  - Render DOM phức tạp hơn (tạo `.slotMachineContainer` + `.slot-item` + `.slot-number > span`).
  - `stop()` dựng lại DOM để chỉ hiển thị winner dạng slot-number.

### 3. `SoundEffects` (`src/assets/js/SoundEffects.ts`)

**Vai trò**: phát âm thanh cho hiệu ứng quay và thắng.

- Dựa trên **Web Audio API** (`AudioContext`).
- Import `PIANO_KEYS` từ `constants/pianoKeys.constant.ts` (mapping key -> frequency).

- **Props**:
  - `audioContext?: AudioContext` – context.
  - `currentOscillator: OscillatorNode | null` – oscillator hiện tại.
  - `currentGainNode: GainNode | null` – gain hiện tại.
  - `isMuted: boolean` – trạng thái mute.

- **API**:
  - `set mute(bool)` / `get mute()` – bật/tắt tiếng.
  - `private playSound(sound: SoundSeries[], config?: SoundConfig)`:
    - Tạo oscillator, gain node, set frequency theo timeline.
    - Tùy chọn `type`, `easeOut`, `volume`.
  - `win(): Promise<boolean>`:
    - Chuỗi nốt (C4, D4, E4, G4, E4, G4).
    - Gọi `playSound` với `triangle`, `volume = 1`, `easeOut = true`.
    - Trả Promise resolve sau khi chơi xong.
  - `spin(durationInSecond: number): Promise<boolean>`:
    - Loop 3 nốt D#3, C#3, C3 trong khoảng thời gian mong muốn.
    - `volume = 2`, `easeOut = false`.
  - `stop()`:
    - Set gain về 0 ngay lập tức, dừng oscillator, disconnect nodes.

### 4. Constants âm thanh (`src/assets/js/constants/`)

- `index.ts`: export `*` từ `pianoKeys.constant`.
- `pianoKeys.constant.ts`:
  - Khai báo `export type PianoKey = 'B8' | 'A#8' | ... | 'C0'`.
  - `export const PIANO_KEYS = { key: frequency }` – tần số từng nốt piano.

### 5. Entry scripts

#### 5.1 `src/main.ts`

- Import:
  - `./style.css`
  - `canvas-confetti`
  - `SoundEffects` từ `@js/SoundEffects`
  - `Slot` từ `@js/Slot`
- Tìm DOM elements: `draw-button`, `draw-button-stop`, `fullscreen-button`, `settings-button`, panel cài đặt, `sunburst`, `confetti-canvas`, `name-list`, checkbox remove-from-list, enable-sound.
- Khởi tạo:
  - `const soundEffects = new SoundEffects();`
  - `const slot = new Slot({ reelContainerSelector: '#reel', maxReelItems, onSpinStart, onSpinEnd, onNameListChanged })`.
- Định nghĩa:
  - Hàm `confettiAnimation()` và `stopWinningAnimation()`.
  - `onSpinStart()`: disable nút, play `soundEffects.spin()`.
  - `onSpinEnd()`: bắn confetti, show sunburst, play `soundEffects.win()`, enable lại nút.
- Event handlers:
  - Click `Draw`: nếu chưa có `slot.names` thì mở settings, ngược lại gọi `slot.spin()`.
  - Click `Stop` + phím Enter: dừng sound + slot, disable Stop.
  - `Fullscreen` toggle.
  - `Settings` open/close + save (đọc textarea, checkbox, set `slot.names`, `slot.shouldRemoveWinner...`, `soundEffects.mute`).

#### 5.2 `src/slot/index.ts`

- Import:
  - `canvas-confetti`
  - `SoundEffects`
  - `SlotNumber`
  - `../style.css`
- DOM: `.btn-yellow` (spin), `.btn-primary` (reset), `.input-min`, `.input-max`, `#confetti-canvas`, 3 container `slotMachineContainer1/2/3`.
- Khởi tạo 3 instance `SlotNumber` cho 3 cột.
- Hàm `rollAll()`:
  - Generate list số 0–9 cho 3 slot.
  - Lấy winner random thông qua `random_winner()` (dùng `sessionStorage` để không trùng số cho tới khi exhaust range).
  - Gọi `slot1.spin(num1)`, rồi delay 300ms, 500ms cho `slot2`, `slot3`.
- Hàm `random_winner()`:
  - Đảm bảo random trong `[min, max]` (từ input), tránh trùng với các winner cũ lưu trong `sessionStorage`.
  - Trả về 3-char string padded (`001`–`999`), tách thành array ký tự.
- Các hàm util: `disableButton`, `enableButton`, `validateMin`, `validateMax`.

### 6. Pug Templates

- `index.pug`:
  - Khung HTML, include meta, SEO, GTM, PWA.
  - Wrapper `#app` và include `pages/landing.pug` + footer.
- `pages/landing.pug`:
  - Layout UI chính cho quay tên (header, form nhập list, nút Draw/Settings, area hiển thị kết quả, canvas confetti, v.v.).
- `slot/index.pug`:
  - Layout giao diện 3 slot-number, input min/max, nút spin/reset.

### 7. Styles (SCSS)

- Chia nhỏ theo chức năng:
  - `_base.scss` – reset, base typography.
  - `_buttons.scss` – style nút (màu vàng, primary, disabled state).
  - `_inputs.scss` – style input, textarea.
  - `_slot.scss` – style reel, slot container, animation visual.
  - `_keyframes.scss` – khai báo keyframes chung.
  - `_colors.scss`, `_variables.scss`, `_breakpoints.scss` – token hoá màu, spacing, breakpoint.
  - `index.scss` – entry SCSS, được import trong pipeline build.

Khi cần chỉnh behavior quay, âm thanh, hoặc UI, chỉ cần tra vào file/module tương ứng trong tài liệu này để biết chỗ sửa trong source.
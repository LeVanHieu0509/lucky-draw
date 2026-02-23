/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line quotes
import structuredCloneImpl from "structured-clone";

// Polyfill global structuredClone nếu môi trường (trình duyệt cũ) chưa hỗ trợ
// eslint-disable-next-line quotes
if (typeof (globalThis as any).structuredClone === "undefined") {
  (globalThis as any).structuredClone = structuredCloneImpl;
}

import "../polyfills";
import confetti from "canvas-confetti";
import SoundEffects from "@js/SoundEffects";
import "../style.css";
import "./index.css";

(() => {
  const spinButton = document.querySelector(
    ".btn-yellow",
  ) as HTMLButtonElement | null;
  const stopButton = document.querySelector(
    ".btn-primary",
  ) as HTMLButtonElement | null;
  const inputMin = document.querySelector(
    ".input-min",
  ) as HTMLInputElement | null;
  const inputMax = document.querySelector(
    ".input-max",
  ) as HTMLInputElement | null;

  const leftEnvelope = document.getElementById("lixi-left");
  const resultModal = document.getElementById("result-modal");
  const resultNumber = document.getElementById("result-number");
  const resultClose = document.getElementById(
    "result-close",
  ) as HTMLButtonElement | null;
  const resultDialog = document.querySelector(
    ".result-modal__dialog",
  ) as HTMLElement | null;
  const resultEnvelope = document.querySelector(
    ".result-modal__envelope",
  ) as HTMLImageElement | null;
  const lixiBg = document.querySelector(".lixi-bg") as HTMLDivElement | null;

  const confettiCanvas = document.getElementById(
    "confetti-canvas",
  ) as HTMLCanvasElement | null;

  if (
    !spinButton ||
    !stopButton ||
    !inputMin ||
    !inputMax ||
    !leftEnvelope ||
    !resultModal ||
    !resultNumber ||
    !resultClose ||
    !resultDialog ||
    !resultEnvelope ||
    !lixiBg ||
    !(confettiCanvas instanceof HTMLCanvasElement)
  ) {
    console.error("Lixi: required DOM elements not found.");
    return;
  }

  const soundEffects = new SoundEffects();
  const CONFETTI_COLORS = [
    "#26ccff",
    "#a25afd",
    "#ff5e7e",
    "#88ff5a",
    "#fcff42",
    "#ffa62d",
    "#ff36ff",
  ];

  let confettiAnimationId: number | undefined;
  let isSpinning = false;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true,
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.getElementsByTagName("result-modal__dialog")[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6, },
      colors: [
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      ],
      scalar: confettiScale,
    });

    confettiAnimationId = window.requestAnimationFrame(confettiAnimation);
  };

  const stopWinningAnimation = () => {
    if (confettiAnimationId) {
      window.cancelAnimationFrame(confettiAnimationId);
    }
  };

  const disableButton = (button: HTMLButtonElement) => {
    button.classList.add("disabled");
    button.disabled = true;
  };

  const enableButton = (button: HTMLButtonElement) => {
    button.classList.remove("disabled");
    button.disabled = false;
  };

  const validateMin = (value: string, max: number): string => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0 || num > max) return "001";
    return num.toString().padStart(3, "0");
  };

  const validateMax = (value: string, min: number): string => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min || num > 999) return "999";
    return num.toString().padStart(3, "0");
  };

  const randomWinner = (): string => {
    const listWinner = sessionStorage.getItem("listWinner");

    let listWinnerNum: number[] = [];

    if (listWinner) {
      listWinnerNum = JSON.parse(listWinner) ?? [];
    }

    const min = parseInt(inputMin.value, 10);
    const max = parseInt(inputMax.value, 10);

    let randNum = Math.floor(Math.random() * (max - min + 1) + min);

    if (listWinnerNum.length === max - min + 1) {
      listWinnerNum = [];
      listWinnerNum.push(randNum);
      sessionStorage.setItem("listWinner", JSON.stringify(listWinnerNum));
      return randNum.toString().padStart(3, "0");
    }

    while (listWinnerNum.includes(randNum)) {
      randNum = Math.floor(Math.random() * (max - min + 1) + min);
    }

    listWinnerNum.push(randNum);

    sessionStorage.setItem("listWinner", JSON.stringify(listWinnerNum));

    return randNum.toString().padStart(3, "0");
  };

  const openModal = (value: string) => {
    resultNumber.textContent = value;
    resultModal.classList.add("result-modal--open");
    resultModal.setAttribute("aria-hidden", "false");
    confettiAnimation();
    soundEffects.win();
  };

  const closeModal = () => {
    resultModal.classList.remove("result-modal--open");
    resultModal.setAttribute("aria-hidden", "true");
    stopWinningAnimation();
    soundEffects.stop();
    leftEnvelope.classList.remove("lixi-left--shaking");
    leftEnvelope.classList.add("lixi-left--idle");
    enableButton(spinButton);
    disableButton(stopButton);
    inputMin.disabled = false;
    inputMax.disabled = false;
    // Reset background về trạng thái chỉ hiển thị nửa dưới
    lixiBg.classList.remove("lixi-bg--revealed");
  };

  const startSpin = () => {
    if (isSpinning) return;
    if (resultModal.classList.contains("result-modal--open")) return;

    inputMin.value = validateMin(inputMin.value, parseInt(inputMax.value, 10));
    inputMax.value = validateMax(inputMax.value, parseInt(inputMin.value, 10));

    isSpinning = true;
    disableButton(spinButton);
    enableButton(stopButton);
    inputMin.disabled = true;
    inputMax.disabled = true;

    leftEnvelope.classList.remove("lixi-left--idle");
    leftEnvelope.classList.add("lixi-left--shaking");

    stopWinningAnimation();
    // Keep drumroll running until user stops (we'll call soundEffects.stop())
    soundEffects.spin(60);
  };

  const stopSpin = () => {
    if (!isSpinning) return;
    isSpinning = false;

    soundEffects.stop();
    leftEnvelope.classList.remove("lixi-left--shaking");
    leftEnvelope.classList.add("lixi-left--idle");

    // Khi dừng quay, trượt background lên để lộ nửa trên
    lixiBg.classList.add("lixi-bg--revealed");

    const winner = randomWinner();
    disableButton(stopButton);

    window.setTimeout(() => {
      openModal(winner);
    }, 250);
  };

  inputMin.value = validateMin(inputMin.value, parseInt(inputMax.value, 10));
  inputMax.value = validateMax(inputMax.value, parseInt(inputMin.value, 10));

  inputMin.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    target.value = validateMin(target.value, parseInt(inputMax.value, 10));
    console.log(target.value);
  });

  inputMax.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    target.value = validateMax(target.value, parseInt(inputMin.value, 10));
  });

  // Initial state
  disableButton(stopButton);

  spinButton.addEventListener("click", () => startSpin());
  stopButton.addEventListener("click", () => stopSpin());
  resultClose.addEventListener("click", () => closeModal());

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (resultModal.classList.contains("result-modal--open")) {
        event.preventDefault();
        closeModal();
      }
      return;
    }

    if (event.key !== "Enter") return;
    if (resultModal.classList.contains("result-modal--open")) return;
    if (!isSpinning) startSpin();
    else stopSpin();
  });
})();

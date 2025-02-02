import confetti from "canvas-confetti";
import SoundEffects from "@js/SoundEffects";
import SlotNumber from "@js/slot-number";
import "../../src/style.css";

(() => {
  const spinButton = document.querySelector(".btn-yellow");
  const spinReset: any = document.querySelector(".btn-primary");

  const confettiCanvas = document.getElementById(
    "confetti-canvas",
  ) as HTMLCanvasElement | null;

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error(
      "Confetti canvas is not an instance of Canvas. This is possibly a bug.",
    );
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 300;
  const CONFETTI_COLORS = [
    "#26ccff",
    "#a25afd",
    "#ff5e7e",
    "#88ff5a",
    "#fcff42",
    "#ffa62d",
    "#ff36ff",
  ];

  let confettiAnimationId;

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
      document.getElementsByTagName("body")[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
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
    //     sunburstSvg.style.display = "none";
  };

  /**  Function to be trigger before spinning */
  const onSpinStart = () => {
    stopWinningAnimation();
    soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    await soundEffects.win();
  };

  /** Slot instance */
  /** Slot instances */
  const slot1 = new SlotNumber({
    reelContainerSelector: ".slotMachineContainer1",
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation,
  });

  const slot2 = new SlotNumber({
    reelContainerSelector: ".slotMachineContainer2",
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation,
  });

  const slot3 = new SlotNumber({
    reelContainerSelector: ".slotMachineContainer3",
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation,
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const rollAll = async () => {
    console.log("Rolling all slots...");
    let nameListTextArea = {
      value: `1 2 3 4 5 6 7 8 9`,
    };

    const nameList = nameListTextArea.value
      ? nameListTextArea.value.split(" ").filter((name) => Boolean(name.trim()))
      : [];

    // Gán danh sách số cho cả 3 slot
    slot1.names = [...nameList];
    slot2.names = [...nameList];
    slot3.names = [...nameList];

    // Sử dụng Promise.all để chạy đồng thời với độ trễ 100ms giữa mỗi slot
    Promise.all([
      slot1.spin(),
      delay(300).then(() => slot2.spin()),
      delay(500).then(() => slot3.spin()),
    ]).catch((error) => console.error("Error in rollAll:", error));
  };

  spinReset.addEventListener("click", () => {
    Promise.all([
      slot1.stop(),
      delay(300).then(() => slot2.stop()),
      delay(500).then(() => slot3.stop()),
    ]).catch((error) => console.error("Error in rollAll:", error));
    soundEffects.stop();
    onSpinEnd();
  });

  if (spinButton) {
    spinButton.addEventListener("click", () => {
      rollAll();
    });
  } else {
    console.error("Spin button not found!");
  }
})();

import confetti from 'canvas-confetti';
import SoundEffects from '@js/SoundEffects';
import SlotNumber from '@js/slot-number';
import '../style.css';

(() => {
  const spinButton = document.querySelector('.btn-yellow');
  const spinReset: any = document.querySelector('.btn-primary');
  const inputMin: any = document.querySelector('.input-min');
  const inputMax: any = document.querySelector('.input-max');

  const confettiCanvas = document.getElementById(
    'confetti-canvas'
  ) as HTMLCanvasElement | null;

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error(
      'Confetti canvas is not an instance of Canvas. This is possibly a bug.'
    );
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 400;
  const CONFETTI_COLORS = [
    '#26ccff',
    '#a25afd',
    '#ff5e7e',
    '#88ff5a',
    '#fcff42',
    '#ffa62d',
    '#ff36ff'
  ];

  let confettiAnimationId;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      ],
      scalar: confettiScale
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
  let checkEnter = false;
  /** Slot instance */
  /** Slot instances */
  const slot1 = new SlotNumber({
    reelContainerSelector: '.slotMachineContainer1',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation
  });

  const slot2 = new SlotNumber({
    reelContainerSelector: '.slotMachineContainer2',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation
  });

  const slot3 = new SlotNumber({
    reelContainerSelector: '.slotMachineContainer3',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const rollAll = async () => {
    const generateNameList = (start: number, end: number): string[] => {
      const list: string[] = [];
      for (let i = start; i <= end; i++) {
        list.push(i.toString());
      }

      return list;
    };

    const slot1NameList = generateNameList(0, 9);
    const slot2NameList = generateNameList(0, 9);
    const slot3NameList = generateNameList(0, 9);

    // Gán danh sách số cho cả 3 slot
    slot1.names = [...slot1NameList];
    slot2.names = [...slot2NameList];
    slot3.names = [...slot3NameList];

    const [num1, num2, num3] = random_winner();
    // Sử dụng Promise.all để chạy đồng thời với độ trễ 100ms giữa mỗi slot
    Promise.all([
      slot1.spin(num1),
      delay(300).then(() => slot2.spin(num2)),
      delay(500).then(() => slot3.spin(num3))
    ]).catch((error) => console.error('Error in rollAll:', error));
  };

  spinReset.addEventListener('click', () => {
    Promise.all([
      slot1.stop(),
      delay(300).then(() => slot2.stop()),
      delay(500).then(() => slot3.stop())
    ]).catch((error) => console.error('Error in rollAll:', error));
    soundEffects.stop();
    onSpinEnd();
    disableButton(spinReset);
    enableButton(spinButton);
    checkEnter = false;
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && checkEnter) {
      checkEnter = false;
      Promise.all([
        slot1.stop(),
        delay(300).then(() => slot2.stop()),
        delay(500).then(() => slot3.stop())
      ]).catch((error) => console.error('Error in rollAll:', error));
      soundEffects.stop();
      onSpinEnd();
      disableButton(spinReset);
      enableButton(spinButton);
    }
  });

  if (spinButton) {
    spinButton.addEventListener('click', () => {
      console.log('spin');
      rollAll();
      disableButton(spinButton);
      enableButton(spinReset);
      checkEnter = true;
    });
  } else {
    console.error('Spin button not found!');
  }

  const random_winner = () => {
    const listWinner = sessionStorage.getItem('listWinner');

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
      sessionStorage.setItem('listWinner', JSON.stringify(listWinnerNum));
      return randNum.toString().padStart(3, '0').split('');
    }

    while (listWinnerNum.includes(randNum)) {
      console.log('re-random', randNum);
      randNum = Math.floor(Math.random() * (max - min + 1) + min);
    }

    listWinnerNum.push(randNum);

    sessionStorage.setItem('listWinner', JSON.stringify(listWinnerNum));

    return randNum.toString().padStart(3, '0').split('');
  };

  const disableButton = (button: any) => {
    button.classList.add('disabled');
    button.style.opacity = '0.8';
    button.style.cursor = 'not-allowed';
    button.style.pointerEvents = 'none';
  };

  const enableButton = (button: any) => {
    button.classList.remove('disabled');
    button.style.opacity = '1';
    button.style.pointerEvents = 'auto';
    button.style.cursor = 'pointer';
  };

  const validateMin = (value: string, max: number): string => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0 || num > max) {
      return '001';
    }
    return num.toString().padStart(3, '0');
  };

  const validateMax = (value: string, min: number): string => {
    const num = parseInt(value, 10);

    if (isNaN(num) || num < min || num > 999) {
      return '999';
    }
    return num.toString().padStart(3, '0');
  };

  inputMin.value = validateMin(inputMin.value, parseInt(inputMax.value, 10));
  inputMax.value = validateMax(inputMax.value, parseInt(inputMin.value, 10));

  inputMin.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    target.value = validateMin(target.value, parseInt(inputMax.value, 10));
    console.log(target.value);
  });

  inputMax.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    target.value = validateMax(target.value, parseInt(inputMin.value, 10));
    console.log(target.value);
  });

  disableButton(spinReset);
})();

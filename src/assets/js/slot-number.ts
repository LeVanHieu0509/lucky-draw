interface SlotConfigurations {
  /** User configuration for maximum item inside a reel */
  maxReelItems?: number;
  /** User configuration for whether winner should be removed from name list */
  removeWinner?: boolean;
  /** User configuration for element selector which reel items should append to */
  reelContainerSelector: string;
  /** User configuration for callback function that runs before spinning reel */
  onSpinStart?: () => void;
  /** User configuration for callback function that runs after spinning reel */
  onSpinEnd?: () => void;

  /** User configuration for callback function that runs after user updates the name list */
  onNameListChanged?: () => void;
}

/** Class for doing random name pick and animation */
export default class SlotNumber {
  /** List of names to draw from */
  private nameList: string[];

  /** Whether there is a previous winner element displayed in reel */
  private havePreviousWinner: boolean;

  /** Container that hold the reel items */
  private reelContainer: HTMLElement | null;

  /** Maximum item inside a reel */
  private maxReelItems: NonNullable<SlotConfigurations["maxReelItems"]>;

  /** Whether winner should be removed from name list */
  private shouldRemoveWinner: NonNullable<SlotConfigurations["removeWinner"]>;

  /** Reel animation object instance */
  private reelAnimation?: Animation;

  /** Callback function that runs before spinning reel */
  private onSpinStart?: NonNullable<SlotConfigurations["onSpinStart"]>;

  /** Callback function that runs after spinning reel */
  private onSpinEnd?: NonNullable<SlotConfigurations["onSpinEnd"]>;

  /** Callback function that runs after spinning reel */
  private onNameListChanged?: NonNullable<
    SlotConfigurations["onNameListChanged"]
  >;
  /**
   * Constructor of Slot
   * @param maxReelItems  Maximum item inside a reel
   * @param removeWinner  Whether winner should be removed from name list
   * @param reelContainerSelector  The element ID of reel items to be appended
   * @param onSpinStart  Callback function that runs before spinning reel
   * @param onNameListChanged  Callback function that runs when user updates the name list
   */
  constructor({
    maxReelItems = 30,
    removeWinner = true,
    reelContainerSelector,
    onSpinStart,
    onSpinEnd,
    onNameListChanged,
  }: SlotConfigurations) {
    this.nameList = [];
    this.havePreviousWinner = false;
    this.reelContainer = document.querySelector(reelContainerSelector);
    this.maxReelItems = maxReelItems;
    this.shouldRemoveWinner = removeWinner;
    this.onSpinStart = onSpinStart;
    this.onSpinEnd = onSpinEnd;
    this.onNameListChanged = onNameListChanged;

    // Create reel animation
    this.reelAnimation = this.reelContainer?.animate(
      [
        { transform: "none", filter: "blur(0)" },
        { filter: "blur(1px)", offset: 0.5 },
        // Here we transform the reel to move up and stop at the top of last item
        // "(Number of item - 1) * height of reel item" of wheel is the amount of pixel to move up
        // 7.5rem * 16 = 120px, which equals to reel item height
        {
          transform: `translateY(-${(this.maxReelItems - 1) * (7.5 * 16)}px)`,
          filter: "blur(0)",
        },
      ],
      {
        duration: this.maxReelItems * 1, // 100ms for 1 item
        easing: "ease-in-out",
        iterations: 1,
      },
    );

    this.reelAnimation?.cancel();
  }

  /**
   * Setter for name list
   * @param names  List of names to draw a winner from
   */
  set names(names: string[]) {
    this.nameList = names;

    const reelItemsToRemove = this.reelContainer?.children
      ? Array.from(this.reelContainer.children)
      : [];

    reelItemsToRemove.forEach((element) => element.remove());

    this.havePreviousWinner = false;

    if (this.onNameListChanged) {
      this.onNameListChanged();
    }
  }

  /** Getter for name list */
  get names(): string[] {
    return this.nameList;
  }

  /**
   * Setter for shouldRemoveWinner
   * @param removeWinner  Whether the winner should be removed from name list
   */
  set shouldRemoveWinnerFromNameList(removeWinner: boolean) {
    this.shouldRemoveWinner = removeWinner;
  }

  /** Getter for shouldRemoveWinner */
  get shouldRemoveWinnerFromNameList(): boolean {
    return this.shouldRemoveWinner;
  }

  /**
   * Returns a new array where the items are shuffled
   * @template T  Type of items inside the array to be shuffled
   * @param array  The array to be shuffled
   * @returns The shuffled array
   */
  private static shuffleNames<T = unknown>(array: T[]): T[] {
    const keys = Object.keys(array) as unknown[] as number[];
    const result: T[] = [];
    for (let k = 0, n = keys.length; k < array.length && n > 0; k += 1) {
      // eslint-disable-next-line no-bitwise
      const i = (Math.random() * n) | 0;
      const key = keys[i];
      result.push(array[key]);
      n -= 1;
      const tmp = keys[n];
      keys[n] = key;
      keys[i] = tmp;
    }
    return result;
  }

  public async spin(): Promise<boolean> {
    console.log("spin", this.nameList);

    if (!this.nameList.length) {
      console.error("Name List is empty. Cannot start spinning.");
      return false;
    }

    // if (this.onSpinStart) {
    //   this.onSpinStart();
    // }

    const { reelContainer, reelAnimation } = this;
    if (!reelContainer || !reelAnimation) {
      return false;
    }

    let randomNames = SlotNumber.shuffleNames<string>(this.nameList);

    console.log({ randomNames });
    while (randomNames.length && randomNames.length < this.maxReelItems) {
      randomNames = [...randomNames, ...randomNames];
    }

    randomNames = randomNames.slice(0, this.maxReelItems);

    const fragment = document.createDocumentFragment();

    randomNames.forEach((name) => {
      const slotMachineContainer = document.createElement("div");
      slotMachineContainer.style.transition = "1.236s ease-out";
      slotMachineContainer.style.transform = "matrix(1, 0, 0, 1, 0, 0)";

      // Tạo div chứa slot-item
      const newReelItem = document.createElement("div");
      newReelItem.classList.add("slot-item", "ng-scope", "ng-enter-prepare");

      // Tạo div chứa số
      const slotNumber = document.createElement("div");
      slotNumber.classList.add("slot-number");

      // Tạo span chứa giá trị của slot
      const slotSpan = document.createElement("span");
      slotSpan.classList.add("ng-binding", "ng-scope");
      slotSpan.textContent = name; // Gán tên số ngẫu nhiên vào span

      // Gán span vào slotNumber
      slotNumber.appendChild(slotSpan);
      // Gán slotNumber vào newReelItem
      newReelItem.appendChild(slotNumber);
      // Gán newReelItem vào slotMachineContainer
      slotMachineContainer.appendChild(newReelItem);

      reelContainer.appendChild(slotMachineContainer);
    });

    // Sau đó, thêm slotMachineContainer vào DOM (ví dụ, vào reelContainer)

    console.info("Winner: ", randomNames[randomNames.length - 1]);
    console.info("Remaining: ", this.nameList);

    reelContainer.appendChild(fragment);

    // Tạo và phát animation
    this.reelAnimation = reelContainer.animate(
      [
        { transform: "none", filter: "blur(0)" },
        { filter: "blur(1px)", offset: 0.5 },
        {
          transform: `translateY(-${(this.maxReelItems - 1) * (7.5 * 16)}px)`,
          filter: "blur(0)",
        },
      ],
      {
        duration: this.maxReelItems * 100,
        easing: "ease-in-out",
        iterations: 1,
      },
    );

    if (this.reelAnimation) {
      await new Promise((resolve) => (this.reelAnimation!.onfinish = resolve));
    }

    Array.from(reelContainer.children)
      .slice(0, reelContainer.children.length - 1)
      .forEach((element) => element.remove());

    this.havePreviousWinner = true;

    // if (this.onSpinEnd) {
    //   this.onSpinEnd();
    // }
    return true;
  }

  public async stop() {
    if (this.reelAnimation) {
      this.reelAnimation.cancel(); // Hủy animation nếu có
    }

    // Lấy winner cuối cùng trên reel
    let winner: string | null = null;
    if (this.reelContainer) {
      const reelItems = this.reelContainer.children;
      if (reelItems.length > 0) {
        winner = reelItems[reelItems.length - 1].textContent;
      }

      const slotMachineContainer = document.createElement("div");
      slotMachineContainer.style.transition = "1.236s ease-out";
      slotMachineContainer.style.transform = "matrix(1, 0, 0, 1, 0, 0)";

      // Tạo div chứa slot-item
      const newReelItem = document.createElement("div");
      newReelItem.classList.add("slot-item", "ng-scope", "ng-enter-prepare");

      // Tạo div chứa số
      const slotNumber = document.createElement("div");
      slotNumber.classList.add("slot-number");

      // Tạo span chứa giá trị của slot
      const slotSpan = document.createElement("span");
      slotSpan.classList.add("ng-binding", "ng-scope");
      slotSpan.textContent = `${winner ?? ""}`; // Gán tên số ngẫu nhiên vào span

      // Gán span vào slotNumber
      slotNumber.appendChild(slotSpan);
      // Gán slotNumber vào newReelItem
      newReelItem.appendChild(slotNumber);
      // Gán newReelItem vào slotMachineContainer
      slotMachineContainer.appendChild(newReelItem);

      this.reelContainer.appendChild(slotMachineContainer);
    }

    // if (this.onSpinEnd) {
    //   this.onSpinEnd();
    // }
  }
}

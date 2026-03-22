import { getState, setState } from "../../state";
import { BitBar } from "./bit-bar";

if (!customElements.get("bit-bar")) {
  customElements.define("bit-bar", BitBar);
}

function createBar(): BitBar {
  const el = document.createElement("bit-bar") as BitBar;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  setState({ octets: [192, 168, 1, 0], prefix: 24 });
});

describe("BitBar", () => {
  it("renders 32 bit cells", () => {
    const bar = createBar();
    const bits = bar.querySelector("[data-ref='bits']")!;
    expect(bits.children.length).toBe(32);
  });

  it("first 24 cells are network class, last 8 are host class", () => {
    const bar = createBar();
    const bits = bar.querySelector("[data-ref='bits']")!;
    const cells = Array.from(bits.children);

    cells.slice(0, 24).forEach((cell) => {
      expect(cell.className).toContain("bitNetwork");
    });
    cells.slice(24).forEach((cell) => {
      expect(cell.className).toContain("bitHost");
    });
  });

  it("updates when prefix changes", () => {
    const bar = createBar();
    setState({ prefix: 16 });

    const bits = bar.querySelector("[data-ref='bits']")!;
    const cells = Array.from(bits.children);

    cells.slice(0, 16).forEach((cell) => {
      expect(cell.className).toContain("bitNetwork");
    });
    cells.slice(16).forEach((cell) => {
      expect(cell.className).toContain("bitHost");
    });
  });

  it("clicking a bit cell updates the prefix", () => {
    const bar = createBar();
    const bits = bar.querySelector("[data-ref='bits']")!;
    const cell15 = bits.children[15] as HTMLElement;

    cell15.click();
    expect(getState().prefix).toBe(16);
  });

  it("shows network/host bit counts in labels", () => {
    const bar = createBar();
    const networkLabel = bar.querySelector(
      "[data-ref='network-label']"
    ) as HTMLElement;
    const hostLabel = bar.querySelector(
      "[data-ref='host-label']"
    ) as HTMLElement;

    expect(networkLabel.textContent).toBe("Network: 24 bits");
    expect(hostLabel.textContent).toBe("Host: 8 bits");
  });
});

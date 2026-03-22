import { setState } from "../../state";
import { BinaryPanel } from "./binary-panel";

if (!customElements.get("binary-panel")) {
  customElements.define("binary-panel", BinaryPanel);
}

function createPanel(): BinaryPanel {
  const el = document.createElement("binary-panel") as BinaryPanel;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  setState({ octets: [192, 168, 1, 0], prefix: 24 });
});

describe("BinaryPanel", () => {
  it("renders a chevron toggle with label", () => {
    const panel = createPanel();
    const toggle = panel.querySelector("[data-ref='toggle']") as HTMLElement;
    expect(toggle).not.toBeNull();
    expect(toggle.textContent).toContain("Binary Breakdown");

    const chevron = panel.querySelector("[data-ref='chevron']");
    expect(chevron).not.toBeNull();
  });

  it("panel starts collapsed", () => {
    const panel = createPanel();
    const panelEl = panel.querySelector("[data-ref='panel']") as HTMLElement;
    expect(panelEl.classList.contains("panelOpen")).toBe(false);
  });

  it("expands on toggle click", () => {
    const panel = createPanel();
    const toggle = panel.querySelector("[data-ref='toggle']") as HTMLElement;
    toggle.click();

    const panelEl = panel.querySelector("[data-ref='panel']") as HTMLElement;
    expect(panelEl.classList.contains("panelOpen")).toBe(true);

    const chevron = panel.querySelector("[data-ref='chevron']") as HTMLElement;
    expect(chevron.classList.contains("chevronOpen")).toBe(true);
  });

  it("collapses on second toggle click", () => {
    const panel = createPanel();
    const toggle = panel.querySelector("[data-ref='toggle']") as HTMLElement;
    toggle.click();
    toggle.click();

    const panelEl = panel.querySelector("[data-ref='panel']") as HTMLElement;
    expect(panelEl.classList.contains("panelOpen")).toBe(false);
  });

  it("renders binary rows in tbody", () => {
    const panel = createPanel();
    const tbody = panel.querySelector("[data-ref='tbody']") as HTMLElement;
    const rows = tbody.querySelectorAll("tr");
    // 2 section headings + 8 data rows = 10
    expect(rows.length).toBe(10);
  });

  it("binary bits are colored by network/host", () => {
    const panel = createPanel();
    const tbody = panel.querySelector("[data-ref='tbody']") as HTMLElement;
    const networkBits = tbody.querySelectorAll("[class*='bitNetwork']");
    const hostBits = tbody.querySelectorAll("[class*='bitHost']");

    expect(networkBits.length).toBeGreaterThan(0);
    expect(hostBits.length).toBeGreaterThan(0);
  });

  it("updates when state changes", () => {
    const panel = createPanel();
    setState({ octets: [10, 0, 0, 0], prefix: 8 });

    const tbody = panel.querySelector("[data-ref='tbody']") as HTMLElement;
    const networkBits = tbody.querySelectorAll("[class*='bitNetwork']");
    // With /8, each data row has 8 network bits, 8 data rows = 64
    expect(networkBits.length).toBe(64);
  });
});

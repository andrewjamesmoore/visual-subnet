import { setIPv6State } from "../../ipv6-state";
import { IPv6BinaryPanel } from "./ipv6-binary-panel";

if (!customElements.get("ipv6-binary-panel")) {
  customElements.define("ipv6-binary-panel", IPv6BinaryPanel);
}

function createPanel(): IPv6BinaryPanel {
  const el = document.createElement("ipv6-binary-panel") as IPv6BinaryPanel;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  setIPv6State({
    address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    prefix: 64,
  });
});

describe("IPv6BinaryPanel", () => {
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

  it("renders section headings and data rows", () => {
    const panel = createPanel();
    const tbody = panel.querySelector("[data-ref='tbody']") as HTMLElement;
    const rows = tbody.querySelectorAll("tr");
    // 2 section headings + 7 data rows = 9
    expect(rows.length).toBe(9);
  });

  it("renders AND operation section", () => {
    const panel = createPanel();
    const tbody = panel.querySelector("[data-ref='tbody']") as HTMLElement;
    const headings = tbody.querySelectorAll("[class*='sectionHeading']");
    expect(headings[0].textContent).toContain("AND Operation");
  });

  it("shows AND row and result row styling", () => {
    const panel = createPanel();
    const andRow = panel.querySelector("[class*='andRow']");
    const resultRow = panel.querySelector("[class*='resultRow']");
    expect(andRow).not.toBeNull();
    expect(resultRow).not.toBeNull();
  });

  it("colors prefix bits differently from interface bits", () => {
    const panel = createPanel();
    const prefixBits = panel.querySelectorAll("[class*='bitPrefix']");
    const ifBits = panel.querySelectorAll("[class*='bitInterface']");
    expect(prefixBits.length).toBeGreaterThan(0);
    expect(ifBits.length).toBeGreaterThan(0);
  });

  it("renders hex column with full expanded addresses", () => {
    const panel = createPanel();
    const hexCols = panel.querySelectorAll("[class*='hexCol']");
    // 7 data rows = 7 hex cells
    expect(hexCols.length).toBe(7);
    expect(hexCols[0].textContent).toMatch(/^[0-9a-f]{4}(:[0-9a-f]{4}){7}$/);
  });

  it("updates when state changes", () => {
    const panel = createPanel();
    setIPv6State({ prefix: 48 });

    const tbody = panel.querySelector("[data-ref='tbody']") as HTMLElement;
    const rows = tbody.querySelectorAll("tr");
    expect(rows.length).toBe(9);
  });
});

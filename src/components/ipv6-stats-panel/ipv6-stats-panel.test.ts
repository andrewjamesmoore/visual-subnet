import { setIPv6State } from "../../ipv6-state";
import { IPv6StatsPanel } from "./ipv6-stats-panel";

if (!customElements.get("ipv6-stats-panel")) {
  customElements.define("ipv6-stats-panel", IPv6StatsPanel);
}

function createPanel(): IPv6StatsPanel {
  const el = document.createElement("ipv6-stats-panel") as IPv6StatsPanel;
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

describe("IPv6StatsPanel", () => {
  it("renders stat grid", () => {
    const panel = createPanel();
    const grid = panel.querySelector("[class*='statsGrid']");
    expect(grid).not.toBeNull();
  });

  it("displays prefix length", () => {
    const panel = createPanel();
    const text = panel.textContent!;
    expect(text).toContain("/64");
  });

  it("displays scope", () => {
    const panel = createPanel();
    const text = panel.textContent!;
    expect(text).toContain("Global Unicast");
  });

  it("updates when state changes", () => {
    const panel = createPanel();
    setIPv6State({ prefix: 48 });
    const text = panel.textContent!;
    expect(text).toContain("/48");
  });
});

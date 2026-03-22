import { setState } from "../../state";
import { StatsPanel } from "./stats-panel";

// Register the custom element for testing
if (!customElements.get("stats-panel")) {
  customElements.define("stats-panel", StatsPanel);
}

function createPanel(): StatsPanel {
  const el = document.createElement("stats-panel") as StatsPanel;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  setState({ octets: [192, 168, 1, 0], prefix: 24 });
});

describe("StatsPanel", () => {
  it("renders stat values for default state", () => {
    const panel = createPanel();
    const values = panel.querySelectorAll("[class*='statValue']");
    const texts = Array.from(values).map((v) => v.textContent);

    expect(texts).toContain("192.168.1.0");
    expect(texts).toContain("192.168.1.255");
    expect(texts).toContain("255.255.255.0");
    expect(texts).toContain("254");
  });

  it("updates when state changes", () => {
    const panel = createPanel();
    setState({ prefix: 16 });

    const values = panel.querySelectorAll("[class*='statValue']");
    const texts = Array.from(values).map((v) => v.textContent);

    expect(texts).toContain("255.255.0.0");
    expect(texts).toContain("65,534");
  });

  it("renders all expected stat labels", () => {
    const panel = createPanel();
    const labels = panel.querySelectorAll("[class*='statLabel']");
    const texts = Array.from(labels).map((l) => l.textContent);

    expect(texts).toContain("Network Address");
    expect(texts).toContain("Broadcast Address");
    expect(texts).toContain("Subnet Mask");
    expect(texts).toContain("Wildcard Mask");
    expect(texts).toContain("First Usable Host");
    expect(texts).toContain("Last Usable Host");
    expect(texts).toContain("Total Addresses");
    expect(texts).toContain("IP Class");
    expect(texts).toContain("Usable Hosts");
  });
});

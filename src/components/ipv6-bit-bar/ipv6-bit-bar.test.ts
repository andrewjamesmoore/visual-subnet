import { setIPv6State } from "../../ipv6-state";
import { IPv6BitBar } from "./ipv6-bit-bar";

if (!customElements.get("ipv6-bit-bar")) {
  customElements.define("ipv6-bit-bar", IPv6BitBar);
}

function createBar(): IPv6BitBar {
  const el = document.createElement("ipv6-bit-bar") as IPv6BitBar;
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

describe("IPv6BitBar", () => {
  it("renders prefix and host labels", () => {
    const bar = createBar();
    const prefixLabel = bar.querySelector(
      "[data-ref='prefix-label']"
    ) as HTMLElement;
    const hostLabel = bar.querySelector(
      "[data-ref='host-label']"
    ) as HTMLElement;
    expect(prefixLabel.textContent).toBe("Prefix: 64 bits");
    expect(hostLabel.textContent).toBe("Interface ID: 64 bits");
  });

  it("renders 8 group markers", () => {
    const bar = createBar();
    const container = bar.querySelector("[class='groupMarkers']") as HTMLElement;
    const markers = container.querySelectorAll("span");
    expect(markers.length).toBe(8);
  });

  it("renders a draggable divider", () => {
    const bar = createBar();
    const divider = bar.querySelector("[data-ref='divider']");
    expect(divider).not.toBeNull();
  });

  it("updates when state changes", () => {
    const bar = createBar();
    setIPv6State({ prefix: 48 });

    const prefixLabel = bar.querySelector(
      "[data-ref='prefix-label']"
    ) as HTMLElement;
    expect(prefixLabel.textContent).toBe("Prefix: 48 bits");
  });
});

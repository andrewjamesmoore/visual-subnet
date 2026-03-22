import { SubnetApp } from "./subnet-app";

jest.mock("@material/web/divider/divider", () => ({}));
jest.mock("@material/web/tabs/tabs", () => ({}));
jest.mock("@material/web/tabs/primary-tab", () => ({}));

if (!customElements.get("subnet-app")) {
  customElements.define("subnet-app", SubnetApp);
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("SubnetApp", () => {
  it("renders the header", () => {
    const app = document.createElement("subnet-app") as SubnetApp;
    document.body.appendChild(app);

    const h1 = app.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toContain("Visual Subnetting");
  });

  it("renders tabs", () => {
    const app = document.createElement("subnet-app") as SubnetApp;
    document.body.appendChild(app);

    const tabs = app.querySelector("md-tabs");
    expect(tabs).not.toBeNull();

    const primaryTabs = app.querySelectorAll("md-primary-tab");
    expect(primaryTabs.length).toBe(3);
  });

  it("renders IPv4 tab panel with components", () => {
    const app = document.createElement("subnet-app") as SubnetApp;
    document.body.appendChild(app);

    const ipv4Panel = app.querySelector("[data-ref='panel-ipv4']") as HTMLElement;
    expect(ipv4Panel).not.toBeNull();
    expect(ipv4Panel.hidden).toBe(false);

    expect(ipv4Panel.querySelector("ip-input")).not.toBeNull();
    expect(ipv4Panel.querySelector("bit-bar")).not.toBeNull();
    expect(ipv4Panel.querySelector("stats-panel")).not.toBeNull();
    expect(ipv4Panel.querySelector("binary-panel")).not.toBeNull();
  });

  it("renders IPv6 tab panel (hidden by default)", () => {
    const app = document.createElement("subnet-app") as SubnetApp;
    document.body.appendChild(app);

    const ipv6Panel = app.querySelector("[data-ref='panel-ipv6']") as HTMLElement;
    expect(ipv6Panel).not.toBeNull();
    expect(ipv6Panel.hidden).toBe(true);

    expect(ipv6Panel.querySelector("ipv6-input")).not.toBeNull();
    expect(ipv6Panel.querySelector("ipv6-bit-bar")).not.toBeNull();
    expect(ipv6Panel.querySelector("ipv6-stats-panel")).not.toBeNull();
    expect(ipv6Panel.querySelector("ipv6-binary-panel")).not.toBeNull();
  });

  it("renders 7-second tab panel (hidden by default)", () => {
    const app = document.createElement("subnet-app") as SubnetApp;
    document.body.appendChild(app);

    const secPanel = app.querySelector("[data-ref='panel-7sec']") as HTMLElement;
    expect(secPanel).not.toBeNull();
    expect(secPanel.hidden).toBe(true);

    expect(secPanel.querySelector("seven-second-panel")).not.toBeNull();
  });

  it("renders section titles in IPv4 panel", () => {
    const app = document.createElement("subnet-app") as SubnetApp;
    document.body.appendChild(app);

    const ipv4Panel = app.querySelector("[data-ref='panel-ipv4']") as HTMLElement;
    const titles = ipv4Panel.querySelectorAll("[class*='sectionTitle']");
    const texts = Array.from(titles).map((t) => t.textContent);

    expect(texts).toContain("Bit Allocation");
    expect(texts).toContain("Subnet Details");
  });
});

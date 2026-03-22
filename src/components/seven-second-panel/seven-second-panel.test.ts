import { getState, setState } from "../../state";
import { SevenSecondPanel } from "./seven-second-panel";

if (!customElements.get("seven-second-panel")) {
  customElements.define("seven-second-panel", SevenSecondPanel);
}

function createPanel(): SevenSecondPanel {
  const el = document.createElement(
    "seven-second-panel"
  ) as SevenSecondPanel;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  setState({ octets: [192, 168, 1, 0], prefix: 24 });
});

describe("SevenSecondPanel", () => {
  it("renders directly (no toggle button)", () => {
    const panel = createPanel();
    expect(panel.querySelector("[data-ref='toggle']")).toBeNull();
    expect(panel.querySelector("h3")).not.toBeNull();
  });

  it("renders the write-up", () => {
    const panel = createPanel();
    const writeup = panel.querySelector("h3");
    expect(writeup).not.toBeNull();
    expect(writeup!.textContent).toContain("7-Second");
  });

  it("renders Table 1 with 32 data rows", () => {
    const panel = createPanel();
    const body = panel.querySelector(
      "[data-ref='table1-body']"
    ) as HTMLElement;
    const dataRows = body.querySelectorAll("tr[data-prefix]");
    expect(dataRows.length).toBe(32);
  });

  it("renders Table 2 with 32 data rows", () => {
    const panel = createPanel();
    const body = panel.querySelector(
      "[data-ref='table2-body']"
    ) as HTMLElement;
    const dataRows = body.querySelectorAll("tr[data-prefix]");
    expect(dataRows.length).toBe(32);
  });

  it("highlights the active prefix row in both tables", () => {
    const panel = createPanel();

    const t1Body = panel.querySelector(
      "[data-ref='table1-body']"
    ) as HTMLElement;
    const t2Body = panel.querySelector(
      "[data-ref='table2-body']"
    ) as HTMLElement;

    const active1 = t1Body.querySelector("[class*='chartRowActive']");
    const active2 = t2Body.querySelector("[class*='chartRowActive']");

    expect(active1).not.toBeNull();
    expect(active1!.getAttribute("data-prefix")).toBe("24");
    expect(active2).not.toBeNull();
    expect(active2!.getAttribute("data-prefix")).toBe("24");
  });

  it("clicking a Table 1 row changes the prefix", () => {
    const panel = createPanel();
    const body = panel.querySelector(
      "[data-ref='table1-body']"
    ) as HTMLElement;
    const row26 = body.querySelector("[data-prefix='26']") as HTMLElement;
    const td = row26.querySelector("td") as HTMLElement;
    td.click();

    expect(getState().prefix).toBe(26);
  });

  it("clicking a Table 2 row changes the prefix", () => {
    const panel = createPanel();
    const body = panel.querySelector(
      "[data-ref='table2-body']"
    ) as HTMLElement;
    const row28 = body.querySelector("[data-prefix='28']") as HTMLElement;
    const td = row28.querySelector("td") as HTMLElement;
    td.click();

    expect(getState().prefix).toBe(28);
  });

  it("updates highlight when state changes", () => {
    const panel = createPanel();
    setState({ prefix: 28 });

    const t1Body = panel.querySelector(
      "[data-ref='table1-body']"
    ) as HTMLElement;
    const active = t1Body.querySelector("[class*='chartRowActive']");
    expect(active).not.toBeNull();
    expect(active!.getAttribute("data-prefix")).toBe("28");
  });

  it("renders walkthrough with 3 steps", () => {
    const panel = createPanel();
    const walkthrough = panel.querySelector(
      "[data-ref='walkthrough']"
    ) as HTMLElement;
    const stepNumbers = walkthrough.querySelectorAll(
      "[class*='stepNumber']"
    );
    expect(stepNumbers.length).toBe(7);
    expect(stepNumbers[0].textContent).toBe("Step 1");
    expect(stepNumbers[1].textContent).toBe("Step 2");
    expect(stepNumbers[2].textContent).toBe("Step 3");
    expect(stepNumbers[3].textContent).toBe("Step 4");
    expect(stepNumbers[4].textContent).toBe("Step 5");
    expect(stepNumbers[5].textContent).toBe("Step 6");
    expect(stepNumbers[6].textContent).toBe("Step 7");
  });

  it("includes octet group headers in both tables", () => {
    const panel = createPanel();
    const t1Body = panel.querySelector(
      "[data-ref='table1-body']"
    ) as HTMLElement;
    const t2Body = panel.querySelector(
      "[data-ref='table2-body']"
    ) as HTMLElement;
    const groups1 = t1Body.querySelectorAll("[class*='octetGroup']");
    const groups2 = t2Body.querySelectorAll("[class*='octetGroup']");
    expect(groups1.length).toBe(4);
    expect(groups2.length).toBe(4);
  });
});

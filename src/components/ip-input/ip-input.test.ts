import { getState, setState } from "../../state";
import { IpInput } from "./ip-input";

// Mock Material Web text field — jsdom can't handle custom element internals
jest.mock("@material/web/textfield/outlined-text-field", () => ({}));

if (!customElements.get("ip-input")) {
  customElements.define("ip-input", IpInput);
}

function createInput(): IpInput {
  const el = document.createElement("ip-input") as IpInput;
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  setState({ octets: [192, 168, 1, 0], prefix: 24 });
});

describe("IpInput", () => {
  it("renders the text field element", () => {
    const input = createInput();
    const tf = input.querySelector("md-outlined-text-field");
    expect(tf).not.toBeNull();
  });

  it("updates state when valid CIDR is entered", () => {
    const input = createInput();
    const tf = input.querySelector(
      "md-outlined-text-field"
    ) as unknown as HTMLInputElement;

    // Simulate typing
    tf.value = "10.0.0.0/8";
    tf.dispatchEvent(new Event("input"));

    expect(getState().octets).toEqual([10, 0, 0, 0]);
    expect(getState().prefix).toBe(8);
  });

  it("sets error attribute on invalid input", () => {
    const input = createInput();
    const tf = input.querySelector("md-outlined-text-field") as HTMLElement;

    (tf as unknown as HTMLInputElement).value = "not-valid";
    tf.dispatchEvent(new Event("input"));

    expect(tf.hasAttribute("error")).toBe(true);
  });

  it("clears error on valid input", () => {
    const input = createInput();
    const tf = input.querySelector("md-outlined-text-field") as HTMLElement;

    (tf as unknown as HTMLInputElement).value = "not-valid";
    tf.dispatchEvent(new Event("input"));
    expect(tf.hasAttribute("error")).toBe(true);

    (tf as unknown as HTMLInputElement).value = "172.16.0.0/12";
    tf.dispatchEvent(new Event("input"));
    expect(tf.hasAttribute("error")).toBe(false);
  });
});

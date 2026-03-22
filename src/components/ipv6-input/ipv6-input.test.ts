import { setIPv6State } from "../../ipv6-state";
import { IPv6Input } from "./ipv6-input";

jest.mock("@material/web/textfield/outlined-text-field", () => ({}));

if (!customElements.get("ipv6-input")) {
  customElements.define("ipv6-input", IPv6Input);
}

function createInput(): IPv6Input {
  const el = document.createElement("ipv6-input") as IPv6Input;
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

describe("IPv6Input", () => {
  it("renders the text field", () => {
    const input = createInput();
    const field = input.querySelector("md-outlined-text-field");
    expect(field).not.toBeNull();
  });

  it("has IPv6 placeholder", () => {
    const input = createInput();
    const field = input.querySelector("md-outlined-text-field") as HTMLElement;
    expect(field.getAttribute("placeholder")).toBe("2001:db8::1/64");
  });
});

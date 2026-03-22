import "@material/web/textfield/outlined-text-field";
import {
  getIPv6State,
  setIPv6State,
  onIPv6StateChange,
  type IPv6State,
} from "../../ipv6-state";
import { parseIPv6Cidr, formatIPv6 } from "../../ipv6-math";
import css from "./ipv6-input.module.css";

export class IPv6Input extends HTMLElement {
  private input!: HTMLInputElement;
  private cleanup!: () => void;
  private suppressNextStateUpdate = false;

  connectedCallback() {
    this.className = css.host;
    this.innerHTML = `
      <md-outlined-text-field
        label="IPv6 Subnet (CIDR notation)"
        placeholder="2001:db8::1/64"
        supporting-text="Enter an IPv6 address with prefix length, e.g. 2001:db8::/32"
        spellcheck="false"
        autocomplete="off"
      ></md-outlined-text-field>
    `;

    this.input = this.querySelector(
      "md-outlined-text-field"
    ) as unknown as HTMLInputElement;

    const state = getIPv6State();
    requestAnimationFrame(() => {
      this.input.value = `${state.address}/${state.prefix}`;
    });

    this.input.addEventListener("input", () => this.handleInput());
    this.cleanup = onIPv6StateChange((s) => this.handleStateChange(s));
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private handleInput() {
    const value = this.input.value;
    const parsed = parseIPv6Cidr(value);

    if (parsed) {
      this.input.removeAttribute("error");
      this.input.removeAttribute("error-text");
      this.suppressNextStateUpdate = true;
      setIPv6State({
        address: formatIPv6(parsed.addr),
        prefix: parsed.prefix,
      });
    } else if (value.trim() !== "") {
      this.input.setAttribute("error", "");
      this.input.setAttribute(
        "error-text",
        "Enter a valid IPv6 CIDR like 2001:db8::1/64"
      );
    } else {
      this.input.removeAttribute("error");
      this.input.removeAttribute("error-text");
    }
  }

  private handleStateChange(state: IPv6State) {
    if (this.suppressNextStateUpdate) {
      this.suppressNextStateUpdate = false;
      return;
    }
    this.input.value = `${state.address}/${state.prefix}`;
    this.input.removeAttribute("error");
    this.input.removeAttribute("error-text");
  }
}

import "@material/web/textfield/outlined-text-field";
import { getState, setState, onStateChange, type SubnetState } from "../../state";
import { parseIpCidr } from "../../subnet-math";
import css from "./ip-input.module.css";

export class IpInput extends HTMLElement {
  private input!: HTMLInputElement;
  private cleanup!: () => void;
  private suppressNextStateUpdate = false;

  connectedCallback() {
    this.className = css.host;
    this.innerHTML = `
      <md-outlined-text-field
        label="Subnet (CIDR notation)"
        placeholder="192.168.1.0/24"
        supporting-text="Enter an IP address with prefix length, e.g. 10.0.0.0/8"
        spellcheck="false"
        autocomplete="off"
      ></md-outlined-text-field>
    `;

    this.input = this.querySelector("md-outlined-text-field") as unknown as HTMLInputElement;

    const state = getState();
    requestAnimationFrame(() => {
      this.input.value = `${state.octets.join(".")}/${state.prefix}`;
    });

    this.input.addEventListener("input", () => this.handleInput());
    this.cleanup = onStateChange((s) => this.handleStateChange(s));
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private handleInput() {
    const value = this.input.value;
    const parsed = parseIpCidr(value);

    if (parsed) {
      this.input.removeAttribute("error");
      this.input.removeAttribute("error-text");
      this.suppressNextStateUpdate = true;
      setState({ octets: parsed.octets, prefix: parsed.prefix });
    } else if (value.trim() !== "") {
      this.input.setAttribute("error", "");
      this.input.setAttribute("error-text", "Enter a valid CIDR like 192.168.1.0/24");
    } else {
      this.input.removeAttribute("error");
      this.input.removeAttribute("error-text");
    }
  }

  private handleStateChange(state: SubnetState) {
    if (this.suppressNextStateUpdate) {
      this.suppressNextStateUpdate = false;
      return;
    }
    this.input.value = `${state.octets.join(".")}/${state.prefix}`;
    this.input.removeAttribute("error");
    this.input.removeAttribute("error-text");
  }
}

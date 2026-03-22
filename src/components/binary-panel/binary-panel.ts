import { getState, onStateChange } from "../../state";
import * as sm from "../../subnet-math";
import css from "./binary-panel.module.css";

interface BinaryRow {
  label: string;
  value: number;
  isAndRow?: boolean;
  isResult?: boolean;
}

export class BinaryPanel extends HTMLElement {
  private chevron!: HTMLElement;
  private panel!: HTMLElement;
  private tbody!: HTMLElement;
  private cleanup!: () => void;
  private isOpen = false;

  connectedCallback() {
    this.className = css.host;
    this.innerHTML = `
      <div class="${css.toggle}" data-ref="toggle">
        <span class="${css.toggleLabel}">Binary Breakdown</span>
        <span class="${css.chevron}" data-ref="chevron">&#x203A;</span>
      </div>
      <div class="${css.panel}" data-ref="panel">
        <div class="${css.panelInner}">
          <table class="${css.binaryTable}">
            <thead>
              <tr>
                <th class="${css.th}"></th>
                <th class="${css.th}">Binary</th>
                <th class="${css.th}">Decimal</th>
              </tr>
            </thead>
            <tbody data-ref="tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    this.chevron = this.ref("chevron");
    this.panel = this.ref("panel");
    this.tbody = this.ref("tbody");

    this.ref("toggle").addEventListener("click", () => this.togglePanel());

    this.render();
    this.cleanup = onStateChange(() => this.render());
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private ref(name: string): HTMLElement {
    return this.querySelector(`[data-ref="${name}"]`) as HTMLElement;
  }

  private togglePanel() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle(css.panelOpen, this.isOpen);
    this.chevron.classList.toggle(css.chevronOpen, this.isOpen);
  }

  private render() {
    const { octets, prefix } = getState();
    const ip = sm.ipToNumber(octets);
    const mask = sm.prefixToMask(prefix);
    const net = sm.networkAddress(ip, prefix);
    const bcast = sm.broadcastAddress(ip, prefix);
    const wild = sm.wildcardMask(prefix);

    const sections: (BinaryRow | { heading: string })[] = [
      { heading: "AND Operation \u2014 How the network address is calculated" },
      { label: "IP Address", value: ip },
      { label: "AND Subnet Mask", value: mask, isAndRow: true },
      { label: "= Network Address", value: net, isResult: true },
      { heading: "All Addresses" },
      { label: "IP Address", value: ip },
      { label: "Subnet Mask", value: mask },
      { label: "Wildcard Mask", value: wild },
      { label: "Network Address", value: net },
      { label: "Broadcast Address", value: bcast },
    ];

    this.tbody.innerHTML = "";

    for (const item of sections) {
      if ("heading" in item) {
        const tr = document.createElement("tr");
        tr.className = css.sectionHeading;
        const td = document.createElement("td");
        td.colSpan = 3;
        td.textContent = item.heading;
        tr.appendChild(td);
        this.tbody.appendChild(tr);
        continue;
      }

      const tr = document.createElement("tr");
      if (item.isAndRow) tr.className = css.andRow;
      if (item.isResult) tr.className = css.resultRow;

      const labelTd = document.createElement("td");
      labelTd.className = css.rowLabel;
      if (item.isAndRow || item.isResult) {
        labelTd.className = `${css.rowLabel} ${css.andLabel}`;
      }
      labelTd.textContent = item.label;

      const binaryTd = document.createElement("td");
      binaryTd.className = css.binaryBits;
      binaryTd.appendChild(this.renderBits(item.value, prefix));

      const decimalTd = document.createElement("td");
      decimalTd.className = css.decimalCol;
      decimalTd.textContent = sm.formatIp(item.value);

      tr.appendChild(labelTd);
      tr.appendChild(binaryTd);
      tr.appendChild(decimalTd);
      this.tbody.appendChild(tr);
    }
  }

  private renderBits(value: number, prefix: number): DocumentFragment {
    const frag = document.createDocumentFragment();
    const octets = sm.toBinaryOctets(value);

    for (let octet = 0; octet < 4; octet++) {
      if (octet > 0) {
        const dot = document.createElement("span");
        dot.className = css.dotSep;
        dot.textContent = ".";
        frag.appendChild(dot);
      }
      for (let bit = 0; bit < 8; bit++) {
        const idx = octet * 8 + bit;
        const span = document.createElement("span");
        span.className = idx < prefix ? css.bitNetwork : css.bitHost;
        span.textContent = octets[octet][bit];
        frag.appendChild(span);
      }
    }

    return frag;
  }
}

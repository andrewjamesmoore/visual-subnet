import { getIPv6State, onIPv6StateChange } from "../../ipv6-state";
import * as v6 from "../../ipv6-math";
import css from "./ipv6-binary-panel.module.css";

interface BinaryRow {
  label: string;
  value: bigint;
  isAndRow?: boolean;
  isResult?: boolean;
}

export class IPv6BinaryPanel extends HTMLElement {
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
          <div class="${css.tableWrap}">
            <table class="${css.binaryTable}">
              <thead>
                <tr>
                  <th class="${css.th}"></th>
                  <th class="${css.th}">Binary</th>
                  <th class="${css.th}">Hex</th>
                </tr>
              </thead>
              <tbody data-ref="tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.chevron = this.ref("chevron");
    this.panel = this.ref("panel");
    this.tbody = this.ref("tbody");

    this.ref("toggle").addEventListener("click", () => this.togglePanel());

    this.render();
    this.cleanup = onIPv6StateChange(() => this.render());
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
    const state = getIPv6State();
    const addr = v6.parseIPv6(state.address);
    if (addr === null) return;

    const prefix = state.prefix;
    const mask = v6.ipv6PrefixToMask(prefix);
    const net = v6.ipv6NetworkAddress(addr, prefix);
    const last = v6.ipv6LastAddress(addr, prefix);

    const sections: (BinaryRow | { heading: string })[] = [
      { heading: "AND Operation \u2014 How the network prefix is calculated" },
      { label: "IPv6 Address", value: addr },
      { label: "AND Prefix Mask", value: mask, isAndRow: true },
      { label: "= Network Prefix", value: net, isResult: true },
      { heading: "All Addresses" },
      { label: "IPv6 Address", value: addr },
      { label: "Prefix Mask", value: mask },
      { label: "Network Prefix", value: net },
      { label: "Last Address", value: last },
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

      const hexTd = document.createElement("td");
      hexTd.className = css.hexCol;
      hexTd.textContent = v6.formatIPv6Full(item.value);

      tr.appendChild(labelTd);
      tr.appendChild(binaryTd);
      tr.appendChild(hexTd);
      this.tbody.appendChild(tr);
    }
  }

  private renderBits(value: bigint, prefix: number): DocumentFragment {
    const frag = document.createDocumentFragment();
    const binGroups = v6.ipv6ToBinaryGroups(value);

    for (let g = 0; g < 8; g++) {
      if (g > 0) {
        const sep = document.createElement("span");
        sep.className = css.groupSep;
        sep.textContent = ":";
        frag.appendChild(sep);
      }

      const groupBitStart = g * 16;
      for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
          const space = document.createElement("span");
          space.className = css.nibbleSep;
          space.textContent = " ";
          frag.appendChild(space);
        }

        const bitIdx = groupBitStart + i;
        const span = document.createElement("span");
        span.className = bitIdx < prefix ? css.bitPrefix : css.bitInterface;
        span.textContent = binGroups[g][i];
        frag.appendChild(span);
      }
    }

    return frag;
  }
}

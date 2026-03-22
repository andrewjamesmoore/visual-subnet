import { getState, setState, onStateChange } from "../../state";
import { ipToNumber } from "../../subnet-math";
import css from "./bit-bar.module.css";

export class BitBar extends HTMLElement {
  private bitsEl!: HTMLElement;
  private dividerEl!: HTMLElement;
  private prefixLabel!: HTMLElement;
  private networkLabel!: HTMLElement;
  private hostLabel!: HTMLElement;
  private cleanup!: () => void;
  private isDragging = false;

  connectedCallback() {
    this.className = css.host;
    this.innerHTML = `
      <div class="${css.barLabels}">
        <span class="${css.barLabelNetwork}" data-ref="network-label">Network: 24 bits</span>
        <span class="${css.barLabelHost}" data-ref="host-label">Host: 8 bits</span>
      </div>
      <div class="${css.barContainer}">
        <div class="${css.bits}" data-ref="bits"></div>
        <div class="${css.divider}" data-ref="divider"></div>
      </div>
      <div class="${css.octetMarkers}">
        <span class="${css.octetMarker}">Octet 1</span>
        <span class="${css.octetMarker}">Octet 2</span>
        <span class="${css.octetMarker}">Octet 3</span>
        <span class="${css.octetMarker}">Octet 4</span>
      </div>
      <div class="${css.prefixDisplay}" data-ref="prefix-display"></div>
    `;

    this.bitsEl = this.ref("bits");
    this.dividerEl = this.ref("divider");
    this.prefixLabel = this.ref("prefix-display");
    this.networkLabel = this.ref("network-label");
    this.hostLabel = this.ref("host-label");

    this.buildBitCells();
    this.render(getState().prefix, getState().octets);

    this.dividerEl.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.bitsEl.addEventListener("click", (e) => this.onBitClick(e));

    this.cleanup = onStateChange((s) => this.render(s.prefix, s.octets));
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private ref(name: string): HTMLElement {
    return this.querySelector(`[data-ref="${name}"]`) as HTMLElement;
  }

  private buildBitCells() {
    for (let i = 0; i < 32; i++) {
      const cell = document.createElement("div");
      cell.dataset.index = String(i);
      this.bitsEl.appendChild(cell);
    }
  }

  private render(prefix: number, octets: number[]) {
    const ipNum = ipToNumber(octets);
    const cells = this.bitsEl.children;

    for (let i = 0; i < 32; i++) {
      const cell = cells[i] as HTMLElement;
      const isNetwork = i < prefix;
      cell.className = isNetwork ? css.bitNetwork : css.bitHost;
      const bitValue = (ipNum >>> (31 - i)) & 1;
      cell.textContent = String(bitValue);
    }

    this.positionDivider(prefix);
    this.networkLabel.textContent = `Network: ${prefix} bits`;
    this.hostLabel.textContent = `Host: ${32 - prefix} bits`;
    this.prefixLabel.innerHTML = `Click a bit or drag the divider \u2014 <strong>/${prefix}</strong>`;
  }

  private positionDivider(prefix: number) {
    const fraction = prefix / 32;
    this.dividerEl.style.left = `${fraction * 100}%`;
    this.dividerEl.style.display =
      prefix === 0 || prefix === 32 ? "none" : "flex";
  }

  private onPointerDown(e: PointerEvent) {
    e.preventDefault();
    this.isDragging = true;
    this.dividerEl.classList.add(css.dividerDragging);
    this.dividerEl.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      if (!this.isDragging) return;
      const rect = this.bitsEl.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const fraction = Math.max(0, Math.min(1, x / rect.width));
      const newPrefix = Math.round(fraction * 32);
      if (newPrefix !== getState().prefix) {
        setState({ prefix: newPrefix });
      }
    };

    const onUp = () => {
      this.isDragging = false;
      this.dividerEl.classList.remove(css.dividerDragging);
      this.dividerEl.removeEventListener("pointermove", onMove);
      this.dividerEl.removeEventListener("pointerup", onUp);
      this.dividerEl.removeEventListener("lostpointercapture", onUp);
    };

    this.dividerEl.addEventListener("pointermove", onMove);
    this.dividerEl.addEventListener("pointerup", onUp);
    this.dividerEl.addEventListener("lostpointercapture", onUp);
  }

  private onBitClick(e: MouseEvent) {
    if (this.isDragging) return;
    const target = e.target as HTMLElement;
    if (!target.dataset.index) return;
    setState({ prefix: parseInt(target.dataset.index, 10) + 1 });
  }
}

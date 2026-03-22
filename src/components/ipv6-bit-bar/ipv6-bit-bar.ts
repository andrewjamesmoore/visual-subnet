import { getIPv6State, setIPv6State, onIPv6StateChange } from "../../ipv6-state";
import css from "./ipv6-bit-bar.module.css";

export class IPv6BitBar extends HTMLElement {
  private barEl!: HTMLElement;
  private prefixSection!: HTMLElement;
  private hostSection!: HTMLElement;
  private dividerEl!: HTMLElement;
  private prefixLabel!: HTMLElement;
  private hostLabel!: HTMLElement;
  private prefixDisplay!: HTMLElement;
  private cleanup!: () => void;
  private isDragging = false;

  connectedCallback() {
    this.className = css.host;
    this.innerHTML = `
      <div class="${css.barLabels}">
        <span class="${css.barLabelPrefix}" data-ref="prefix-label">Prefix: 64 bits</span>
        <span class="${css.barLabelHost}" data-ref="host-label">Interface ID: 64 bits</span>
      </div>
      <div class="${css.barContainer}" data-ref="bar">
        <div class="${css.prefixSection}" data-ref="prefix-section"></div>
        <div class="${css.divider}" data-ref="divider"></div>
        <div class="${css.hostSection}" data-ref="host-section"></div>
      </div>
      <div class="${css.groupMarkers}">
        ${Array.from({ length: 8 }, (_, i) => `<span class="${css.groupMarker}">Group ${i + 1}</span>`).join("")}
      </div>
      <div class="${css.prefixDisplay}" data-ref="prefix-display"></div>
    `;

    this.barEl = this.ref("bar");
    this.prefixSection = this.ref("prefix-section");
    this.hostSection = this.ref("host-section");
    this.dividerEl = this.ref("divider");
    this.prefixLabel = this.ref("prefix-label");
    this.hostLabel = this.ref("host-label");
    this.prefixDisplay = this.ref("prefix-display");

    this.dividerEl.addEventListener("pointerdown", (e) =>
      this.onPointerDown(e)
    );
    this.barEl.addEventListener("click", (e) => this.onBarClick(e));

    this.render(getIPv6State().prefix);
    this.cleanup = onIPv6StateChange((s) => this.render(s.prefix));
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private ref(name: string): HTMLElement {
    return this.querySelector(`[data-ref="${name}"]`) as HTMLElement;
  }

  private render(prefix: number) {
    const pct = (prefix / 128) * 100;
    this.prefixSection.style.width = `${pct}%`;
    this.hostSection.style.width = `${100 - pct}%`;
    this.dividerEl.style.left = `${pct}%`;
    this.dividerEl.style.display =
      prefix === 0 || prefix === 128 ? "none" : "flex";

    this.prefixLabel.textContent = `Prefix: ${prefix} bits`;
    this.hostLabel.textContent = `Interface ID: ${128 - prefix} bits`;
    this.prefixDisplay.innerHTML = `Drag the divider to adjust \u2014 <strong>/${prefix}</strong>`;
  }

  private onPointerDown(e: PointerEvent) {
    e.preventDefault();
    this.isDragging = true;
    this.dividerEl.classList.add(css.dividerDragging);
    this.dividerEl.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      if (!this.isDragging) return;
      const rect = this.barEl.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const fraction = Math.max(0, Math.min(1, x / rect.width));
      const newPrefix = Math.round(fraction * 128);
      if (newPrefix !== getIPv6State().prefix) {
        setIPv6State({ prefix: newPrefix });
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

  private onBarClick(e: MouseEvent) {
    if (this.isDragging) return;
    if ((e.target as HTMLElement).closest(`[data-ref="divider"]`)) return;
    const rect = this.barEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, x / rect.width));
    const newPrefix = Math.round(fraction * 128);
    setIPv6State({ prefix: newPrefix });
  }
}

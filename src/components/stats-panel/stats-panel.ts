import { getState, setState, onStateChange } from "../../state";
import * as sm from "../../subnet-math";
import css from "./stats-panel.module.css";

interface StatItem {
  label: string;
  key: string;
  accent?: boolean;
  fullWidth?: boolean;
}

const STATS: StatItem[] = [
  { label: "Network Address", key: "network" },
  { label: "Broadcast Address", key: "broadcast" },
  { label: "Subnet Mask", key: "mask" },
  { label: "Wildcard Mask", key: "wildcard" },
  { label: "First Usable Host", key: "firstHost" },
  { label: "Last Usable Host", key: "lastHost" },
  { label: "Total Addresses", key: "totalAddresses" },
  { label: "IP Class", key: "ipClass" },
  { label: "Usable Hosts", key: "hostCount", accent: true, fullWidth: true },
];

export class StatsPanel extends HTMLElement {
  private valueEls = new Map<string, HTMLElement>();
  private subnetsRow!: HTMLElement;
  private subnetsValue!: HTMLElement;
  private parentInput!: HTMLInputElement;
  private cleanup!: () => void;

  connectedCallback() {
    this.className = css.host;

    const grid = document.createElement("div");
    grid.className = css.statsGrid;

    for (const item of STATS) {
      const stat = document.createElement("div");
      stat.className = item.fullWidth ? css.statFullWidth : css.stat;

      const label = document.createElement("div");
      label.className = css.statLabel;
      label.textContent = item.label;

      const value = document.createElement("div");
      value.className = item.accent ? css.statValueAccent : css.statValue;

      stat.appendChild(label);
      stat.appendChild(value);
      grid.appendChild(stat);
      this.valueEls.set(item.key, value);
    }

    // Parent prefix input row
    const parentRow = document.createElement("div");
    parentRow.className = css.statFullWidth;

    const parentLabel = document.createElement("div");
    parentLabel.className = css.statLabel;
    parentLabel.textContent = "Subnetting from";

    const parentInputWrap = document.createElement("div");
    parentInputWrap.className = css.parentInputWrap;

    const slash = document.createElement("span");
    slash.className = css.parentSlash;
    slash.textContent = "/";

    this.parentInput = document.createElement("input");
    this.parentInput.type = "text";
    this.parentInput.inputMode = "numeric";
    this.parentInput.placeholder = "—";
    this.parentInput.className = css.parentInput;
    this.parentInput.maxLength = 2;

    const hint = document.createElement("span");
    hint.className = css.parentHint;
    hint.textContent = "(optional parent prefix)";

    parentInputWrap.appendChild(slash);
    parentInputWrap.appendChild(this.parentInput);
    parentInputWrap.appendChild(hint);

    parentRow.appendChild(parentLabel);
    parentRow.appendChild(parentInputWrap);
    grid.appendChild(parentRow);

    // # Subnets row (hidden until parent prefix is set)
    this.subnetsRow = document.createElement("div");
    this.subnetsRow.className = css.statFullWidth;
    this.subnetsRow.style.display = "none";

    const subnetsLabel = document.createElement("div");
    subnetsLabel.className = css.statLabel;
    subnetsLabel.textContent = "# Subnets";

    this.subnetsValue = document.createElement("div");
    this.subnetsValue.className = css.statValueAccent;

    this.subnetsRow.appendChild(subnetsLabel);
    this.subnetsRow.appendChild(this.subnetsValue);
    grid.appendChild(this.subnetsRow);

    this.appendChild(grid);

    this.parentInput.addEventListener("input", () => this.handleParentInput());

    // Sync input from state if already set
    const state = getState();
    if (state.parentPrefix !== null) {
      this.parentInput.value = String(state.parentPrefix);
    }

    this.render();
    this.cleanup = onStateChange(() => this.render());
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private handleParentInput() {
    const val = this.parentInput.value.trim();
    if (val === "") {
      setState({ parentPrefix: null });
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 32) {
      setState({ parentPrefix: num });
    }
  }

  private render() {
    const { octets, prefix, parentPrefix } = getState();
    const ip = sm.ipToNumber(octets);
    const net = sm.networkAddress(ip, prefix);
    const bcast = sm.broadcastAddress(ip, prefix);

    const values: Record<string, string> = {
      network: sm.formatIp(net),
      broadcast: sm.formatIp(bcast),
      mask: sm.formatIp(sm.prefixToMask(prefix)),
      wildcard: sm.formatIp(sm.wildcardMask(prefix)),
      firstHost: sm.formatIp(sm.firstUsableHost(ip, prefix)),
      lastHost: sm.formatIp(sm.lastUsableHost(ip, prefix)),
      hostCount: sm.usableHostCount(prefix).toLocaleString(),
      totalAddresses: sm.totalAddresses(prefix).toLocaleString(),
      ipClass: `Class ${sm.ipClass(octets[0])}`,
    };

    for (const [key, el] of this.valueEls) {
      el.textContent = values[key];
    }

    // Show/hide subnets
    if (parentPrefix !== null && parentPrefix < prefix) {
      const numSubnets = Math.pow(2, prefix - parentPrefix);
      this.subnetsValue.textContent = numSubnets.toLocaleString();
      this.subnetsRow.style.display = "";
    } else {
      this.subnetsRow.style.display = "none";
    }
  }
}

import { getIPv6State, onIPv6StateChange } from "../../ipv6-state";
import * as v6 from "../../ipv6-math";
import css from "./ipv6-stats-panel.module.css";

interface StatItem {
  label: string;
  key: string;
  accent?: boolean;
  fullWidth?: boolean;
}

const STATS: StatItem[] = [
  { label: "Network Prefix", key: "network" },
  { label: "First Address", key: "first" },
  { label: "Last Address", key: "last" },
  { label: "Prefix Length", key: "prefix" },
  { label: "Total Addresses", key: "total" },
  { label: "Scope", key: "scope" },
  { label: "Full Address", key: "full", fullWidth: true },
  { label: "Total Addresses", key: "totalAccent", accent: true, fullWidth: true },
];

export class IPv6StatsPanel extends HTMLElement {
  private valueEls = new Map<string, HTMLElement>();
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

    this.appendChild(grid);
    this.render();
    this.cleanup = onIPv6StateChange(() => this.render());
  }

  disconnectedCallback() {
    this.cleanup?.();
  }

  private render() {
    const state = getIPv6State();
    const addr = v6.parseIPv6(state.address);
    if (addr === null) return;

    const prefix = state.prefix;
    const netAddr = v6.ipv6NetworkAddress(addr, prefix);
    const firstUsable = v6.ipv6FirstUsable(addr, prefix);
    const lastAddr = v6.ipv6LastAddress(addr, prefix);
    const total = v6.formatTotalAddresses(prefix);
    const scope = v6.ipv6Scope(addr);

    const values: Record<string, string> = {
      network: `${v6.formatIPv6(netAddr)}/${prefix}`,
      first: v6.formatIPv6(firstUsable),
      last: v6.formatIPv6(lastAddr),
      prefix: `/${prefix}`,
      total,
      scope,
      full: v6.formatIPv6Full(addr),
      totalAccent: total,
    };

    for (const [key, el] of this.valueEls) {
      el.textContent = values[key];
    }
  }
}

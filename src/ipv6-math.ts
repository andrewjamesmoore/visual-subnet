// IPv6 addresses are 128-bit, represented as BigInt throughout.

const MAX_128 = (1n << 128n) - 1n;

/** Parse any valid IPv6 string (full, compressed ::, mixed v4-mapped) into a BigInt, or null if invalid. */
export function parseIPv6(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Handle mixed notation like ::ffff:192.168.1.1
  const v4Suffix = trimmed.match(/:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  let normalized = trimmed;
  if (v4Suffix) {
    const parts = v4Suffix[1].split(".").map(Number);
    if (parts.some((p) => p > 255 || isNaN(p))) return null;
    const hex1 = ((parts[0] << 8) | parts[1]).toString(16);
    const hex2 = ((parts[2] << 8) | parts[3]).toString(16);
    normalized = trimmed.slice(0, trimmed.length - v4Suffix[1].length - 1) + `:${hex1}:${hex2}`;
  }

  // Expand :: notation
  if (normalized.includes("::")) {
    const halves = normalized.split("::");
    if (halves.length !== 2) return null;
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    if (missing < 0) return null;
    const middle = Array(missing).fill("0");
    const groups = [...left, ...middle, ...right];
    if (groups.length !== 8) return null;
    return groupsToAddr(groups);
  }

  const groups = normalized.split(":");
  if (groups.length !== 8) return null;
  return groupsToAddr(groups);
}

function groupsToAddr(groups: string[]): bigint | null {
  let addr = 0n;
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
    addr = (addr << 16n) | BigInt(parseInt(g, 16));
  }
  return addr;
}

/** Format with :: compression (RFC 5952 canonical form). */
export function formatIPv6(addr: bigint): string {
  const groups = ipv6ToHexGroups(addr);

  // Find the longest run of consecutive "0000" groups
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < 8; i++) {
    if (groups[i] === "0000") {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  // Only compress if run length >= 2
  if (bestLen < 2) {
    return groups.map((g) => g.replace(/^0+/, "") || "0").join(":");
  }

  const left = groups
    .slice(0, bestStart)
    .map((g) => g.replace(/^0+/, "") || "0");
  const right = groups
    .slice(bestStart + bestLen)
    .map((g) => g.replace(/^0+/, "") || "0");

  if (left.length === 0 && right.length === 0) return "::";
  if (left.length === 0) return "::" + right.join(":");
  if (right.length === 0) return left.join(":") + "::";
  return left.join(":") + "::" + right.join(":");
}

/** Fully expanded 8-group format (e.g., "2001:0db8:0000:0000:0000:0000:0000:0001"). */
export function formatIPv6Full(addr: bigint): string {
  return ipv6ToHexGroups(addr).join(":");
}

/** Create a 128-bit prefix mask. */
export function ipv6PrefixToMask(prefix: number): bigint {
  if (prefix === 0) return 0n;
  if (prefix === 128) return MAX_128;
  return (MAX_128 << BigInt(128 - prefix)) & MAX_128;
}

/** Network prefix address (addr AND mask). */
export function ipv6NetworkAddress(addr: bigint, prefix: number): bigint {
  return addr & ipv6PrefixToMask(prefix);
}

/** Last address in the prefix range. */
export function ipv6LastAddress(addr: bigint, prefix: number): bigint {
  const hostBits = 128 - prefix;
  if (hostBits === 0) return addr;
  const hostMask = (1n << BigInt(hostBits)) - 1n;
  return ipv6NetworkAddress(addr, prefix) | hostMask;
}

/** First usable address (network + 1, unless /128 or /127). */
export function ipv6FirstUsable(addr: bigint, prefix: number): bigint {
  if (prefix >= 127) return ipv6NetworkAddress(addr, prefix);
  return ipv6NetworkAddress(addr, prefix) + 1n;
}

/** Total addresses in prefix (2^(128-prefix)). */
export function ipv6TotalAddresses(prefix: number): bigint {
  return 1n << BigInt(128 - prefix);
}

/** Format total addresses as a human-readable string (e.g., "2^80" for large values). */
export function formatTotalAddresses(prefix: number): string {
  const hostBits = 128 - prefix;
  if (hostBits <= 20) {
    return ipv6TotalAddresses(prefix).toLocaleString();
  }
  return `2^${hostBits}`;
}

/** 8 groups of 16-bit binary strings. */
export function ipv6ToBinaryGroups(addr: bigint): string[] {
  const groups: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const group = Number((addr >> BigInt(i * 16)) & 0xFFFFn);
    groups.push(group.toString(2).padStart(16, "0"));
  }
  return groups;
}

/** 8 groups of 4 hex characters. */
export function ipv6ToHexGroups(addr: bigint): string[] {
  const groups: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const group = Number((addr >> BigInt(i * 16)) & 0xFFFFn);
    groups.push(group.toString(16).padStart(4, "0"));
  }
  return groups;
}

/** Determine the scope/type of an IPv6 address. */
export function ipv6Scope(addr: bigint): string {
  // ::1 — loopback
  if (addr === 1n) return "Loopback";
  // :: — unspecified
  if (addr === 0n) return "Unspecified";
  // fe80::/10 — link-local
  const first16 = Number((addr >> 112n) & 0xFFFFn);
  if ((first16 & 0xffc0) === 0xfe80) return "Link-Local";
  // fc00::/7 — unique local
  const first8 = Number((addr >> 120n) & 0xFFn);
  if ((first8 & 0xfe) === 0xfc) return "Unique Local";
  // ff00::/8 — multicast
  if (first8 === 0xff) return "Multicast";
  // ::ffff:0:0/96 — IPv4-mapped
  if ((addr >> 32n) === 0xFFFFn) return "IPv4-Mapped";
  // 2000::/3 — global unicast
  if ((first8 & 0xe0) === 0x20) return "Global Unicast";
  return "Reserved";
}

/** Parse an IPv6 CIDR string like "2001:db8::1/48". */
export function parseIPv6Cidr(input: string): { addr: bigint; prefix: number } | null {
  const trimmed = input.trim();
  const slashIdx = trimmed.lastIndexOf("/");
  if (slashIdx === -1) return null;

  const addrPart = trimmed.slice(0, slashIdx);
  const prefixPart = trimmed.slice(slashIdx + 1);

  if (!/^\d{1,3}$/.test(prefixPart)) return null;
  const prefix = parseInt(prefixPart, 10);
  if (prefix < 0 || prefix > 128) return null;

  const addr = parseIPv6(addrPart);
  if (addr === null) return null;

  return { addr, prefix };
}

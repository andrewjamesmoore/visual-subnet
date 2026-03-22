export function ipToNumber(octets: number[]): number {
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

export function numberToOctets(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

export function prefixToMask(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

export function wildcardMask(prefix: number): number {
  return (~prefixToMask(prefix)) >>> 0;
}

export function networkAddress(ip: number, prefix: number): number {
  return (ip & prefixToMask(prefix)) >>> 0;
}

export function broadcastAddress(ip: number, prefix: number): number {
  return (networkAddress(ip, prefix) | wildcardMask(prefix)) >>> 0;
}

export function firstUsableHost(ip: number, prefix: number): number {
  if (prefix >= 31) return networkAddress(ip, prefix);
  return (networkAddress(ip, prefix) + 1) >>> 0;
}

export function lastUsableHost(ip: number, prefix: number): number {
  if (prefix >= 31) return broadcastAddress(ip, prefix);
  return (broadcastAddress(ip, prefix) - 1) >>> 0;
}

export function usableHostCount(prefix: number): number {
  if (prefix > 30) return prefix === 31 ? 2 : 1;
  return Math.pow(2, 32 - prefix) - 2;
}

export function totalAddresses(prefix: number): number {
  return Math.pow(2, 32 - prefix);
}

export function ipClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

export function formatIp(n: number): string {
  return numberToOctets(n).join(".");
}

export function toBinaryOctets(n: number): string[] {
  return numberToOctets(n).map((o) => o.toString(2).padStart(8, "0"));
}

export function toBinaryString(n: number): string {
  return toBinaryOctets(n).join(".");
}

/** Returns the 1-based octet index where subnetting occurs (1–4), or 0 for /0. */
export function interestingOctet(prefix: number): number {
  if (prefix === 0) return 1;
  return Math.ceil(prefix / 8);
}

/** The mask value within the interesting octet (0–255). */
export function interestingOctetMaskValue(prefix: number): number {
  const maskOctets = numberToOctets(prefixToMask(prefix));
  return maskOctets[interestingOctet(prefix) - 1];
}

/** Magic number = 256 - mask value in the interesting octet. */
export function magicNumber(prefix: number): number {
  return 256 - interestingOctetMaskValue(prefix);
}

export interface ParsedInput {
  octets: number[];
  prefix: number;
}

export function parseIpCidr(input: string): ParsedInput | null {
  const trimmed = input.trim();
  const cidrMatch = trimmed.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/
  );
  if (!cidrMatch) return null;

  const octets = [
    parseInt(cidrMatch[1], 10),
    parseInt(cidrMatch[2], 10),
    parseInt(cidrMatch[3], 10),
    parseInt(cidrMatch[4], 10),
  ];
  const prefix = parseInt(cidrMatch[5], 10);

  if (octets.some((o) => o > 255)) return null;
  if (prefix > 32) return null;

  return { octets, prefix };
}

import {
  parseIPv6,
  formatIPv6,
  formatIPv6Full,
  ipv6PrefixToMask,
  ipv6NetworkAddress,
  ipv6LastAddress,
  ipv6FirstUsable,
  ipv6TotalAddresses,
  formatTotalAddresses,
  ipv6ToBinaryGroups,
  ipv6ToHexGroups,
  ipv6Scope,
  parseIPv6Cidr,
} from "./ipv6-math";

describe("parseIPv6", () => {
  it("parses a full address", () => {
    expect(parseIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(
      0x20010db885a3000000008a2e03707334n
    );
  });

  it("parses compressed :: notation", () => {
    expect(parseIPv6("2001:db8::1")).toBe(
      0x20010db8000000000000000000000001n
    );
  });

  it("parses :: as all zeros", () => {
    expect(parseIPv6("::")).toBe(0n);
  });

  it("parses ::1 as loopback", () => {
    expect(parseIPv6("::1")).toBe(1n);
  });

  it("parses fe80::1 link-local", () => {
    expect(parseIPv6("fe80::1")).toBe(0xfe800000000000000000000000000001n);
  });

  it("parses mixed v4-mapped notation", () => {
    expect(parseIPv6("::ffff:192.168.1.1")).toBe(
      0x0000000000000000ffffc0a80101n
    );
  });

  it("returns null for invalid input", () => {
    expect(parseIPv6("")).toBeNull();
    expect(parseIPv6("not-an-address")).toBeNull();
    expect(parseIPv6("2001:db8::1::2")).toBeNull(); // multiple ::
    expect(parseIPv6("2001:db8:zzzz::1")).toBeNull(); // invalid hex
    expect(parseIPv6("2001:db8:1:2:3:4:5:6:7")).toBeNull(); // too many groups
  });
});

describe("formatIPv6", () => {
  it("compresses longest run of zeros", () => {
    expect(formatIPv6(0x20010db8000000000000000000000001n)).toBe("2001:db8::1");
  });

  it("formats all zeros as ::", () => {
    expect(formatIPv6(0n)).toBe("::");
  });

  it("formats loopback as ::1", () => {
    expect(formatIPv6(1n)).toBe("::1");
  });

  it("does not compress single zero group", () => {
    const addr = parseIPv6("2001:db8:0:1:0:1:0:1")!;
    const formatted = formatIPv6(addr);
    // Should not use :: for single zero groups
    expect(formatted).toBe("2001:db8:0:1:0:1:0:1");
  });
});

describe("formatIPv6Full", () => {
  it("returns fully expanded 8 groups", () => {
    expect(formatIPv6Full(0x20010db8000000000000000000000001n)).toBe(
      "2001:0db8:0000:0000:0000:0000:0000:0001"
    );
  });

  it("pads all groups to 4 hex chars", () => {
    expect(formatIPv6Full(1n)).toBe("0000:0000:0000:0000:0000:0000:0000:0001");
  });
});

describe("ipv6PrefixToMask", () => {
  it("returns all ones for /128", () => {
    expect(ipv6PrefixToMask(128)).toBe((1n << 128n) - 1n);
  });

  it("returns all zeros for /0", () => {
    expect(ipv6PrefixToMask(0)).toBe(0n);
  });

  it("returns correct mask for /64", () => {
    expect(ipv6PrefixToMask(64)).toBe(0xFFFFFFFFFFFFFFFF0000000000000000n);
  });

  it("returns correct mask for /48", () => {
    expect(ipv6PrefixToMask(48)).toBe(0xFFFFFFFFFFFF00000000000000000000n);
  });
});

describe("ipv6NetworkAddress", () => {
  it("masks out host bits", () => {
    const addr = parseIPv6("2001:db8::1")!;
    expect(ipv6NetworkAddress(addr, 64)).toBe(parseIPv6("2001:db8::")!);
  });

  it("/0 gives ::", () => {
    const addr = parseIPv6("2001:db8::1")!;
    expect(ipv6NetworkAddress(addr, 0)).toBe(0n);
  });
});

describe("ipv6LastAddress", () => {
  it("fills host bits", () => {
    const addr = parseIPv6("2001:db8::1")!;
    const last = ipv6LastAddress(addr, 64);
    expect(formatIPv6Full(last)).toBe("2001:0db8:0000:0000:ffff:ffff:ffff:ffff");
  });

  it("/128 returns the address itself", () => {
    const addr = parseIPv6("2001:db8::1")!;
    expect(ipv6LastAddress(addr, 128)).toBe(addr);
  });
});

describe("ipv6FirstUsable", () => {
  it("returns network + 1 for normal prefixes", () => {
    const addr = parseIPv6("2001:db8::5")!;
    const first = ipv6FirstUsable(addr, 64);
    expect(first).toBe(parseIPv6("2001:db8::1")!);
  });

  it("returns network address for /128", () => {
    const addr = parseIPv6("2001:db8::1")!;
    expect(ipv6FirstUsable(addr, 128)).toBe(addr);
  });

  it("returns network address for /127", () => {
    const addr = parseIPv6("2001:db8::1")!;
    expect(ipv6FirstUsable(addr, 127)).toBe(parseIPv6("2001:db8::")!);
  });
});

describe("ipv6TotalAddresses", () => {
  it("/128 has 1 address", () => {
    expect(ipv6TotalAddresses(128)).toBe(1n);
  });

  it("/64 has 2^64 addresses", () => {
    expect(ipv6TotalAddresses(64)).toBe(1n << 64n);
  });

  it("/0 has 2^128 addresses", () => {
    expect(ipv6TotalAddresses(0)).toBe(1n << 128n);
  });
});

describe("formatTotalAddresses", () => {
  it("shows exact number for small prefixes", () => {
    expect(formatTotalAddresses(128)).toBe("1");
    expect(formatTotalAddresses(120)).toBe("256");
  });

  it("shows power-of-2 notation for large ranges", () => {
    expect(formatTotalAddresses(64)).toBe("2^64");
    expect(formatTotalAddresses(0)).toBe("2^128");
  });
});

describe("ipv6ToBinaryGroups", () => {
  it("returns 8 groups of 16-bit binary", () => {
    const groups = ipv6ToBinaryGroups(1n);
    expect(groups).toHaveLength(8);
    expect(groups[7]).toBe("0000000000000001");
    expect(groups[0]).toBe("0000000000000000");
  });
});

describe("ipv6ToHexGroups", () => {
  it("returns 8 groups of 4 hex chars", () => {
    const groups = ipv6ToHexGroups(0x20010db8000000000000000000000001n);
    expect(groups).toEqual([
      "2001", "0db8", "0000", "0000",
      "0000", "0000", "0000", "0001",
    ]);
  });
});

describe("ipv6Scope", () => {
  it("identifies loopback", () => {
    expect(ipv6Scope(1n)).toBe("Loopback");
  });

  it("identifies unspecified", () => {
    expect(ipv6Scope(0n)).toBe("Unspecified");
  });

  it("identifies link-local", () => {
    expect(ipv6Scope(parseIPv6("fe80::1")!)).toBe("Link-Local");
  });

  it("identifies unique local", () => {
    expect(ipv6Scope(parseIPv6("fd00::1")!)).toBe("Unique Local");
  });

  it("identifies multicast", () => {
    expect(ipv6Scope(parseIPv6("ff02::1")!)).toBe("Multicast");
  });

  it("identifies global unicast", () => {
    expect(ipv6Scope(parseIPv6("2001:db8::1")!)).toBe("Global Unicast");
  });

  it("identifies IPv4-mapped", () => {
    expect(ipv6Scope(parseIPv6("::ffff:192.168.1.1")!)).toBe("IPv4-Mapped");
  });
});

describe("parseIPv6Cidr", () => {
  it("parses valid CIDR", () => {
    const result = parseIPv6Cidr("2001:db8::1/48");
    expect(result).not.toBeNull();
    expect(result!.prefix).toBe(48);
    expect(result!.addr).toBe(parseIPv6("2001:db8::1")!);
  });

  it("rejects missing prefix", () => {
    expect(parseIPv6Cidr("2001:db8::1")).toBeNull();
  });

  it("rejects prefix > 128", () => {
    expect(parseIPv6Cidr("2001:db8::1/129")).toBeNull();
  });

  it("rejects invalid address", () => {
    expect(parseIPv6Cidr("not-valid/64")).toBeNull();
  });
});

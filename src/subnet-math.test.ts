import {
  ipToNumber,
  numberToOctets,
  prefixToMask,
  wildcardMask,
  networkAddress,
  broadcastAddress,
  firstUsableHost,
  lastUsableHost,
  usableHostCount,
  totalAddresses,
  formatIp,
  toBinaryOctets,
  toBinaryString,
  parseIpCidr,
  interestingOctet,
  interestingOctetMaskValue,
  magicNumber,
} from "./subnet-math";

describe("ipToNumber / numberToOctets", () => {
  it("converts 192.168.1.0 correctly", () => {
    const n = ipToNumber([192, 168, 1, 0]);
    expect(n).toBe(0xc0a80100);
    expect(numberToOctets(n)).toEqual([192, 168, 1, 0]);
  });

  it("converts 0.0.0.0", () => {
    expect(ipToNumber([0, 0, 0, 0])).toBe(0);
    expect(numberToOctets(0)).toEqual([0, 0, 0, 0]);
  });

  it("converts 255.255.255.255", () => {
    const n = ipToNumber([255, 255, 255, 255]);
    expect(n).toBe(0xffffffff);
    expect(numberToOctets(n)).toEqual([255, 255, 255, 255]);
  });

  it("converts 10.0.0.1", () => {
    const n = ipToNumber([10, 0, 0, 1]);
    expect(numberToOctets(n)).toEqual([10, 0, 0, 1]);
  });
});

describe("prefixToMask / wildcardMask", () => {
  it("/24 gives 255.255.255.0", () => {
    expect(numberToOctets(prefixToMask(24))).toEqual([255, 255, 255, 0]);
  });

  it("/16 gives 255.255.0.0", () => {
    expect(numberToOctets(prefixToMask(16))).toEqual([255, 255, 0, 0]);
  });

  it("/8 gives 255.0.0.0", () => {
    expect(numberToOctets(prefixToMask(8))).toEqual([255, 0, 0, 0]);
  });

  it("/0 gives 0.0.0.0", () => {
    expect(prefixToMask(0)).toBe(0);
  });

  it("/32 gives 255.255.255.255", () => {
    expect(prefixToMask(32)).toBe(0xffffffff);
  });

  it("wildcard for /24 is 0.0.0.255", () => {
    expect(numberToOctets(wildcardMask(24))).toEqual([0, 0, 0, 255]);
  });

  it("wildcard for /0 is 255.255.255.255", () => {
    expect(wildcardMask(0)).toBe(0xffffffff);
  });
});

describe("networkAddress / broadcastAddress", () => {
  const ip = ipToNumber([192, 168, 1, 100]);

  it("/24 network is 192.168.1.0", () => {
    expect(formatIp(networkAddress(ip, 24))).toBe("192.168.1.0");
  });

  it("/24 broadcast is 192.168.1.255", () => {
    expect(formatIp(broadcastAddress(ip, 24))).toBe("192.168.1.255");
  });

  it("/16 network is 192.168.0.0", () => {
    expect(formatIp(networkAddress(ip, 16))).toBe("192.168.0.0");
  });

  it("/16 broadcast is 192.168.255.255", () => {
    expect(formatIp(broadcastAddress(ip, 16))).toBe("192.168.255.255");
  });
});

describe("firstUsableHost / lastUsableHost", () => {
  const ip = ipToNumber([10, 0, 0, 0]);

  it("/24 first host is .1, last host is .254", () => {
    expect(formatIp(firstUsableHost(ip, 24))).toBe("10.0.0.1");
    expect(formatIp(lastUsableHost(ip, 24))).toBe("10.0.0.254");
  });

  it("/31 returns network and broadcast (point-to-point)", () => {
    expect(formatIp(firstUsableHost(ip, 31))).toBe("10.0.0.0");
    expect(formatIp(lastUsableHost(ip, 31))).toBe("10.0.0.1");
  });

  it("/32 returns the address itself", () => {
    expect(formatIp(firstUsableHost(ip, 32))).toBe("10.0.0.0");
    expect(formatIp(lastUsableHost(ip, 32))).toBe("10.0.0.0");
  });
});

describe("usableHostCount / totalAddresses", () => {
  it("/24 has 254 usable, 256 total", () => {
    expect(usableHostCount(24)).toBe(254);
    expect(totalAddresses(24)).toBe(256);
  });

  it("/8 has 16777214 usable", () => {
    expect(usableHostCount(8)).toBe(16777214);
  });

  it("/30 has 2 usable", () => {
    expect(usableHostCount(30)).toBe(2);
  });

  it("/31 has 2 usable (point-to-point)", () => {
    expect(usableHostCount(31)).toBe(2);
  });

  it("/32 has 1 usable", () => {
    expect(usableHostCount(32)).toBe(1);
  });
});

describe("toBinaryOctets / toBinaryString", () => {
  it("formats 192.168.1.0 correctly", () => {
    const n = ipToNumber([192, 168, 1, 0]);
    expect(toBinaryOctets(n)).toEqual([
      "11000000",
      "10101000",
      "00000001",
      "00000000",
    ]);
    expect(toBinaryString(n)).toBe("11000000.10101000.00000001.00000000");
  });
});

describe("interestingOctet / interestingOctetMaskValue / magicNumber", () => {
  it("/24 — interesting octet is 3, mask value 255, magic number 1", () => {
    // /24 mask is 255.255.255.0 — octet 3 is the last full 255
    expect(interestingOctet(24)).toBe(3);
    expect(interestingOctetMaskValue(24)).toBe(255);
    expect(magicNumber(24)).toBe(1);
  });

  it("/25 — interesting octet is 4, mask value 128, magic number 128", () => {
    expect(interestingOctet(25)).toBe(4);
    expect(interestingOctetMaskValue(25)).toBe(128);
    expect(magicNumber(25)).toBe(128);
  });

  it("/26 — interesting octet is 4, mask value 192, magic number 64", () => {
    expect(interestingOctet(26)).toBe(4);
    expect(interestingOctetMaskValue(26)).toBe(192);
    expect(magicNumber(26)).toBe(64);
  });

  it("/16 — interesting octet is 2, mask value 255, magic number 1", () => {
    expect(interestingOctet(16)).toBe(2);
    expect(interestingOctetMaskValue(16)).toBe(255);
    expect(magicNumber(16)).toBe(1);
  });

  it("/20 — interesting octet is 3, mask value 240, magic number 16", () => {
    expect(interestingOctet(20)).toBe(3);
    expect(interestingOctetMaskValue(20)).toBe(240);
    expect(magicNumber(20)).toBe(16);
  });

  it("/8 — interesting octet is 1", () => {
    expect(interestingOctet(8)).toBe(1);
    expect(interestingOctetMaskValue(8)).toBe(255);
    expect(magicNumber(8)).toBe(1);
  });

  it("/0 — interesting octet is 1, mask value 0, magic number 256", () => {
    expect(interestingOctet(0)).toBe(1);
    expect(interestingOctetMaskValue(0)).toBe(0);
    expect(magicNumber(0)).toBe(256);
  });
});

describe("parseIpCidr", () => {
  it("parses valid CIDR", () => {
    expect(parseIpCidr("192.168.1.0/24")).toEqual({
      octets: [192, 168, 1, 0],
      prefix: 24,
    });
  });

  it("parses with leading/trailing spaces", () => {
    expect(parseIpCidr("  10.0.0.0/8  ")).toEqual({
      octets: [10, 0, 0, 0],
      prefix: 8,
    });
  });

  it("rejects invalid octets", () => {
    expect(parseIpCidr("256.0.0.0/24")).toBeNull();
  });

  it("rejects prefix > 32", () => {
    expect(parseIpCidr("10.0.0.0/33")).toBeNull();
  });

  it("rejects missing prefix", () => {
    expect(parseIpCidr("10.0.0.0")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(parseIpCidr("")).toBeNull();
  });

  it("rejects garbage", () => {
    expect(parseIpCidr("not an ip")).toBeNull();
  });
});

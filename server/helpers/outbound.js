import dns from "node:dns";
import net from "node:net";

const blocked = new net.BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
])
  blocked.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
])
  blocked.addSubnet(address, prefix, "ipv6");

export function assertPublicAddress(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (host.toLowerCase().startsWith("::ffff:")) {
    const mapped = host.slice(7);
    let ipv4 = mapped;
    if (mapped.includes(":")) {
      const [high, low, ...extra] = mapped.split(":");
      if (extra.length || !high || !low) throw new Error("Invalid mapped IPv6 address");
      const value = (Number.parseInt(high, 16) << 16) | Number.parseInt(low, 16);
      ipv4 = `${(value >>> 24) & 255}.${(value >>> 16) & 255}.${(value >>> 8) & 255}.${value & 255}`;
    }
    if (net.isIP(ipv4) !== 4) throw new Error("Invalid mapped IPv6 address");
    return assertPublicAddress(ipv4);
  }
  const family = net.isIP(host);
  if (family && blocked.check(host, family === 4 ? "ipv4" : "ipv6"))
    throw new Error("Destination address is not public");
}

export function outboundOptions(url) {
  const parsed = new URL(url);
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  )
    throw new Error("Invalid outbound URL");
  assertPublicAddress(parsed.hostname);
  return {
    proxy: false,
    timeout: 10000,
    maxRedirects: 3,
    maxContentLength: 5 * 1024 * 1024,
    beforeRedirect(options) {
      if (!["http:", "https:"].includes(options.protocol))
        throw new Error("Invalid redirect protocol");
      assertPublicAddress(options.hostname);
    },
    lookup(hostname, options, callback) {
      dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
        if (error) return callback(error);
        try {
          if (!addresses.length) throw new Error("No destination addresses");
          for (const address of addresses) assertPublicAddress(address.address);
          if (options.all) return callback(null, addresses);
          callback(null, addresses[0].address, addresses[0].family);
        } catch (err) {
          callback(err);
        }
      });
    },
  };
}

// Preloaded into the server process by tests/integration/network.test.ts.
// Logs every attempt to open an outbound connection or look up a host name, so the
// test can check that the app never talks to anything outside itself (R-016).
import dgram from "node:dgram";
import dns from "node:dns";
import net from "node:net";

function report(kind, detail) {
  process.stderr.write(`OUTBOUND ${kind} ${JSON.stringify(detail)}\n`);
}

const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const [first, second] = args;
  const target = typeof first === "object" && first !== null ? { host: first.host, port: first.port, path: first.path } : { port: first, host: second };
  report("connect", target);
  return connect.apply(this, args);
};

const lookup = dns.lookup;
dns.lookup = function (hostname, ...rest) {
  report("dns", { hostname });
  return lookup.call(this, hostname, ...rest);
};

const createSocket = dgram.createSocket;
dgram.createSocket = function (...args) {
  report("udp", {});
  return createSocket.apply(this, args);
};

/**
 * AG AntiVPN Local Adapter Proxy Server (Node.js version)
 * --------------------------------------------------------
 * این اسکریپت جایگزین Node.js برای پروکسی لوکال کمکی است.
 * 
 * نحوه اجرا:
 *   node helpers/local_adapter_proxy.js
 */

const http = require('http');
const net = require('net');
const os = require('os');

const PORT = 8888;
const HOST = '127.0.0.1';

// Find Physical LAN IP
function getPhysicalLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const netIf of interfaces[name]) {
      if (netIf.family === 'IPv4' && !netIf.internal) {
        candidates.push(netIf.address);
      }
    }
  }

  // Priority to 192.168.x.x
  for (const ip of candidates) {
    if (ip.startsWith('192.168.') || ip.startsWith('172.')) {
      return ip;
    }
  }

  for (const ip of candidates) {
    if (!ip.startsWith('10.8.') && !ip.startsWith('10.7.')) {
      return ip;
    }
  }

  return candidates[0] || '0.0.0.0';
}

const physicalIp = getPhysicalLanIp();
console.log(`✅ IP فیزیکی شبکه شناسایی شده: ${physicalIp}`);

// HTTP Proxy Server
const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url);
  
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || 80,
    path: urlObj.pathname + urlObj.search,
    method: req.method,
    headers: req.headers,
    localAddress: physicalIp !== '0.0.0.0' ? physicalIp : undefined
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end(`Proxy Error: ${err.message}`);
  });

  req.pipe(proxyReq, { end: true });
});

// HTTPS CONNECT Tunneling
server.on('connect', (req, clientSocket, head) => {
  const [host, portStr] = req.url.split(':');
  const port = parseInt(portStr, 10) || 443;

  const options = {
    host,
    port,
    localAddress: physicalIp !== '0.0.0.0' ? physicalIp : undefined
  };

  const serverSocket = net.connect(options, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', () => {
    clientSocket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
  });

  clientSocket.on('error', () => {
    serverSocket.end();
  });
});

server.listen(PORT, HOST, () => {
  console.log('=' .repeat(60));
  console.log(`🚀 پروکسی کمکی Node.js بر روی http://${HOST}:${PORT} در حال اجراست.`);
  console.log(`🌐 ترافیک بای‌پاس شده از کارت شبکه (${physicalIp}) ارسال می‌شود.`);
  console.log('=' .repeat(60));
});

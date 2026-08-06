const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to compute CRC32 for PNG chunks
const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crc32Table[i] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crc32Table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = crc32(typeAndData);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function generatePng(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rawLines = [];
  for (let y = 0; y < height; y++) {
    const line = Buffer.alloc(1 + width * 4);
    line[0] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const idx = 1 + x * 4;
      line[idx] = r;
      line[idx + 1] = g;
      line[idx + 2] = b;
      line[idx + 3] = a;
    }
    rawLines.push(line);
  }
  const rawBuffer = Buffer.concat(rawLines);
  const compressedData = zlib.deflateSync(rawBuffer);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 1280x800 Screenshot generator
function drawStoreScreenshot(x, y, w, h) {
  // Dark futuristic background gradient (#0f172a to #1e1b4b)
  const factor = y / h;
  const r = Math.round(15 * (1 - factor) + 30 * factor);
  const g = Math.round(23 * (1 - factor) + 27 * factor);
  const b = Math.round(42 * (1 - factor) + 75 * factor);

  // Center popup preview card
  const cx = x / w;
  const cy = y / h;

  const inCard = cx >= 0.30 && cx <= 0.70 && cy >= 0.15 && cy <= 0.85;

  if (inCard) {
    // Card border
    const isBorder = cx <= 0.302 || cx >= 0.698 || cy <= 0.152 || cy >= 0.848;
    if (isBorder) {
      return [99, 102, 241, 255]; // Indigo border
    }

    // Header gradient inside card
    if (cy <= 0.28) {
      return [16, 185, 129, 255]; // Emerald header
    }

    // Card background
    return [30, 41, 59, 255]; // Slate dark card
  }

  return [r, g, b, 255];
}

const outputPath = path.join(__dirname, '..', 'icons', 'screenshot-1280x800.png');
const buf = generatePng(1280, 800, drawStoreScreenshot);
fs.writeFileSync(outputPath, buf);
console.log(`Generated store screenshot: ${outputPath}`);

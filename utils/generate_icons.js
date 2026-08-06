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

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanline filter (0)
  const rawLines = [];
  for (let y = 0; y < height; y++) {
    const line = Buffer.alloc(1 + width * 4);
    line[0] = 0; // Filter type 0: None
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

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function drawShieldIcon(x, y, w, h) {
  // Normalize coordinates
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1

  // Background: Rounded Shield with Gradient (Blue to Purple with Green AntiVPN Accent)
  // Distance from center
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Shield outer boundary
  const inShield = Math.abs(nx) <= (1 - ny * 0.3) && ny >= -0.8 && ny <= 0.8;
  const inCircle = dist <= 0.85;

  if (inShield || inCircle) {
    // Shield gradient: Cyan/Teal (0, 200, 255) to Indigo (80, 70, 230)
    const factor = (ny + 1) / 2;
    const r = Math.round(10 * (1 - factor) + 79 * factor);
    const g = Math.round(180 * (1 - factor) + 70 * factor);
    const b = Math.round(250 * (1 - factor) + 229 * factor);
    
    // Check if inner bolt / checkmark
    const isCenter = Math.abs(nx) < 0.35 && Math.abs(ny) < 0.45;
    if (isCenter) {
      return [255, 255, 255, 255]; // White inner symbol
    }
    return [r, g, b, 255];
  }

  return [0, 0, 0, 0]; // Transparent background
}

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const buf = generatePng(size, size, drawShieldIcon);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated ${filePath}`);
});

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-node ZIP writer helper
function createZip(files, outputPath) {
  const localHeaders = [];
  const centralDirectories = [];
  let offset = 0;

  files.forEach(file => {
    const fileNameBuf = Buffer.from(file.name, 'utf8');
    const fileDataBuf = fs.readFileSync(file.path);

    // CRC32
    let crc = 0xFFFFFFFF;
    const crc32Table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      crc32Table[i] = c;
    }
    for (let i = 0; i < fileDataBuf.length; i++) {
      crc = crc32Table[(crc ^ fileDataBuf[i]) & 0xFF] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;

    // Deflate
    const compressedData = zlib.deflateRawSync(fileDataBuf);

    // Local file header
    const localHeader = Buffer.alloc(30 + fileNameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4);          // Version needed
    localHeader.writeUInt16LE(0, 6);           // General purpose bit flag
    localHeader.writeUInt16LE(8, 8);           // Compression method (8 = Deflate)
    localHeader.writeUInt16LE(0, 10);          // Last mod time
    localHeader.writeUInt16LE(0, 12);          // Last mod date
    localHeader.writeUInt32LE(crc, 14);         // CRC-32
    localHeader.writeUInt32LE(compressedData.length, 18); // Compressed size
    localHeader.writeUInt32LE(fileDataBuf.length, 22);    // Uncompressed size
    localHeader.writeUInt16LE(fileNameBuf.length, 26);    // Filename length
    localHeader.writeUInt16LE(0, 28);          // Extra field length
    fileNameBuf.copy(localHeader, 30);

    localHeaders.push(Buffer.concat([localHeader, compressedData]));

    // Central directory header
    const cdHeader = Buffer.alloc(46 + fileNameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);  // CD header signature
    cdHeader.writeUInt16LE(20, 4);          // Version made by
    cdHeader.writeUInt16LE(20, 6);          // Version needed
    cdHeader.writeUInt16LE(0, 8);           // Bit flag
    cdHeader.writeUInt16LE(8, 10);          // Compression method
    cdHeader.writeUInt16LE(0, 12);          // Mod time
    cdHeader.writeUInt16LE(0, 14);          // Mod date
    cdHeader.writeUInt32LE(crc, 16);        // CRC-32
    cdHeader.writeUInt32LE(compressedData.length, 20); // Compressed size
    cdHeader.writeUInt32LE(fileDataBuf.length, 24);    // Uncompressed size
    cdHeader.writeUInt16LE(fileNameBuf.length, 28);    // Filename length
    cdHeader.writeUInt16LE(0, 30);          // Extra field length
    cdHeader.writeUInt16LE(0, 32);          // Comment length
    cdHeader.writeUInt16LE(0, 34);          // Disk start
    cdHeader.writeUInt16LE(0, 36);          // Internal attrs
    cdHeader.writeUInt32LE(0, 38);          // External attrs
    cdHeader.writeUInt32LE(offset, 42);     // Relative offset of local header
    fileNameBuf.copy(cdHeader, 46);

    centralDirectories.push(cdHeader);
    offset += localHeader.length + compressedData.length;
  });

  const localHeadersBuf = Buffer.concat(localHeaders);
  const cdBuf = Buffer.concat(centralDirectories);

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);       // EOCD signature
  eocd.writeUInt16LE(0, 4);                // Disk number
  eocd.writeUInt16LE(0, 6);                // Start disk
  eocd.writeUInt16LE(files.length, 8);     // Total CD records on disk
  eocd.writeUInt16LE(files.length, 10);    // Total CD records
  eocd.writeUInt32LE(cdBuf.length, 12);    // Size of CD
  eocd.writeUInt32LE(localHeadersBuf.length, 16); // Offset of CD
  eocd.writeUInt16LE(0, 20);               // Comment length

  const zipBuf = Buffer.concat([localHeadersBuf, cdBuf, eocd]);
  fs.writeFileSync(outputPath, zipBuf);
}

// Files to package for Chrome Web Store extension
const rootDir = path.join(__dirname, '..');
const packageFiles = [
  { name: 'manifest.json', path: path.join(rootDir, 'manifest.json') },
  { name: 'background/service-worker.js', path: path.join(rootDir, 'background', 'service-worker.js') },
  { name: 'popup/popup.html', path: path.join(rootDir, 'popup', 'popup.html') },
  { name: 'popup/popup.css', path: path.join(rootDir, 'popup', 'popup.css') },
  { name: 'popup/popup.js', path: path.join(rootDir, 'popup', 'popup.js') },
  { name: 'options/options.html', path: path.join(rootDir, 'options', 'options.html') },
  { name: 'options/options.css', path: path.join(rootDir, 'options', 'options.css') },
  { name: 'options/options.js', path: path.join(rootDir, 'options', 'options.js') },
  { name: 'icons/icon-16.png', path: path.join(rootDir, 'icons', 'icon-16.png') },
  { name: 'icons/icon-48.png', path: path.join(rootDir, 'icons', 'icon-48.png') },
  { name: 'icons/icon-128.png', path: path.join(rootDir, 'icons', 'icon-128.png') }
];

const outputPath = path.join(rootDir, 'Custom_Bypass_VPN_v1.0.0.zip');
createZip(packageFiles, outputPath);

// Also create legacy filename copy for reference
const legacyPath = path.join(rootDir, 'AG_AntiVPN_Router_v1.0.0.zip');
createZip(packageFiles, legacyPath);

console.log(`✅ Production extension package created successfully: ${outputPath}`);

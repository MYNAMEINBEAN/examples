const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'extension.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Extension has been zipped successfully');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Add the extension directory to the archive
archive.directory(path.join(__dirname, 'extension'), false);

archive.finalize();
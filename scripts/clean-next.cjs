const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", ".next");
if (fs.existsSync(p)) {
  fs.rmSync(p, { recursive: true, force: true });
  console.log("Carpeta .next eliminada.");
}

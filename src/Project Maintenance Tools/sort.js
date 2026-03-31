// PMT - Author Dmitry Khorov
const fs = require("fs");
const path = require("path");

const AUTHOR_INFO = `
Author: Dmitry Khorov
Telegram: @dkdevelop @jpegweb
DK Studio Production
`;

function getFolderInfo(folderPath) {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });

  const files = items.filter(item => item.isFile() && item.name !== "info.txt");
  const folders = items.filter(item => item.isDirectory());

  const fileDetails = files.map(file => {
    const filePath = path.join(folderPath, file.name);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    return `${file.name} - ${sizeKB} KB`;
  });

  const infoContent = [
    `Folder: ${path.basename(folderPath)}`,
    `Files: ${files.length}`,
    "",
    ...fileDetails,
    "",
    AUTHOR_INFO.trim(),
  ].join("\n");

  fs.writeFileSync(path.join(folderPath, "info.txt"), infoContent, "utf8");

  // рекурсия — спускаемся в поддиректории
  folders.forEach(subFolder => {
    getFolderInfo(path.join(folderPath, subFolder.name));
  });
}

const ROOT_DIR = process.cwd(); // текущая директория, где запущен скрипт
getFolderInfo(ROOT_DIR);

console.log("✅ info.txt успешно созданы во всех папках проекта!");

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00

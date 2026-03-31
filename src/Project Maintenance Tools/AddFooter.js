const fs = require("fs");
const path = require("path");

const COMMENT_TEXT = `AtomGlide Front-end Client
Author: Dmitry Khorov
GitHub: DKhorov
Telegram: @dkdevelop @jpegweb
2025 Project`;

const COMMENT_STYLES = {
  js: ["/*", "*/"],
  jsx: ["/*", "*/"],
  ts: ["/*", "*/"],
  tsx: ["/*", "*/"],
  css: ["/*", "*/"],
  scss: ["/*", "*/"],
  html: ["<!--", "-->"],
  py: ["#", null],
  sh: ["#", null],
  yml: ["#", null],
  yaml: ["#", null],
  md: ["<!--", "-->"],
  json: ["/*", "*/"],
};

function makeComment(ext) {
  const style = COMMENT_STYLES[ext.toLowerCase()];
  if (!style) return null;
  const [start, end] = style;

  const lines = COMMENT_TEXT.split("\n");

  if (end) {
    const body = lines.map(l => ` ${l}`).join("\n");
    return `\n${start}\n${body}\n${end}\n`;
  } else {
    return "\n" + lines.map(l => `${start} ${l}`).join("\n") + "\n";
  }
}

function appendCommentToFile(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const comment = makeComment(ext);
  if (!comment) return false;

  try {
    fs.appendFileSync(filePath, comment, "utf8");
    return true;
  } catch (err) {
    console.error("❌ Ошибка записи:", filePath, err.message);
    return false;
  }
}

function processFolder(folderPath) {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  let added = 0;
  let skipped = 0;

  for (const item of items) {
    const fullPath = path.join(folderPath, item.name);

    if (["node_modules", ".git", "dist", "build"].some(skip => fullPath.includes(skip))) {
      continue;
    }

    if (item.isDirectory()) {
      const { added: a, skipped: s } = processFolder(fullPath);
      added += a;
      skipped += s;
    } else {
      const ext = path.extname(item.name).slice(1).toLowerCase();
      if (COMMENT_STYLES[ext]) {
        if (appendCommentToFile(fullPath)) added++;
        else skipped++;
      } else {
        skipped++;
      }
    }
  }

  return { added, skipped };
}

const ROOT = process.cwd();
console.log(`📂 Обработка проекта: ${ROOT}`);
const { added, skipped } = processFolder(ROOT);
console.log(`✅ Комментарии добавлены: ${added}`);
console.log(`⏭ Пропущено файлов: ${skipped}`);

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

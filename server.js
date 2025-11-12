// ✅ KAPI CLOUD ASSISTANT (Render fixed version)

import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ⚙️ Cấu hình để Render hiểu file HTML là trang web
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "index.html");
  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      console.error("Lỗi đọc index.html:", err);
      res.status(500).send("Lỗi đọc file index.html");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });
});

// ⚙️ Cấp quyền file tĩnh (CSS, JS, ảnh)
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const upload = multer({ dest: "uploads/" });
const FB_API = "https://graph.facebook.com/v20.0";

// 📤 API đăng bài lên Fanpage
app.post("/post", upload.single("image"), async (req, res) => {
  const { caption, pageId, pageToken } = req.body;
  const image = req.file;
  if (!image) return res.send("❌ Chưa có ảnh để đăng");

  try {
    const result = await axios.post(
      `${FB_API}/${pageId}/photos`,
      {
        url: `https://kapi-cloud-assistant.onrender.com/uploads/${image.filename}`,
        caption: caption || "Ảnh mới từ KAPI Assistant ☁️",
        published: true,
        access_token: pageToken,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    res.send(`✅ Đăng bài thành công! ID bài viết: ${result.data.post_id}`);
  } catch (err) {
    console.error("❌ Lỗi khi đăng bài:", err.message);
    res.send("❌ Lỗi khi đăng bài: " + err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại cổng ${PORT}`));

// ========== KAPI CLOUD ASSISTANT ==========
// Server chạy ổn định trên Render / Node.js 22
// ==========================================

// Các thư viện cần thiết
import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Định nghĩa đường dẫn tuyệt đối
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Chỉ định thư mục chứa file tĩnh (HTML, CSS, JS, ảnh…)
app.use(express.static(path.join(__dirname, "public")));

// Cấu hình nơi lưu ảnh upload
const upload = multer({ dest: "uploads/" });

// URL API của Facebook
const FB_API = "https://graph.facebook.com/v20.0";

// ========== ROUTES ==========

// 🏠 Trang chủ
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Lỗi đọc file index.html");
    } else {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(data);
    }
  });
});

// 📤 API Đăng bài lên Fanpage
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
    console.error("Lỗi khi đăng bài:", err.message);
    res.send("❌ Lỗi khi đăng bài: " + err.message);
  }
});

// ========== SERVER ==========

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Server chạy tại cổng ${PORT}`)
);

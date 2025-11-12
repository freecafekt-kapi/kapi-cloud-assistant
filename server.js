import express from "express";
import multer from "multer";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ dest: "uploads/" });
const FB_API = "https://graph.facebook.com/v20.0";

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/post", upload.single("image"), async (req, res) => {
  const { caption, pageId, pageToken } = req.body;
  const image = req.file;
  if (!image) return res.send("❌ Chưa có ảnh để đăng");

  try {
    const result = await axios.post(
      `${FB_API}/${pageId}/photos`,
      {
        url: `https://your-app-name.onrender.com/${image.filename}`,
        caption: caption || "Ảnh mới từ KAPI Assistant",
        published: true,
        access_token: pageToken,
      }
    );
    res.send(`✅ Đăng thành công! ID bài: ${result.data.post_id}`);
  } catch (err) {
    res.send("❌ Lỗi khi đăng bài: " + err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Server chạy trên cổng ${PORT}`)
);

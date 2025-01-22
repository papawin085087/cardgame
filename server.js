const express = require("express");
const app = express();
const path = require("path");

const PORT = 3000;

// เสิร์ฟไฟล์ Static
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

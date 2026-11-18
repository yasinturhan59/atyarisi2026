import express from "express";
import { TikTokLive, label } from "ttl-live";

const app = express();
app.use(express.json());

let tiktok = null;
let connected = false;
let gifts = [];

app.get("/", (req, res) => {
  res.json({
    durum: "At Yarisi sunucusu calisiyor",
    tiktok: connected ? "Bagli" : "Bagli degil"
  });
});

app.get("/gifts", (req, res) => {
  res.json(gifts);
});

app.post("/connect", async (req, res) => {
  try {
    if (connected) {
      return res.json({ durum: "TikTok zaten bagli" });
    }

    tiktok = new TikTokLive("@bytyazilim");

    tiktok.on("gift", event => {
      if (event.streakable && !event.repeatEnd) return;

      const gift = {
        kullanici: label(event.user),
        hediye: event.giftName,
        adet: event.repeatCount || 1
      };

      gifts.push(gift);
      console.log("HEDIYE:", gift);
    });

    await tiktok.connect();
    connected = true;

    res.json({ durum: "TikTok baglandi" });

  } catch (error) {
    connected = false;
    res.status(500).json({ hata: error.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("At Yarisi sunucusu hazir:", PORT);
});

import express from "express";
import { TikTokLive, label } from "ttl-live";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

let tiktok = null;
let connected = false;
let gifts = [];
const clients = new Set();

function sendToGames(gift) {
  const data = JSON.stringify(gift);
  for (const client of clients) {
    client.write(event: gift\ndata: ${data}\n\n);
  }
}

app.get("/", (req, res) => {
  res.json({
    durum: "At Yarisi sunucusu calisiyor",
    tiktok: connected ? "Bagli" : "Bagli degil"
  });
});

app.get("/gifts", (req, res) => res.json(gifts));

app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);
  res.write(": baglanti acildi\n\n");

  req.on("close", () => clients.delete(res));
});

app.post("/connect", async (req, res) => {
  try {
    if (connected) {
      return res.json({ durum: "TikTok zaten bagli" });
    }

    tiktok = new TikTokLive("@bytyazilim", {
      fetchGifts: true
    });

    tiktok.on("gift", event => {
      if (event.streakable && !event.repeatEnd) return;

      const gift = {
        kullanici: label(event.user),
        hediye: event.giftName,
        adet: event.repeatCount || 1
      };

      gifts.push(gift);
      sendToGames(gift);
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

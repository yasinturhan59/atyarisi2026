import express from "express";
import { TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";

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
    if (tiktok) {
      await tiktok.disconnect();
    }

    tiktok = new TikTokLiveConnection("bytyazilim", {
      enableExtendedGiftInfo: true
    });

    tiktok.on(WebcastEvent.GIFT, data => {
      const giftType = data.gift?.type ?? data.giftDetails?.giftType;

      if (giftType === 1 && !data.repeatEnd) return;

      const gift = {
        kullanici: data.user?.uniqueId || "Bilinmiyor",
        hediye: data.gift?.name || data.giftDetails?.giftName || String(data.giftId),
        adet: data.repeatCount || 1
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

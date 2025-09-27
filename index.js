import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// RapidAPI key
const RAPID_API_KEY = "1c86d6005emsh2aafe9c31f78bb3p11c09ajsn4c3f09d055c1";

// Format helper
function formatResult(videoData, source = "rapidapi") {
  if (!videoData) return null;

  if (source === "rapidapi") {
    return {
      creator: "Corex",
      status: true,
      music: videoData.music || null,
      video: videoData.play || null,
      no_watermark: videoData.play || null,
      author: videoData.author?.unique_id || null,
      cover: videoData.cover || null,
      stats: {
        likes: videoData.digg_count,
        comments: videoData.comment_count,
        shares: videoData.share_count,
        views: videoData.play_count,
      },
      userpp: videoData.author?.avatar || null,
    };
  }

  if (source === "tikwm") {
    return {
      creator: "Corex",
      status: true,
      music: videoData.music?.play_url || null,
      video: videoData.play || null,
      no_watermark: videoData.play || null,
      author: videoData.author?.unique_id || null,
      cover: videoData.cover || null,
      stats: {
        likes: videoData.digg_count,
        comments: videoData.comment_count,
        shares: videoData.share_count,
        views: videoData.play_count,
      },
      userpp: videoData.author?.avatar || null,
    };
  }

  return null;
}

// Endpoint
app.get("/api/download", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "TikTok URL is required" });
  }

  try {
    // 1️⃣ Try RapidAPI
    const rapidRes = await fetch(
      `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(
        url
      )}&hd=1`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": "tiktok-video-no-watermark2.p.rapidapi.com",
        },
      }
    );

    const rapidData = await rapidRes.json();
    if (rapidData?.data) {
      return res.json(formatResult(rapidData.data, "rapidapi"));
    }

    // 2️⃣ If RapidAPI fails → fallback TikWM
    const tikwmRes = await fetch(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
    );
    const tikwmData = await tikwmRes.json();

    if (tikwmData?.data) {
      return res.json(formatResult(tikwmData.data, "tikwm"));
    }


    return res
      .status(500)
      .json({ error: "Failed to fetch TikTok video from both APIs" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

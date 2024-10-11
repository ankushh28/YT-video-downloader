const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download-video', async (req, res) => {
    const videoUrl = req.body.url;

    try {
        // Fetch video info from the external API
        const response = await axios.post(`https://submagic-free-tools.fly.dev/api/youtube-info`, {
            'url': videoUrl
        }, {
            headers: {
                'accept': '*/*',
                'accept-language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'origin': 'https://submagic-free-tools.fly.dev',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://submagic-free-tools.fly.dev/youtube-downloader',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
            }
        });

        // Find the video format with audio
        const videoWithAudio = response.data.formats.find(f => f.type === 'video_with_audio');
        if (!videoWithAudio) {
            return res.status(400).json({ error: "Not able to download video." });
        }

        // Fetch the video file using the download URL
        const videoResponse = await axios.get(videoWithAudio.url, { responseType: 'arraybuffer' });
        if (videoResponse.status !== 200) {
            return res.status(400).json({ error: "Failed to fetch video file." });
        }

        // Set headers for file download
        res.set({
            'Content-Disposition': `attachment; filename="video.mp4"`,
            'Content-Type': 'video/mp4',
            'Content-Length': videoResponse.data.length
        });

        res.send(videoResponse.data);
    } catch (error) {
        console.error('Error fetching video:', error.message);
        res.status(500).json({ error: "Failed to fetch video details." });
    }
});

// Start the server
app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running on port " + (process.env.PORT || 5000));
})

app.get("/", (req, res) => {
    res.send("Hello, World");
})


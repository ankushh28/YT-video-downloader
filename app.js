const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download-video', async (req, res) => {
    const videoUrl = req.body.url;
    try {
        const response = await axios.post(
            'https://submagic-free-tools.fly.dev/api/youtube-info',
            { 'url': videoUrl }
        );
        console.log(response)
        const videoWithAudio = response.data.formats.find(f => f.type === 'video_with_audio');
        if (!videoWithAudio) {
            return res.status(400).json({ error: "Not able to download video." });
        }

        const videoStream = await axios.get(videoWithAudio.url, { responseType: 'stream' });

        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', videoStream.headers['content-type']);

        videoStream.data.pipe(res);
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
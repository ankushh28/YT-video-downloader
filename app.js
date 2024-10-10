const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download-video', async (req, res) => {
    const videoUrl = req.body.url;
    try {
        const response = await axios.get(`https://nuum.mnuu.nu/api/v1/convert?sig=OLjO1WtkclhUN4xD5rHaWAy5lfb1Kt7T9PN8f8c4loK5%2FmYcUUp5bkdqAf3F4hL9cNnk8GiDvAgI5q447W%2FZdLm%2F%2FrgfjhWNy%2FNxene5dt1%2FsrEX49qfP2Azo7g0ssyp9wtYco7VXDD7hXEvj2kiLDX58Wdt16awdyIP5QFh0%2BVroFoJaIheQDkGFA4Ehx3efkkpqs4QcrCcemsmG0rq%2FW6kXvcovBRvhMh6FvaetshyNaR6ZBVydK3IExZFm31CTzmaS8mzF27hTtaotl4r6zcNv98edxkGXDtg9wmMocGwOol9ezqcKBx6vJiHJXqQ7EoBQoMWeUJy4g%2FqwKID%2Bw%3D%3D&v=${videoUrl}&f=mp4&_=0.7166191071766066`,
        {
            headers: {
                'Accept': '*/*',
                'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Origin': 'https://y2mate.nu',
                'Pragma': 'no-cache',
                'Referer': 'https://y2mate.nu/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
              }
        });
        console.log(response)
        if (response.data.error>0) {
            return res.status(400).json({ error: "Not able to download video." });
        }
        return res.status(200).json({ url: response.data.downloadURL});
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
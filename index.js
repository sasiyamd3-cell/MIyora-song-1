app.get('/api/download/yt', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ 
            status: false, 
            message: "url eka dipan kariyo." 
        });
    }

    const USER_AGENT = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36';
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let videoUrl = url;
    try {
        while (videoUrl.includes('%')) {
            videoUrl = decodeURIComponent(videoUrl);
        }
        videoUrl = videoUrl.trim();
    } catch (err) {
        videoUrl = url.trim();
    }


    const runCNVFallback = async (targetUrl) => {
        console.log(`[Fallback] Switching to CNV.cx for URL: ${targetUrl}`);
        try {
            const convertRes = await fetch('https://cnv.cx/v2/converter', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'content-type': 'application/x-www-form-urlencoded',
                    'key': 'YzdiNDc1MmU0NDNiNDAwYjM0MGZjYWVhNzYxZjg4OWY1ZGYwZWJlNGUzNjMzOTU0Nzc4ZDhiNWE0MzU4OTI5NnxNVGM0TmpVMU16QXlOREEzTXc9PQ==',
                    'origin': 'https://frame.y2meta-uk.com',
                    'referer': 'https://frame.y2meta-uk.com/',
                    'user-agent': USER_AGENT
                },
                body: new URLSearchParams({
                    'link': targetUrl,
                    'format': 'mp3',
                    'audioBitrate': '128',
                    'videoQuality': '720',
                    'filenameStyle': 'pretty',
                    'vCodec': 'h264'
                }).toString()
            });

            const convertData = await convertRes.json();
            if (convertData && convertData.url) {
                return {
                    title: convertData.filename || "YouTube Audio/Video",
                    thumbnail: `https://i.ytimg.com/vi/${targetUrl.split('v=')[1] || 'default'}/hqdefault.jpg`,
                    duration: "Unknown",
                    author: "YouTube Creator",
                    downloadUrl: convertData.url
                };
            }
            return null;
        } catch (e) {
            console.error("❌ CNV.cx Fallback Error:", e.message);
            return null;
        }
    };

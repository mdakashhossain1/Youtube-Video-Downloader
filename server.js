const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public')); // Serve HTML and assets

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        console.log('Invalid URL');
        return res.status(400).send('Invalid YouTube URL.');
    }

    const videoId = ytdl.getVideoID(videoUrl);
    const videoInfo = await ytdl.getInfo(videoId);

    const videoPath = path.resolve(__dirname, 'temp', `${videoId}_video.mp4`);
    const audioPath = path.resolve(__dirname, 'temp', `${videoId}_audio.mp3`);
    const outputPath = path.resolve(__dirname, 'downloads', `${videoId}.mp4`);

    // Ensure temporary directories exist
    if (!fs.existsSync(path.resolve(__dirname, 'temp'))) {
        fs.mkdirSync(path.resolve(__dirname, 'temp'));
    }
    if (!fs.existsSync(path.resolve(__dirname, 'downloads'))) {
        fs.mkdirSync(path.resolve(__dirname, 'downloads'));
    }

    try {
        console.log('Starting video and audio download...');

        // Download video and audio streams
        await Promise.all([
            new Promise((resolve, reject) => {
                ytdl(videoUrl, { quality: 'highestvideo' })
                    .pipe(fs.createWriteStream(videoPath))
                    .on('finish', () => {
                        console.log('Video downloaded successfully');
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('Error downloading video:', err);
                        reject(err);
                    });
            }),
            new Promise((resolve, reject) => {
                ytdl(videoUrl, { quality: 'highestaudio' })
                    .pipe(fs.createWriteStream(audioPath))
                    .on('finish', () => {
                        console.log('Audio downloaded successfully');
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('Error downloading audio:', err);
                        reject(err);
                    });
            }),
        ]);

        console.log('Video and audio download complete. Starting merge...');

        // Merge video and audio
        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .outputOptions('-c:v copy') // Copy video codec
            .outputOptions('-c:a aac') // Use AAC for audio codec
            .on('start', () => {
                console.log('FFmpeg started merging video and audio...');
            })
            .on('end', () => {
                console.log('Video and audio merged successfully');
                // Send the merged video for download
                res.download(outputPath, `${videoInfo.videoDetails.title}.mp4`, (err) => {
                    if (err) {
                        console.error('Error during download:', err);
                    }
                    // Clean up temporary files
                    fs.unlink(videoPath, () => {});
                    fs.unlink(audioPath, () => {});
                    fs.unlink(outputPath, () => {});
                });
            })
            .on('error', (err) => {
                console.error('Error during merging:', err);
                res.status(500).send('Error processing video.');
            })
            .save(outputPath);
    } catch (err) {
        console.error('Error downloading video or audio:', err);
        res.status(500).send('Error downloading video.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

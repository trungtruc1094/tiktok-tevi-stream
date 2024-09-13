const { exec } = require('child_process');

// Function to download the livestream for a limited time
function downloadLivestream(flvUrl, outputFileName, duration) {
    // FFmpeg command to download the livestream with increased probesize and analyzeduration
    const ffmpegCommand = `ffmpeg -i "${flvUrl}" -c:v libx265 -crf 26 -preset medium -c:a aac -b:a 128k -t ${duration} ${outputFileName}`;
    

    console.log(`Starting FFmpeg to download the first ${duration / 60} minutes of the livestream...`);

    // Execute the FFmpeg command
    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during FFmpeg execution: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`FFmpeg stderr: ${stderr}`);
        }

        console.log(`FFmpeg stdout: ${stdout}`);
        console.log(`Livestream has been downloaded and saved as: ${outputFileName}`);
        console.log('You can now play the video using VLC.');
    });
}

// The URL of the TikTok livestream
const tiktokLivestreamUrl = 'https://pull-flv-l11-sg01.tiktokcdn.com/stage/stream-2133453103516614699_uhd5b.flv?_session_id=178-20240912171634AC62DE01D080AD2CBBDA.1726161402449&_webnoredir=1&abr_pts=-2800&expire=1727370996&sign=40dbb0fc6fb0997e0dbf1be3d1577906';

// The output file name where the livestream will be saved
const outputFileName = 'livestream_output.flv';

// Duration (in seconds) for 3 minutes
const durationInSeconds = 180;

// Start downloading the livestream for 3 minutes
downloadLivestream(tiktokLivestreamUrl, outputFileName, durationInSeconds);

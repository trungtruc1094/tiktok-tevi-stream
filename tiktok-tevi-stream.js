const puppeteer = require('puppeteer-core');
const { exec } = require('child_process'); // For executing FFmpeg commands

async function detectBigoStream(url, duration = 30000, rtmpServerUrl, executablePath1) {
    const browser = await puppeteer.launch({
        executablePath: executablePath1,
        headless: true,  // Set headless to true to run in headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Variable to store the detected FLV stream URL
    let flvStreamUrl = null;

    // Listen for network requests
    page.on('response', async (response) => {
        try {
            const requestUrl = response.url();

            // Detect URLs that contain 'flv' (FLV video stream URLs)
            if (requestUrl.includes('flv')) {
                console.log(`FLV Stream URL Detected: ${requestUrl}`);
                flvStreamUrl = requestUrl;

                // Once the URL is detected, forward it to the RTMP server
                await forwardToRTMPServer(flvStreamUrl, rtmpServerUrl);

                // Close the browser to stop further exploration
                console.log("Stopping network exploration and closing browser...");
                await browser.close();
            }
        } catch (error) {
            console.error(`Error processing response: ${error}`);
        }
    });

    // Navigate to the Bigo livestream URL
    console.log(`Navigating to Bigo stream URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Listen for the specified duration or until the FLV URL is detected
    console.log(`Listening for network requests for up to ${duration / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, duration));

    // If no FLV URL is detected, close the browser after the timeout
    if (!flvStreamUrl) {
        console.log("No FLV URL detected after the timeout.");
        await browser.close();
    }
}

// Function to forward the FLV stream URL to the RTMP server using FFmpeg
function forwardToRTMPServer(flvUrl, rtmpServerUrl) {
    console.log(`Forwarding FLV stream to RTMP server...`);

    // FFmpeg command to forward the FLV stream to the RTMP server
    const ffmpegCommand = `ffmpeg -i "${flvUrl}" -c copy -f flv ${rtmpServerUrl}`;

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
        console.log(`FLV stream has been forwarded to RTMP server: ${rtmpServerUrl}`);
    });
}

// Function to read input from the command line
const askQuestion = (query) => {
    return new Promise((resolve) => {
        process.stdout.write(query);
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

(async () => {
    // Prompt the user for the RTMP URL, stream key, and Bigo URL
    const rtmpUrl = await askQuestion("Input RTMP URL: ");
    const streamKey = await askQuestion("Input Stream Key: ");
    const bigoUrl = await askQuestion("Input Bigo URL: ");

    const FULL_RTMP_URL = `${rtmpUrl}${streamKey}`;
    const executablePath1 = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

    // Listen for network requests and forward the FLV stream to the RTMP server
    await detectBigoStream(bigoUrl, 30000, FULL_RTMP_URL, executablePath1);

    console.log("Finished detecting stream URLs.");
    process.stdin.pause();  // Stop listening for input
})();

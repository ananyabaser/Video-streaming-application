const fs = require("fs");
const express = require("express");
const app = express();

// route definition for sending html file to browser request
app.get("/", function(req,res){
    res.sendFile(__dirname + "/index.html");
});

// route definition for sending css file to browser request
app.get('/styles.css', function(req, res) {
    res.sendFile(__dirname + "/styles.css");
});

// route definition for sending video file to browser request
app.get("/video", function(req,res){
    // for ensuring a range to the video
    const range = req.headers.range;
    // console.log(range);
    if(!range){
        res.status(400).send("Requires range header");
    }


    //video stats the path of the video and video size
    const videoPath = __dirname + "/template_videos" + "/Horses_9.mp4";
    const videoSize = fs.statSync(videoPath).size; 


    // send video in parts of 1MB size each for the client to load on their browser
    // therefore the client will send repeated requests to the server asking for the 
    // remaining part of video to be sent until the entire video is sent to the client.

    const CHUNK_SIZE = 10 ** 6; // 1MB


    //replace all the non digit characters with empty string and then extract the start byte
    const start = Number(range.replace(/\D/g, "")); 


    // obtain the end byte to be sent to the client
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);


    // Create headers
    const contentLength = end - start + 1; // since start begins from 0
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };


    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);


    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, {start, end});


    // Stream the video chunk to the client
    videoStream.pipe(res);
});

app.listen("3000", function(){
    console.log("Server is active on port 3000");
})
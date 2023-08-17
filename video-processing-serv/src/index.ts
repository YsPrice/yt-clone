import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
const app = express();
app.use(express.json())



app.post("/process-video", (req,res)=> {
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;
    if(!inputFilePath || !outputFilePath){
        res.status(400).send("Bad Request: Missing file path!")
    }
    ffmpeg(inputFilePath)
    .outputOptions("-vf", "scale=-1:360")
    .on("end", ()=> {
     res.status(200).send("Video processing Successful")
     console.log(inputFilePath)
    }).on("error", (err:any, stdout, stderr)=> {
        console.log(`An error Occured! ${err.message}`);
        res.status(500).send(`internal Server Error ${err.message}`)
        console.log("stdout:\n" + stdout);
        console.log("stderr:\n" + stderr);
     
    }).save(outputFilePath)
  

});
const port = process.env.PORT || 3000;

app.listen(port, ()=> {
console.log(`server live at port:${port}`)
});


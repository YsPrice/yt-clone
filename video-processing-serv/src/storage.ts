// File for GCS file interactions and Local File int.
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();
// google bucket names
const rawVideoBucketName = 'yt-clone-ys-raw-videos';
const processedVideoBucketName = 'yt-clone-ys-processed-videos';
// local raw path & local processed path
const localRawVidPath = './raw-videos';
const localProcessedVidPath = './processed-videos';

export function setUpDirectories(){
ensureDirectoryExistence(localRawVidPath);
ensureDirectoryExistence(localProcessedVidPath);
};

// create local dir for raw and processed videos in docker container; Organizes files
export function convertVideo(rawVideoName:string, processedVideoName:string){
    return new Promise<void>((resolve,reject)=>{
        ffmpeg(`${localRawVidPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360")
        .on("end", ()=> {
            console.log('processed successfully!')
        }).on("error", (err:any)=> {
           console.log('ERROR:',err.message);
         
        }).save(`${localProcessedVidPath}/${processedVideoName}`)
      
    })
   

}
// ______DOWNLOAD RAW VID________________

export async function downloadRawVideo(fileName: string){
await storage.bucket(rawVideoBucketName)
.file(fileName)
.download({
    destination:`${localRawVidPath}/${fileName}`
});
console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVidPath}/${fileName}.`)
};
// ______UPLOAD PROCESSED VID______

export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName);
    await storage.bucket(processedVideoBucketName).upload(`${localProcessedVidPath}/${fileName}`,{
        destination:fileName
    });
    console.log(
        `${localProcessedVidPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
      );
    await bucket.file(fileName).makePublic();
};

// DELETE RAW VIDEO

export function deleteRawVideo(fileName:string){
return deleteFile(`${localRawVidPath}/${fileName}`);

};

function deleteFile(filePath:string): Promise<void>{
    return new Promise((resolve,err)=>{
        if(fs.existsSync(filePath)){
            fs.unlink(filePath, (err)=>{
                if(err){
                    console.log(`file deletion failed! ${filePath}`,err)
                }else{
                    console.log(`File deleted at: ${filePath} successful`);
                    resolve();
                }
            });
        }else{
            console.log(`file not found at ${filePath}, try again later.`);
            resolve()
        }

    })
}
function ensureDirectoryExistence(dirPath:string){
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath,{recursive:true});
        console.log(`Directory Created at ${dirPath}`)
    }
}
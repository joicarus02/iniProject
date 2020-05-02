const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;
const fsExtra = require('fs-extra');
const ffmpegHelper = require('./vhelper');
const fs = require("fs");

const mongoose = require('mongoose');

const db_link = "mongodb://localhost:27017/stream";

mongoose.connect(db_link, {useNewUrlParser: true, useUnifiedTopology: true}, function (err) {
     if (err)
         console.error("Error occurred while connecting to DB!");
     else
         console.log("Database connection established successfully");
});

var conn = mongoose.connection;
var ObjectID = require('mongodb').ObjectID;

class Observer extends EventEmitter {
  constructor() {
    super();
  }

  watchFolder(folder) {
    try {
      console.log(
        `[${new Date().toLocaleString()}] Watching for folder changes on: ${folder}`
      );

      var watcher = chokidar.watch(folder, { persistent: true });

      watcher.on('add', async filePath => {
    
        console.log(
			`[${new Date().toLocaleString()}] ${filePath} has been added.`
        );
		
		var halfFileName = await filePath.match(/\w+\/\w+.\w+/);
		//console.log(halfFileName[0]);
		
		var fileName = await filePath.match(/\/\w+/);
		fileName[0]  = fileName[0].replace("\/","");
		
		var filePath = `./source-m3u8/${fileName[0]}`;
		
		if (!fs.existsSync(filePath)){
			getFile(halfFileName[0], fileName[0], 5000)
			
			//console.log(fileName[0]);
			
			var videoName = {
				name: fileName[0],
				_id: new ObjectID()
			};
			
			conn.collection('videos').insertOne(videoName);
		}
		
      });
    } catch (error) {
      console.log(error);
    }
  }
}

function getFile(path, name, timeout) {
    const timeoutO = setInterval(function() {

        const file = path;
        const fileExists = fs.existsSync(file);

        //console.log('Checking for: ', file);
        //console.log('Exists: ', fileExists);

        if (fileExists) {
            clearInterval(timeoutO);
			(async () => {
				console.log('Start Process: ', path);
				await ffmpegHelper.convertToHls(`./source/${name}.mp4`,name);
				console.log(`[${new Date().toLocaleString()}] ${name}.m3u8 is created.`);
			})();
        }
    }, timeout);
};

module.exports = Observer;
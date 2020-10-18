var fs = require('fs');

function sortDirectory(path, files, callback, i, dir) {
    if (!i) {i = 0;}                                            //Init
    if (!dir) {dir = [];}
    if(i < files.length) {                                      //For all files
        fs.lstat(path + '\\' + files[i], function (err, stat) { //Get stats of the file
            if(err) {
                console.log(err);
            }
            if(stat.isDirectory()) {
                dir.push( {
                    'name': files[i],
                    'type':'dir'});
                           //If so, ad it to the list
            }
            else {
                dir.push({
                    'name': files[i],
                    'type': 'file',
                    'size': stat.size,
                    'created': stat.birthtime
                });
            }
            sortDirectory(path, files, callback, i + 1, dir);         //Iterate //Iterate
        });

    } else {
        callback(dir);                                        //Once all files have been tested, return
    }
}

function listDirectory(path, callback) {
    fs.readdir(path, function (err, files) {                    //List all files in the target directory
        if(err) {
            callback(err);                                      //Abort if error
        } else {
            sortDirectory(path, files, function (dir) {     //Get only directory
                callback(dir);
            });
        }
    })
}

module.exports.listDirectory=listDirectory;
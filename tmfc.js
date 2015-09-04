var colors = require('colors');

var packageJSON = require('./package.json');

var fs = require('fs');
var path = require('path');

var moment = require('moment');

console.log('Start'.green, '`Copy file with month results`'.yellow, '(from temich to Kurt)');
console.log(('homepage: '+packageJSON.homepage).grey);

var conf = packageJSON.conf;//s
if (!conf || !conf.absPath || !conf.files || !conf.files.length) {
    console.log('Error: No config data'.red);
    return;
}

var dates = {
    current: {
        year: moment().format('YYYY'),
        month: moment().format('M')
    },
    past: {
        year: void 0,
        month: void 0
    }
};

if (dates.current.month === 1) {
    dates.past.year = dates.current.year - 1;
    dates.past.month = 12;
} else {
    dates.past.year = dates.current.year;
    dates.past.month = dates.current.month - 1;
}

var dirs = {
    current: {
        year: path.resolve(conf.absPath, ''+dates.current.year),
        month: void 0
    },
    past: {
        year: path.resolve(conf.absPath, ''+dates.past.year),
        month: void 0
    }
};
dirs.current.month = path.resolve(dirs.current.year, ''+dates.current.month);
dirs.past.month = path.resolve(dirs.past.year, ''+dates.past.month);

var checkDir = function (dirName) {
    console.log(('--- checkDir '+dirName).grey);
    try {
        fs.mkdirSync(dirName);
        console.log('Directory create'.yellow, dirName);
    } catch(e) {
        if ( e.code !== 'EEXIST' ) {
            console.log('Error: Read dir'.red, dirName);
            throw e;
        } else {
            console.log('Directory exist'.green, dirName);
        }
    }
    try {
        var stats = fs.lstatSync(dirName);
        if (stats.isDirectory()) {
            console.log('Directory open'.green, dirName);
        } else {
            console.log('Error: open dir'.red, dirName);
            throw 'Error: open dir'.red + ' ' + dirName;
        }
    }
    catch (e) {
        console.log('Error: open dir'.red, dirName);
        throw e;
    }
};

checkDir(dirs.current.year);
checkDir(dirs.current.month);

checkDir(dirs.past.year);
checkDir(dirs.past.month);

conf.files.forEach(function (file) {
    try {

        fs.createReadStream(path.resolve(dirs.past.month, file)).pipe(fs.createWriteStream(path.resolve(dirs.current.month, file)));
        console.log('OK copy file'.green, file);
    }
    catch (e) {
        console.log('Error: copy file'.red, file, 'from', path.resolve(dirs.past.month, file), 'to', path.resolve(dirs.current.month, file));
        throw e;
    }
});
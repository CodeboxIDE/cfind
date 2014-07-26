var exec = require('child_process').exec;
var _ = require('lodash');

var exclureDirs = require("./data/excludedirs");

// Prepare a string of the excluded dirs
function excludedDirsStr(dirs) {
    return dirs
    .map(function(dir) {
        return '-not \\( -name \"'+dir+'\" -prune \\)';
    })
    .join(' ');
}
var EXCLUDED_COMMAND = excludedDirsStr(exclureDirs);

var search = function(options, cb) {
    options = _.defaults({}, options || {}, {
        query: "",
        root: "",
        start: undefined,
        limit: 1000,
    });

    if (!options.query || !options.root) return cb(new Error("Need 'query' and 'root'"));

    var cmd = [
        "find",
        "'"+options.root+"'",
        EXCLUDED_COMMAND,
        "-type f",
        "-name '*"+options.query+"*'",
    ].join(' ');

    if(options.start !== undefined) {
        cmd += " | tail -n +'"+options.start+"'";
    }

    if(options.limit !== undefined) {
        cmd += " | head -n '"+options.limit+"'";
    }

    exec(cmd, function (err, stdout, stderr) {
        if (err) return cb(err);

        // Parse files from stdout
        var files = stdout
        .toString()
        // Split by lines
        .split('\n')
        // Filter out empty lines
        .filter(Boolean);

        cb(null, {
            'results': files,
            'matches': files.length,
        });
    }).on('error', cb);
};

module.exports = search;

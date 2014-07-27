var exec = require('child_process').exec;
var _ = require("lodash");
var path = require("path");

var exclureDirs = require("./data/excludedirs");
var extensions = require("./data/extensions");

var escapeRegExp = function(str) {
    return str.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1');
};

var escapeShell = function(str) {
    return str.replace(/([\\"'`$\s\(\)<>])/g, '\\$1');
};

var grepEscapeRegExp = function(str) {
    return str.replace(/[[\]{}()*+?.,\\^$|#\s"']/g, '\\$&');
};

var parseOutput = function(output, options) {
    var contextLineRegex, formatted, lines, mainLineRegex, stats;

    mainLineRegex = /^:?([\s\S]+):(\d+):([\s\S]*)$/;
    contextLineRegex = /^([\s\S]+)\-(\d+)\-([\s\S]*)$/;

    lines = output.split('\n');

    formatted = {};
    stats = {
        numberOfMatches: 0,
        numberOfSearchedFiles: 0
    };

    formatted = lines.map(function(line) {
        return line.trimLeft();
    }).filter(function(line) {
        return mainLineRegex.test(line) || contextLineRegex.test(line);
    }).map(function(line) {
        return line.match(mainLineRegex) || line.match(contextLineRegex);
    }).reduce(function(accu, matches) {
        var fileName, line, lineNumber, _ref;
        _ref = [matches[1], parseInt(matches[2], 10), matches[3]], fileName = _ref[0], lineNumber = _ref[1], line = _ref[2];
        fileName = path.relative(options.root, fileName);
        if (!accu[fileName]) {
            accu[fileName] = [];
        }
        accu[fileName].push({
            lineNumber: lineNumber,
            line: line,
            occurence: mainLineRegex.test(matches[0])
        });
        stats.numberOfMatches += 1;
        return accu;
    }, {});
    stats.numberOfSearchedFiles = Object.keys(formatted).length;

    return {
        results: formatted,
        matches: stats.numberOfMatches,
        files: stats.numberOfSearchedFiles
    };
};

var search = function(options, cb) {
    var query, include, splitText, flags;

    options = _.defaults(options || {}, {
        query: "",
        root: "",
        caseSensitive: true,
        wholeWord: false,
        regExp: false,
        replace: false,
        limit: null
    });

    if (!options.query || !options.root) return cb(new Error("Need 'query' and 'root'"));

    include = (process.platform != "darwin" ? "\\" : "") + "*{" + (extensions.join(',')) + "}";
    if (!options.regExp) {
        splitText = options.query.split('\\n');
        splitText = splitText.map(grepEscapeRegExp);
        options.query = splitText.join('\\n');
    }
    options.query = options.query.replace(new RegExp("\\\'", 'g'), "'\\''");
    options.query = options.query.replace(/-/g, '\\-');

    flags = [
        '-s',                           // Silent mode
        '-r',                           // Recursively search subdirectories listed.
        '-n',                           // Each output line is preceded by its relative line number in the file
        '-A 3',                         // Print num lines of trailing context after each match.
        '-B 3',                         // Print num lines of trailing context before each match.
        '-i',                           // Match case insensitively
        '-w',                           // Only match whole words
        '--color=never',                // Disable color output to get plain text
        '--binary-files=without-match', // Do not search binary files
    ];

    if (process.platform != "darwin") flags.push("-P");
    if (options.caseSensitive) flags.splice(flags.indexOf('-i'), 1);
    if (!options.wholeWord) flags.splice(flags.indexOf('-w'), 1);
    if (options.limit) flags.push("-m " + parseInt(options.limit, 10));

    query = "grep " + (flags.join(' ')) +
    "  --exclude-dir=" + (exclureDirs.join(' --exclude-dir=')) + " --include=" + include + " '" + options.query + "' \"" + (escapeShell(options.root)) + "\"";

    exec(query, function (error, stdout, stderr) {
        if (error) return cb(error);

        cb(null, parseOutput(stdout, options));
    });
};


module.exports = search;

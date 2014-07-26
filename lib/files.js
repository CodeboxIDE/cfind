var _ = require('lodash');
var glob = require("glob");

var search = function(options, cb) {
    options = _.defaults({}, options || {}, {
        query: "",
        root: "",
        start: undefined,
        limit: undefined
    });

    if (!options.query || !options.root) return cb(new Error("Need 'query' and 'root'"));

    glob("**/*"+options.query+"*", {
        'cwd': options.root,
        'mark': true
    }, function (err, files) {
        if (err) return cb(err);

        var results = _.chain(files)
        .filter(function(path) {
            return !(!path.length || path[path.length-1] == "/");
        })
        .map(function(path) {
            return "/"+path;
        })
        .value();

        cb(null, {
            'results': results.slice(options.start, options.limit? (options.start+options.limit) : undefined),
            'matches': _.size(results)
        });
    });
};

module.exports = search;

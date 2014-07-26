var path = require("path");
var cfind = require("../lib");

describe('Find files', function() {
    it('can search', function(done) {
        cfind.files({
            query: "tes",
            root: path.join(__dirname, "fixtures")
        }, function(err, result) {
            if (err) return done(err);

            done(result.matches == 1? null : new Error(""));
        });
    });

    it('supports empty queries', function(done) {
        cfind.files({
            query: "",
            root: path.join(__dirname, "fixtures")
        }, function(err, result) {
            if (err) return done(err);

            done(result.matches == 1? null : new Error(""));
        });
    });
});

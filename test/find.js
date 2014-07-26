var path = require("path");
var cfind = require("../lib");

describe('Find code', function() {
    it('can search', function(done) {
        cfind.find({
            query: "ell",
            root: path.join(__dirname, "fixtures")
        }, done);
    });
});

cfind
=====

Node utility to find (and replace) code.

### Install

```
npm install cfind
```

### Examples

```js
var cfind = require("cfind");

cfind.find({
    query: "jQuery",
    root: "/Users/test/myworkspace"
}, function(err, result) {

});
```

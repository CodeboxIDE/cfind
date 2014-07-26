cfind
=====

[![Build Status](https://travis-ci.org/CodeboxIDE/cfind.png?branch=master)](https://travis-ci.org/CodeboxIDE/cfind)

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

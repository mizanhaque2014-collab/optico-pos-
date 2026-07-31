const fs = require('fs');

let source = fs.readFileSync('Code.gs', 'utf8');

// We will manually extract logic.
// This requires some parsing.

function write(filename, content) {
    fs.writeFileSync('backend/' + filename, content);
}

// Just copy everything to a single file for now if we can't parse it easily, 
// wait, we can just split by function names.
// Or I can just write them directly.

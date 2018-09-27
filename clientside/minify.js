var compressor = require('node-minify');
 
// Using Google Closure Compiler
compressor.minify({
  compressor: 'gcc',
  input: 'src/mt.js',
  output: 'dist/mt.min.js',
  callback: function(err, min) {
    console.log('ready');
  }
});
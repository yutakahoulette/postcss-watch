var R = require("ramda")
var flyd = require("flyd")
var fs = require('fs')
var postcss = require('postcss')

var createDirs = path => {
  // Every directory level in an array (eg ['css', 'css/nonprofits', 'css/nonprofits/recurring_donations']
  var everyDir = R.compose(
    R.dropLast(1) // we don't want the path with the filename at the end (last element in the scan)
  , R.drop(1) // we don't want the first empty array from the scan
  , R.map(R.join('/'))
  , R.scan((arr, p) => R.append(p, arr), [])
  , R.split('/')
  )(path)
  everyDir.map(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  })
}

var compile = (input, output, postcssObj, log) => css =>
  postcssObj
    .process(css, { from: input, to: output })
    .then(result => {
      fs.writeFileSync(output, result.css)
      if(result.map) fs.writeFileSync(output + '.map', result.map)
      console.log('-> compiled to', output)
    })
    .catch(err => console.log('!!! compile error: ', err.message))

var readFile = (input, change$) => 
  fs.readFile(input, (err, data) => change$(data))

var initialize = options => {
  if(!options.plugins) throw "Don't forget to pass in some postcss plugins to postcss-watch"
  var postcssObj = postcss(options.plugins)
  var change$ = flyd.stream()
  createDirs(options.output)
  // readFile(options.input, change$)
  fs.watch(options.input, {}, (eventType, filename) => {
    if(eventType === 'change') readFile(options.input, change$)
  })
  var log = options.verbose ? console.log : function(){}
  flyd.map(css => log(`\n:o] css change detected!`), change$)
  var compile$ = flyd.map(compile(options.input, options.output, postcssObj, log), change$)
  return compile$
}

module.exports = initialize

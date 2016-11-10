
# postcss-watch

Simple helper module that you can import and use to create a postcss watcher script

```js
const postcssWatch = require('postcss-watch')

const input = process.argv[2]

const output = input.replace(/^lib\//, 'public/')

const plugins = [
  require('postcss-import')
, require('autoprefixer')
]

postcssWatch({ input, output, plugins, verbose: true })
```

If you save the above to `watch.js`, then in bash you can:

```sh
node watch.js lib/sidebar/index.css
```

it will watch that file and output (in this example) to public/sidebar/index.css

// Compiles src/water-sales.jsx -> water-sales.js for /sales ("Water Sales.html").
//
// /sales used to ship the JSX inside <script type="text/babel"> and compile it in
// every visitor's browser with @babel/standalone (a 3 MB download plus a compile
// step), which kept phones on a blank page for ~8 s. This runs the exact same
// compiler, version and options ahead of time instead.
//
// Edit src/water-sales.jsx, then run:  npm run build:sales  and commit both files.
const fs = require('fs');
const path = require('path');
const Babel = require('@babel/standalone');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/water-sales.jsx'), 'utf8');

// Same presets/plugins @babel/standalone applies to a classic text/babel script tag.
const { code } = Babel.transform(src, {
  filename: 'water-sales.jsx',
  sourceType: 'script',
  presets: ['react', 'env'],
  plugins: ['transform-class-properties', 'transform-object-rest-spread', 'transform-flow-strip-types'],
  // Whitespace/comment stripping only — no renaming, so runtime behaviour is unchanged.
  minified: true,
  comments: false,
});

const banner = '/* Generated from src/water-sales.jsx by scripts/build-sales.js — do not edit by hand. */\n';
fs.writeFileSync(path.join(root, 'water-sales.js'), banner + code);
console.log('water-sales.js written (' + Math.round((banner + code).length / 1024) + ' KB)');

var path = require('path');
var webpack = require('webpack');

 module.exports = {
   entry: './src/main.ts',
   resolve: {
     extensions: ['.webpack.js', '.web.js', '.ts', '.js']
   },
   module: {
     loaders: [
       { test: /\.ts$/, loader: 'ts-loader' }
     ]
   },
   output: {
     filename: 'bundle.js',
     path: path.resolve(__dirname, 'dist')
   },
   plugins: [
    
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default']
      })
    
  ]
 }
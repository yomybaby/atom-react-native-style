var docgen = require('react-docgen');
const docgenHelpers = require('./docgenHelpers');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');


// path array from https://github.com/facebook/react-native/blob/master/website/server/docsList.js#L100
const stylesForEmbed = [
  '../Libraries/Components/View/ViewStylePropTypes.js',
  '../Libraries/Text/TextStylePropTypes.js',
  '../Libraries/Image/ImageStylePropTypes.js',
];

const stylesWithPermalink = [
  '../Libraries/StyleSheet/LayoutPropTypes.js',
  '../Libraries/StyleSheet/TransformPropTypes.js',
  '../Libraries/Components/View/ShadowPropTypesIOS.js',
  '../Libraries/Components/View/ViewPropTypes.js',
  ...stylesForEmbed,
];

let props = {};
_.each(stylesWithPermalink,function (filepath) {
  var styleInfo = docgen.parse(
    fs.readFileSync(path.resolve('../node_modules/react-native/Libraries/',filepath)),
    docgenHelpers.findExportedObject,
    [
      docgen.handlers.propTypeHandler,
      docgen.handlers.propDocBlockHandler,
    ]
  );
  let className = path.parse(filepath).name
  _.each(styleInfo.props, (propInfo, propName) => {
    styleInfo.props[propName].className = className;
  })
  
  _.extend(props, styleInfo.props);
})

fs.writeFile(path.resolve(__dirname,'../completions/style.json'), JSON.stringify(props,null,2), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved.");
    }
}); 

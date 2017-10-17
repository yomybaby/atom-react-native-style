"use babel";

import styleProvider from './rn-style-provider';

module.exports =  {
  activate(state) {
    console.log('atom-react-native-style package is activated');
  },

  deactivate() {
    console.log('atom-react-native-style package is deactivated');
  },
  getProvider() { 
    return [styleProvider]; 
  },
  serialize() {},
  config: {
    createStyleFunctionName: {
      title: 'StyleSheet create function name',
      description : 'If you use diffrent stylesheet create function, change this option',
      type : 'string',
      default: 'StyleSheet.create'
    }
  }    
};

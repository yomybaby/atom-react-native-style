"use babel";

import styleProvider from './rn-style-provider';

module.exports =  {
  activate(state) {
    console.log('RN package activated');
  },

  deactivate() {
    console.log('RN package deactivated');
  },
  getProvider() { 
    return [styleProvider]; 
  },
  serialize() {},

  toggle() {
    console.log('AtomReactNative was toggled!');
  }
};

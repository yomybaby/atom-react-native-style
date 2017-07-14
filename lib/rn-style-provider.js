"use babel";

import util from './util'
import path from 'path'
import _ from 'lodash'

const PROP_NAME_PREFIXPATTERN = /[a-zA-Z]+[-a-zA-Z]*$/;

export default {
  // This will work on JavaScript and CoffeeScript files, but not in js comments.
  selector: '.source.js',
  disableForSelector: '.source.js .comment',

  // This will take priority over the default provider, which has an inclusionPriority of 0.
  // `excludeLowerPriority` will suppress any providers with a lower priority
  // i.e. The default provider will be suppressed
  inclusionPriority: 1,
  excludeLowerPriority: false,

  // This will be suggested before the default provider, which has a suggestionPriority of 1.
  suggestionPriority: 2,
  
  loadCompletions(){
    this.props = require('../completions/style.json');
  },
  // Required: Return a promise, an array of suggestions, or null.
  filterSuggestions: true,
  getSuggestions(request) {
    
    if(!this.props){
      this.loadCompletions(request);
    }
    let {editor, bufferPosition, scopeDescriptor, prefix, activatedManually} = request;
    
    let rootPath = util.getProjectRootPath(); 
    let completions = [];
    
    // if(isTypingValue(request)){
    //   
    // }
    _.each(this.props,(propInfo, propName)=>{
      if((prefix && firstCharsEqual(propName,prefix)) || !prefix ){
        let htmlName = propInfo.className.toLowerCase().replace(/proptypesios|proptypes/,'-props');

        completions.push({
          text: propName,
          rightLabel: propInfo.type.name,
          description: `RN : a prop of ${propInfo.className}`,
          descriptionMoreURL: `https://facebook.github.io/react-native/docs/${htmlName}.html#${propName.toLowerCase()}`
        });
      }
    });
    
       
    return new Promise(resolve => resolve(completions));
  },

  // (optional): called _after_ the suggestion `replacementPrefix` is replaced
  // by the suggestion `text` in the buffer
  onDidInsertSuggestion({editor, triggerPosition, suggestion}) {},

  // (optional): called when your provider needs to be cleaned up. Unsubscribe
  // from things, kill any processes, etc.
  dispose() {}
};

function isTypingValue() {
  
}

function isTypingPropName({editor, bufferPosition, scopeDescriptor, prefix, activatedManually}) {
  return true;
}

function isTypingStyleName() {
  
}


// function getPropertyNamePrefix(bufferPosition, editor){
//   let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
//   let result = ROP_NAME_PREFIXPATTERN.exec(line);
//   return result?result[0]:undefined;
// }
    
    
function firstCharsEqual(str1, str2) {
  
  return str1[0].toLowerCase() === str2[0].toLowerCase();
}  

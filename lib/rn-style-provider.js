"use babel";

import util from './util'
import path from 'path'
import _ from 'lodash'

const PROP_NAME_PREFIXPATTERN = /[a-zA-Z]+[-a-zA-Z]*$/;
const PROP_VALUE_PREFIXPATTERN = /(["'])?([-a-zA-Z0-9-_\/]*)(\1)?\s*:\s*$/;

export default {
  selector: '.source.js',
  disableForSelector: '.source.js .comment',
  inclusionPriority: 1,
  excludeLowerPriority: false,
  suggestionPriority: 2,
  filterSuggestions: true,
  
  loadCompletions(){
    this.props = require('../completions/style.json');
    
    // this.propNameCompletions = _.map(this.props, (propInfo,propName) => {
    //   let htmlName = propInfo.className.toLowerCase().replace(/proptypesios|proptypes/,'-props');
    //   return {
    //     text: propName,
    //     rightLabel: propInfo.type.name,
    //     description: `RN : a prop of ${propInfo.className}`,
    //     descriptionMoreURL: `https://facebook.github.io/react-native/docs/${htmlName}.html#${propName.toLowerCase()}`
    //   };
    // });
  },
  
  getSuggestions(request) {
    
    if(!this.props){
      this.loadCompletions(request);
    }
    let {editor, bufferPosition, scopeDescriptor, prefix, activatedManually} = request;
    
    let rootPath = util.getProjectRootPath(); 
    let completions = [];
    
    let nameBeforeColon = getNameBeforeColon(request) || '';
    console.log(nameBeforeColon);
    if(nameBeforeColon){ // isTypingValue
      let propInfo = this.props[nameBeforeColon];
      if(propInfo){
        let htmlName = propInfo.className.toLowerCase().replace(/proptypesios|proptypes/,'-props');
        switch (propInfo.type.name) {
          case 'enum':
          if(_.isArray(propInfo.type.value)){
            propInfo.type.value.forEach(({value})=>{
              completions.push({
                text: value+',',
                displayText: value,
                description: `RN : a value of ${nameBeforeColon}`,
                descriptionMoreURL: `https://facebook.github.io/react-native/docs/${htmlName}.html#${nameBeforeColon.toLowerCase()}`
              })
            });
          }
            break;
            
          case 'bool':
          ['true','false'].forEach(v=>{
            completions.push({
              text: v+',',
              displayText: v,
              description: `RN : a value of ${nameBeforeColon}`,
              descriptionMoreURL: `https://facebook.github.io/react-native/docs/${htmlName}.html#${nameBeforeColon.toLowerCase()}`
            })
          });
            break;
            
          default:
        }
      }
    } else if(isTypingPropName(request)){
      _.each(this.props, (propInfo,propName) => {
        if((prefix && firstCharsEqual(prefix,propName))){
          let htmlName = propInfo.className.toLowerCase().replace(/proptypesios|proptypes/,'-props');
          completions.push({
            text: propName+':',
            displayText: propName,
            rightLabel: propInfo.type.name==="custom"?propInfo.type.raw:propInfo.type.name,
            description: `RN : a prop of "${propInfo.className}" prop`,
            descriptionMoreURL: `https://facebook.github.io/react-native/docs/${htmlName}.html#${propName.toLowerCase()}`
          });
        }
      })
    }
    return new Promise(resolve => resolve(completions));
  },

  // (optional): called _after_ the suggestion `replacementPrefix` is replaced
  // by the suggestion `text` in the buffer
  onDidInsertSuggestion({editor, triggerPosition, suggestion}) {},

  // (optional): called when your provider needs to be cleaned up. Unsubscribe
  // from things, kill any processes, etc.
  dispose() {}
};

// isTypingValue
function getNameBeforeColon(request) {
  let linePrefix = util.getAllPrefixFromLine(request);
  let regResult = PROP_VALUE_PREFIXPATTERN.exec(linePrefix);
  if(regResult){
    return regResult[2];
  }else{
    return false;
  }
}

function getPropName() {
  
}

function isTypingPropName({editor, bufferPosition, scopeDescriptor, prefix, activatedManually}) {
  return true;
}

function isTypingStyleName() {
  
}


// function getPropNamePrefix(bufferPosition, editor){
//   let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
//   let result = ROP_NAME_PREFIXPATTERN.exec(line);
//   return result?result[0]:undefined;
// }
    
    
function firstCharsEqual(str1, str2) {
  
  return str1[0].toLowerCase() === str2[0].toLowerCase();
}  

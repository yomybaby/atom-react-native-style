"use babel";

import util from './util';
import path from 'path';
import _ from 'lodash';
import Selector from './selector';

const PROP_NAME_PREFIXPATTERN = /[a-zA-Z]+[-a-zA-Z]*$/;
const PROP_VALUE_PREFIXPATTERN = /([-a-zA-Z0-9-_\/]*)\s*:\s*["']?([-a-zA-Z0-9-_\/]*)?$/;

export default {
  selector: '.source.js',
  disableForSelector: '.source.js .comment',
  inclusionPriority: 1,
  excludeLowerPriority: false,
  suggestionPriority: 100,
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
  
  getPrefix({editor, bufferPosition}) {
    // Whatever your prefix regex might be
    let regex = /'?[\w0-9_-]*$/;

    // Get the text for the line up to the triggered buffer position
    let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);

    // Match the regex to the line, and return the match
    let result = line.match(regex);
    return result?result[0]:'';
  },
  
  getSuggestions(request) {
    
    if(!this.props){
      this.loadCompletions(request);
    }
    let {editor, bufferPosition, scopeDescriptor, prefix, activatedManually} = request;
    
    let styleFunctionName = atom.config.get('atom-react-native-style.createStyleFunctionName');
    styleFunctionName = styleFunctionName.replace(/\./g, '\\.') + '\\s*$';
     
    let usingCreateStyleSheet = false;
    let inlineStyle = false;
    
    // TODO : make sure inside "StyleSheet.create"
    let {start, end} = Selector.getInsideBrackets(request, '(', ')', true);
    
    if(start){
      let line = editor.getTextInRange([[start.row, 0], start]);
      usingCreateStyleSheet = new RegExp(styleFunctionName).test(line);
    } 
    
    if( !usingCreateStyleSheet ){
      let innerBraketPosition = Selector.getInsideBrackets(request, '{', '}', true);
      if(innerBraketPosition.start){
        let styleBraketPosition = Selector.getInsideBrackets({
          bufferPosition: innerBraketPosition.start, editor
        }, '{', '}', true);
        if(styleBraketPosition.start){
          // style = {{ something:xxx }}
          let line = editor.getTextInRange([[styleBraketPosition.start.row, 0], styleBraketPosition.start]);
          inlineStyle = /\b[a-zA-Z]*[sS]tyle=/.test(line);
        } else {
          let arrayBraketPostion = Selector.getInsideBrackets({
            bufferPosition: innerBraketPosition.start, editor
          }, '[', ']', true);
          if(arrayBraketPostion.start){
            let styleBraketPosition = Selector.getInsideBrackets({
              bufferPosition: arrayBraketPostion.start, editor
            }, '{', '}', true);
            if(styleBraketPosition.start){
              // style = {[{ something:xxx },{}]}
              let line = editor.getTextInRange([[styleBraketPosition.start.row, 0], styleBraketPosition.start]);
              inlineStyle = /\b[a-zA-Z]*[sS]tyle=/.test(line);
            }
          }
        }
      }
    }
    
    if(!inlineStyle && !usingCreateStyleSheet) return;
    
    let rootPath = util.getProjectRootPath(); 
    let completions = [];
    
    
    let nameBeforeColon = getNameBeforeColon(request) || '';
    if(nameBeforeColon){ // isTypingValue
      let propInfo = this.props[nameBeforeColon];
      if(propInfo){
        let htmlName = propInfo.className.toLowerCase().replace(/proptypesios|proptypes/,'-props');
        switch (propInfo.type.name) {
          case 'enum':
          if(_.isArray(propInfo.type.value)){
            // default, prefix without quotation even has quotation
            //`newPrefix` has quotation if exsits
            let newPrefix = this.getPrefix(request); 
            console.log(newPrefix);
            propInfo.type.value.forEach(({value})=>{
              let valueWithoutQuo = value.replace(/\'/g,'');
              let hasPrefixWithQuotation = !newPrefix || newPrefix.startsWith(`'`);
              completions.push({
                type: 'value',
                text: hasPrefixWithQuotation?value:valueWithoutQuo,
                displayText: value,
                replacementPrefix: newPrefix,
                description: `RN : a value of ${nameBeforeColon}`,
                descriptionMoreURL: `https://facebook.github.io/react-native/docs/${htmlName}.html#${nameBeforeColon.toLowerCase()}`,
                onDidInsertSuggestion: ({editor, triggerPosition, suggestion}) => {
                  if(hasPrefixWithQuotation){ // remove duplicated single qutation;
                    let replacedEndPosition = triggerPosition.column - suggestion.replacementPrefix.length + suggestion.text.length
                    let targetRange = [
                      [triggerPosition.row, replacedEndPosition],
                      [triggerPosition.row, replacedEndPosition+1]
                    ];
                    let followedChar = editor.getTextInRange(targetRange);
                    
                    if(followedChar === `'`){
                      editor.setTextInBufferRange(targetRange, '');
                    }
                  } else { // add single quotation;
                    let targetRange = [
                      [triggerPosition.row, triggerPosition.column - suggestion.replacementPrefix.length],
                      [triggerPosition.row, triggerPosition.column - suggestion.replacementPrefix.length + suggestion.text.length]
                    ];
                    editor.setTextInBufferRange(targetRange, `'${suggestion.text}'`);
                  }
                  
                  // add , or not...
                }
              });
            });
          }
            break;
            
          case 'bool':
          ['true','false'].forEach(v=>{
            completions.push({
              type: 'value',
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
            type: 'property',
            text: propName + ': ',
            displayText : propName,
            rightLabel: propInfo.type.name==="custom"?propInfo.type.raw:propInfo.type.name,
            description: `RN : a prop of "${propInfo.className}" prop`,
            descriptionMoreURL: `https://facebook.github.io/react-native/docs/${htmlName}.html#${propName.toLowerCase()}`
          });
          // },{
          //   postfix : ': '
          // }));
        }
      })
    }
    return new Promise(resolve => resolve(completions));
  },

  triggerAutocomplete: (editor) => {
    atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {activatedManually: false})
  },
    
  // (optional): called _after_ the suggestion `replacementPrefix` is replaced
  // by the suggestion `text` in the buffer
  onDidInsertSuggestion({editor, triggerPosition, suggestion}) {
    // if each suggestion has own onDidInsertSuggestion, call onDidInsertSuggestion
    suggestion.onDidInsertSuggestion && suggestion.onDidInsertSuggestion({editor, triggerPosition, suggestion});
    
    // Righft after autocompleting proerty name, value completions will be shown.
    if(suggestion.type === 'property'){
      setTimeout(this.triggerAutocomplete.bind(this, editor), 1)
    }
  },

  // (optional): called when your provider needs to be cleaned up. Unsubscribe
  // from things, kill any processes, etc.
  dispose() {}
};

// isTypingValue
function getNameBeforeColon(request) {
  let linePrefix = util.getAllPrefixFromLine(request);
  let regResult = PROP_VALUE_PREFIXPATTERN.exec(linePrefix);
  if(regResult){
    return regResult[1];
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

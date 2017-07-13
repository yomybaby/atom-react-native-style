"use babel";

export default {
  // This will work on JavaScript and CoffeeScript files, but not in js comments.
  selector: '.source.js, .source.coffee',
  disableForSelector: '.source.js .comment',

  // This will take priority over the default provider, which has an inclusionPriority of 0.
  // `excludeLowerPriority` will suppress any providers with a lower priority
  // i.e. The default provider will be suppressed
  inclusionPriority: 1,
  excludeLowerPriority: false,

  // This will be suggested before the default provider, which has a suggestionPriority of 1.
  suggestionPriority: 2,

  // Required: Return a promise, an array of suggestions, or null.
  getSuggestions({editor, bufferPosition, scopeDescriptor, prefix, activatedManually}) {
    console.log('getSuggestions');
    return new Promise(resolve => resolve([{text: 'something'}]));
  },

  // (optional): called _after_ the suggestion `replacementPrefix` is replaced
  // by the suggestion `text` in the buffer
  onDidInsertSuggestion({editor, triggerPosition, suggestion}) {},

  // (optional): called when your provider needs to be cleaned up. Unsubscribe
  // from things, kill any processes, etc.
  dispose() {}
};

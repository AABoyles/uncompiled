(function (extension) {
  if (typeof showdown !== 'undefined') {
    // global (browser or nodejs global)
    extension(showdown);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['showdown'], extension);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = extension(require('showdown'));
  } else {
    // showdown was not found so we throw
    throw Error('Could not find showdown library');
  }
}(function (showdown) {
  // loading extension into shodown
  showdown.extension('tufte', function () {
    let sidenoteCounter = 0;
    let sidenoteparser = {
      type: 'output',
      regex: /<a href="sidenote">(.*?)<\/a>/g,
      replace: `<label for="sn-${++sidenoteCounter}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="sn-sn-${sidenoteCounter}" class="margin-toggle"><span class="sidenote">$1</span>`
    };
  
    let marginnoteCounter = 0;
    let marginnoteparser = {
      type: 'output',
      regex: /<a href="marginnote">(.*?)<\/a>/g,
      replace: `<label for="mn-${++marginnoteCounter}" class="margin-toggle"></label><input type="checkbox" id="mn-${marginnoteCounter}" class="margin-toggle"><span class="marginnote">$1</span>`
    };
  
    //Todo: Parse the DOM and do this properly.
    let sectionwrapper = {
      type: 'output',
      regex: /<h2(.*?)>/g,
      replace: '</section><section><h2$1>'
    };
  
    let figurewrapper = {
      type: 'output',
      regex: /<p>.*?<img(.*?)>.*?<\/p>/g,
      replace: '<figure><img$1></figure>'
    };
  
    let iframewrapper = {
      type: 'output',
      regex: /(<iframe.*?>)/g,
      replace: '<figure class="iframe-wrapper">$1</figure>'
    };

    return [sidenoteparser, marginnoteparser, sectionwrapper, figurewrapper, iframewrapper];
  });
}));

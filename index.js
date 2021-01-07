(function(){
  let params = new URLSearchParams(document.location.search.substring(1));
  let post = params.get('post') || 'README.md';
  let main = document.querySelector('main');
  let converter = new showdown.Converter({
    'tables': true, 
    'simplifiedAutoLink': true
  });
  fetch(post)
    .then(res => res.text())
    .then(md => {
      main.innerHTML = converter.makeHtml(md);
      document.querySelectorAll('pre code').forEach(hljs.highlightBlock);
      renderMathInElement(main);
    });
})();
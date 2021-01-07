(function(){
  let params = new URLSearchParams(document.location.search.substring(1));
  let post = params.get("post") || "README.md";
  fetch(post)
    .then(res => res.text())
    .then(md => {
      let main = document.querySelector('main');
      let converter = new showdown.Converter({
        'tables': true, 
        'simplifiedAutoLink': true
      });
      let html = converter.makeHtml(md);
      console.log(converter);
      main.innerHTML = html;
      document.querySelectorAll('pre code').forEach(hljs.highlightBlock);
      renderMathInElement(main);
    });
})();
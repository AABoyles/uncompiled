(function(){

  let header = document.querySelector('header');
  let addMenuItem = item => {
    let node = document.createElement('span');
    if(typeof item == "string"){
      node.innerText = item;
    } else {
      node.innerHTML = `<a href="${item.url || config.baseURL || '#'}">${item.text}</a>`;
      if(item.style) node.style = item.style;
    }
    header.append(node);
  };

  fetch('config.json')
    .then(res => res.json())
    .then(config => {
      self.config = config;
      document.querySelector('title').innerText = config.title;
      config.menu.forEach(addMenuItem);
      header.classList.remove('hidden');
    });

  let main = document.querySelector('main');
  let article = document.querySelector('article');

  let converter = new showdown.Converter({
    'tables': true, 
    'simplifiedAutoLink': true,
    'extensions': ['tufte']
  });

  let parser = new DOMParser();

  const loadScript = async function(url){
    let script   = document.createElement("script");
    script.type  = "text/javascript";
    await fetch(url).then(r => r.text().then(s => script.innerHTML = s));
    document.body.appendChild(script);
  };

  let renderPage = page => {
    main.classList.add('hidden');
    fetch(page)
      .then(res => res.text())
      .then(md => {
        let html = converter.makeHtml(md);
        article.innerHTML = html;

        document.querySelectorAll('pre code').forEach(hljs.highlightBlock);

        renderMathInElement(main, {
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true}
          ]
        });

        let content = parser.parseFromString(html, 'text/html');
        let promises = [];
        let scripts = [];
        content.querySelectorAll('script').forEach(script => {
          if(script.src) promises.push(loadScript(script.src));
          else scripts.push(script.innerText);
        });
        Promise.all(promises).then(() => scripts.forEach(eval));
        main.classList.remove('hidden');
      });
  }

  let params = new URLSearchParams(document.location.search.substring(1));
  renderPage(params.get('q') || 'README.md');
})();
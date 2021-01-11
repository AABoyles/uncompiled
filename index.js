(function(){

  let header = document.querySelector('header');
  let addMenuItem = item => {
    let node = document.createElement('span');
    if(typeof item == "string"){
      node.innerText = item;
    } else {
      node.innerHTML = `<a href="${item.url}">${item.text}</a>`;
    }
    header.append(node);
  };

  fetch('config.json')
    .then(res => res.json())
    .then(config => {
      config.menu.forEach(addMenuItem);
    });

  let params = new URLSearchParams(document.location.search.substring(1));
  let post = params.get('q') || 'README.md';
  let main = document.querySelector('article');

  let sidenoteCounter = 0;
  let sidenoteparser = () => [{
    type: 'output',
    regex: /<a href="sidenote">(.*?)<\/a>/g,
    replace: `<label for="sn-${++sidenoteCounter}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="sn-sn-${sidenoteCounter}" class="margin-toggle"><span class="sidenote">$1</span>`
  }];

  marginnoteCounter = 0;
  let marginnoteparser = () => [{
    type: 'output',
    regex: /<a href="marginnote">(.*?)<\/a>/g,
    replace: `<label for="mn-${++marginnoteCounter}" class="margin-toggle"></label><input type="checkbox" id="mn-${marginnoteCounter}" class="margin-toggle"><span class="marginnote">$1</span>`
  }];

  //Todo: Parse the DOM and do this properly.
  let sectionwrapper = () => [{
    type: 'output',
    regex: /<h2(.*?)>/g,
    replace: '</section><section><h2$1>'
  }];

  let converter = new showdown.Converter({
    'tables': true, 
    'simplifiedAutoLink': true,
    'extensions': [sidenoteparser, marginnoteparser, sectionwrapper]
  });

  let parser = new DOMParser();

  const loadScript = async function(url){
    let script   = document.createElement("script");
    script.type  = "text/javascript";
    await fetch(url).then(r => r.text().then(s => script.innerHTML = s));
    document.body.appendChild(script);
  };

  fetch(post)
    .then(res => res.text())
    .then(md => {
      let html = converter.makeHtml(md);
      main.innerHTML = html;

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
    });
})();
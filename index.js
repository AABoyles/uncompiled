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
    return header.appendChild(node);
  };

  fetch('config.json')
    .then(res => res.json())
    .then(config => {
      self.config = config;
      document.querySelector('title').innerText = config.title;
      config.menu.forEach(addMenuItem);
      header.classList.remove('hidden');
    });

  // Dark mode toggle functionality
  const darkModeToggle = addMenuItem('🌓');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Check for saved user preference, if any, on load of the website
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    darkModeToggle.textContent = '🌞';
  } else if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    darkModeToggle.textContent = '🌑';
  }
  
  // Add toggle switch event listener
  darkModeToggle.addEventListener('click', () => {
    let theme;
    if (prefersDarkScheme.matches) {
      document.body.classList.toggle('light-theme');
      theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    } else {
      document.body.classList.toggle('dark-theme');
      theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    }
    localStorage.setItem('theme', theme);
    darkModeToggle.textContent = theme === 'dark' ? '🌞' : '🌑';
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

  const parseFrontmatter = md => {
    const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: md };
    const meta = Object.fromEntries(
      match[1].split('\n')
        .map(line => line.match(/^(\w+):\s*(.+)$/))
        .filter(Boolean)
        .map(([, k, v]) => [k, v.trim()])
    );
    return { meta, body: match[2] };
  };

  const MAX_INCLUDE_DEPTH = 5;
  const INCLUDE_PATTERN = /\[\]\(include:([^)]+)\)/g;

  const resolveIncludes = async (md, visited = new Set(), depth = 0) => {
    if (depth >= MAX_INCLUDE_DEPTH) return md;
    const matches = [...md.matchAll(INCLUDE_PATTERN)];
    for (const match of matches) {
      const path = match[1].trim();
      if (visited.has(path)) {
        md = md.replace(match[0], `> ⚠️ *Include cycle detected: \`${path}\`*`);
        continue;
      }
      const res = await fetch(path);
      if (!res.ok) {
        md = md.replace(match[0], `> ⚠️ *Could not include \`${path}\` (${res.status})*`);
        continue;
      }
      const included = await res.text();
      const childVisited = new Set(visited);
      childVisited.add(path);
      const resolved = await resolveIncludes(included, childVisited, depth + 1);
      md = md.replace(match[0], resolved);
    }
    return md;
  };

  let renderPage = async page => {
    main.classList.add('hidden');
    fetch(page)
      .then(res => res.text())
      .then(async md => {
        md = await resolveIncludes(md, new Set([page]));
        const { meta, body } = parseFrontmatter(md);
        let html = converter.makeHtml(body);
        article.innerHTML = html;

        // Render mermaid fenced blocks as diagrams before highlight.js runs
        article.querySelectorAll('pre code.language-mermaid').forEach(block => {
          const container = document.createElement('div');
          container.className = 'mermaid';
          container.textContent = block.innerText;
          block.closest('pre').replaceWith(container);
        });
        const darkMode = document.body.classList.contains('dark-theme') ||
          (!document.body.classList.contains('light-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        mermaid.initialize({ startOnLoad: false, theme: darkMode ? 'dark' : 'default' });
        mermaid.run({ querySelector: '.mermaid' });

        document.querySelectorAll('pre code').forEach(block => {
          hljs.highlightBlock(block);
          const btn = document.createElement('button');
          btn.className = 'copy-btn';
          btn.textContent = 'Copy';
          btn.addEventListener('click', () => {
            navigator.clipboard.writeText(block.innerText).then(() => {
              btn.textContent = 'Copied!';
              setTimeout(() => btn.textContent = 'Copy', 2000);
            });
          });
          block.parentElement.appendChild(btn);
        });

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
        Promise.all(promises).then(() => {
          scripts.forEach(eval);
          main.classList.remove('hidden');
        });

        // Add slug IDs and anchor links to all headings
        const slugCounts = {};
        article.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
          let slug = h.textContent.trim().toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          slugCounts[slug] = (slugCounts[slug] || 0) + 1;
          if (slugCounts[slug] > 1) slug += '-' + slugCounts[slug];
          h.id = slug;
          const link = document.createElement('a');
          link.href = '#' + slug;
          link.className = 'anchor-link';
          link.setAttribute('aria-hidden', 'true');
          link.textContent = '#';
          h.appendChild(link);
        });

        // Update page title: frontmatter > first H1 > config title
        const h1 = article.querySelector('h1');
        const pageTitle = meta.title || (h1 && h1.textContent.trim()) || '';
        const siteTitle = (self.config && self.config.title) || '';
        document.title = pageTitle ? `${pageTitle} — ${siteTitle}` : siteTitle;

        // Set meta description from frontmatter if provided
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = meta.description || '';

        // Intercept internal ?q= link clicks for SPA-style navigation
        article.querySelectorAll('a[href^="?q="]').forEach(a => {
          a.addEventListener('click', e => {
            e.preventDefault();
            let nextPage = new URLSearchParams(a.getAttribute('href').substring(1)).get('q');
            history.pushState({ page: nextPage }, '', a.getAttribute('href'));
            renderPage(nextPage);
          });
        });
      });
  }

  // Handle browser back/forward navigation
  window.addEventListener('popstate', e => {
    let page = (e.state && e.state.page) || 'README.md';
    renderPage(page);
  });

  let params = new URLSearchParams(document.location.search.substring(1));
  let initialPage = params.get('q') || 'README.md';
  history.replaceState({ page: initialPage }, '', initialPage === 'README.md' ? document.location.href : '?q=' + initialPage);
  renderPage(initialPage);
})();
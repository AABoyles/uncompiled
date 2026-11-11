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

  const configLoaded = fetch('config.json')
    .then(res => res.json())
    .then(config => {
      window.__uncompiled = Object.freeze(config);
      document.querySelector('title').innerText = config.title;
      config.menu.forEach(addMenuItem);
      header.classList.remove('hidden');
      return config;
    })
    .catch(() => {
      header.classList.remove('hidden');
      return {};
    });

  // Dark mode toggle functionality
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');

  // Apply saved preference or system default on load
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
  }

  // Icon shows what you'll switch TO: 🌞 = currently dark (click for light), 🌑 = currently light (click for dark)
  const isDark = () =>
    document.body.classList.contains('dark-theme') ||
    (!document.body.classList.contains('light-theme') && prefersDarkScheme.matches);

  const darkModeToggle = addMenuItem(isDark() ? '🌞' : '🌑');
  darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
  darkModeToggle.setAttribute('title', 'Toggle dark mode');

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
    'strikethrough': true,
    'tasklists': true,
    'simplifiedAutoLink': true,
    'extensions': ['tufte']
  });

  let parser = new DOMParser();

  // Security note: uncompiled intentionally executes scripts embedded in
  // Markdown. The security model is that authors control all content in
  // their own repository. Only serve content you trust.
  //
  // External <script src> tags in Markdown are restricted further, since
  // they pull in code the author does not control:
  //   - same-origin scripts are always allowed;
  //   - cross-origin scripts must be HTTPS, come from a host on the
  //     allow-list (config.json "trustedScriptHosts"), and carry a
  //     Subresource Integrity hash, which the browser verifies.
  // The host must also be permitted by the CSP script-src in index.html.
  const DEFAULT_TRUSTED_SCRIPT_HOSTS = ['cdn.jsdelivr.net'];
  const SRI_PATTERN = /^(sha(256|384|512)-[A-Za-z0-9+/]+={0,2})(\s+sha(256|384|512)-[A-Za-z0-9+/]+={0,2})*$/;

  const blockScript = (src, reason) => {
    console.warn(`[uncompiled] Blocked script ${src}: ${reason}`);
  };

  const injectScript = (href, integrity) => new Promise(resolve => {
    let script = document.createElement('script');
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = 'anonymous';
    }
    script.onload = resolve;
    script.onerror = () => {
      console.error('[uncompiled] Failed to load script (network error, CSP, or integrity mismatch):', href);
      resolve();
    };
    script.src = href;
    document.body.appendChild(script);
  });

  const loadScript = async function(src, integrity){
    let url;
    try { url = new URL(src, document.baseURI); }
    catch(e) { return blockScript(src, 'invalid URL'); }

    if (url.origin !== location.origin) {
      const config = await configLoaded;
      const trusted = Array.isArray(config.trustedScriptHosts)
        ? config.trustedScriptHosts
        : DEFAULT_TRUSTED_SCRIPT_HOSTS;
      if (url.protocol !== 'https:') return blockScript(src, 'not HTTPS');
      if (!trusted.includes(url.hostname)) {
        return blockScript(src, `host "${url.hostname}" is not in trustedScriptHosts`);
      }
      integrity = (integrity || '').trim();
      if (!SRI_PATTERN.test(integrity)) {
        return blockScript(src, 'missing or malformed integrity attribute (sha256/sha384/sha512 required)');
      }
    } else {
      integrity = null;
    }
    return injectScript(url.href, integrity);
  };

  // Vega-Lite is only needed by pages that contain a chart block, so it is
  // loaded on demand rather than from index.html. These are first-party
  // choices pinned by version and SRI hash, independent of trustedScriptHosts.
  const VEGA_SCRIPTS = [
    ['https://cdn.jsdelivr.net/npm/vega@6.4.0/build/vega.min.js', 'sha384-VKdcJr3ZaBIJMbVcopTAI/JEuUkSY6qnwVu9iLuw0DnQ9gQ1JjsfZJhXFQAgNi43'],
    ['https://cdn.jsdelivr.net/npm/vega-lite@6.5.0/build/vega-lite.min.js', 'sha384-pV2l7nzmyxZh02knvUH7N8zvtyCYsYiGt+SsE/emG/dFiBI6G0YJZFZ2FzEX72P3'],
    ['https://cdn.jsdelivr.net/npm/vega-embed@7.3.0/build/vega-embed.min.js', 'sha384-Muy1QRxYFeNrA1zShc1KtN4OfipkR/61gt+HWqN57c1Zxu3Oe16TsilsruVVjfKL']
  ];
  let vegaLoading = null;
  const loadVega = () => {
    if (!vegaLoading) {
      // Sequential: vega-lite and vega-embed expect the vega global to exist.
      vegaLoading = VEGA_SCRIPTS.reduce(
        (chain, [src, integrity]) => chain.then(() => injectScript(src, integrity)),
        Promise.resolve()
      );
    }
    return vegaLoading;
  };

  const blockError = (el, title, err) => {
    const box = document.createElement('pre');
    box.className = 'render-error';
    box.textContent = `${title}: ${err && err.message ? err.message : err}`;
    el.replaceWith(box);
  };

  const renderVegaBlocks = async blocks => {
    if (!blocks.length) return;
    // Parse first so a typo is reported without downloading anything.
    const charts = [];
    blocks.forEach(block => {
      const container = document.createElement('div');
      container.className = 'vega-chart';
      const pre = block.closest('pre');
      try {
        // vega-embed restyles its target element, so give it an inner
        // element and keep the column width on the outer one.
        const target = container.appendChild(document.createElement('div'));
        charts.push([target, JSON.parse(block.textContent)]);
        pre.replaceWith(container);
      } catch (e) {
        blockError(pre, 'Invalid chart JSON', e);
      }
    });
    if (!charts.length) return;
    await loadVega();
    await Promise.all(charts.map(([target, spec]) => {
      const container = target.parentElement;
      if (typeof vegaEmbed === 'undefined') {
        return blockError(container, 'Chart error', 'could not load Vega-Lite');
      }
      return vegaEmbed(target, spec, {
        actions: false,
        renderer: 'svg',
        theme: isDark() ? 'dark' : undefined
      }).catch(e => blockError(container, 'Chart error', e));
    }));
  };

  // Minimal RFC 4180 parser: quoted fields, escaped quotes (""), and
  // newlines inside quotes.
  const parseCSV = text => {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else quoted = false;
        } else field += c;
      } else if (c === '"' && field === '') {
        quoted = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        rows.push(row); row = [];
      } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.length > 1 || r[0].trim() !== '');
  };

  const NUMERIC_CELL = /^\s*[-+]?[$€£]?\d[\d,]*(\.\d+)?%?\s*$/;

  const renderCSVBlocks = blocks => {
    blocks.forEach(block => {
      const rows = parseCSV(block.textContent);
      if (!rows.length) return;
      const [head, ...body] = rows;
      const width = Math.max(...rows.map(r => r.length));
      // Right-align columns whose non-empty cells are all numbers.
      const numeric = Array.from({ length: width }, (_, i) => {
        const cells = body.map(r => r[i] || '').filter(v => v.trim() !== '');
        return cells.length > 0 && cells.every(v => NUMERIC_CELL.test(v));
      });
      const table = document.createElement('table');
      table.className = 'csv-table';
      const addRow = (parent, cells, tag) => {
        const tr = parent.insertRow();
        for (let i = 0; i < width; i++) {
          const cell = document.createElement(tag);
          cell.textContent = (cells[i] || '').trim();
          if (numeric[i]) cell.className = 'numeric';
          tr.appendChild(cell);
        }
      };
      addRow(table.createTHead(), head, 'th');
      const tbody = table.createTBody();
      body.forEach(r => addRow(tbody, r, 'td'));
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      wrapper.appendChild(table);
      block.closest('pre').replaceWith(wrapper);
    });
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

  // Include directives shown inside fenced code blocks are documentation,
  // not directives, so they are left alone.
  const FENCE_PATTERN = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
  const outsideFences = (md, pattern) => {
    const fences = [...md.matchAll(FENCE_PATTERN)].map(m => [m.index, m.index + m[0].length]);
    return [...md.matchAll(pattern)].filter(m => !fences.some(([a, b]) => m.index >= a && m.index < b));
  };
  // Replace matches last-to-first so earlier match offsets stay valid.
  const spliceMatch = (md, match, text) =>
    md.slice(0, match.index) + text + md.slice(match.index + match[0].length);

  // [](csv:path/to/file.csv) pulls a CSV file in as a csv code block, which
  // renderCSVBlocks then turns into a table.
  const CSV_PATTERN = /\[\]\(csv:([^)]+)\)/g;

  const resolveCSVIncludes = async md => {
    for (const match of outsideFences(md, CSV_PATTERN).reverse()) {
      const path = match[1].trim();
      const res = await fetch(path).catch(() => null);
      const replacement = res && res.ok
        ? '\n\n~~~~csv\n' + (await res.text()).trim() + '\n~~~~\n\n'
        : `> ⚠️ *Could not load CSV \`${path}\`${res ? ` (${res.status})` : ''}*`;
      md = spliceMatch(md, match, replacement);
    }
    return md;
  };

  const resolveIncludes = async (md, visited = new Set(), depth = 0) => {
    if (depth >= MAX_INCLUDE_DEPTH) return md;
    for (const match of outsideFences(md, INCLUDE_PATTERN).reverse()) {
      const path = match[1].trim();
      if (visited.has(path)) {
        md = spliceMatch(md, match, `> ⚠️ *Include cycle detected: \`${path}\`*`);
        continue;
      }
      const res = await fetch(path);
      if (!res.ok) {
        md = spliceMatch(md, match, `> ⚠️ *Could not include \`${path}\` (${res.status})*`);
        continue;
      }
      const included = await res.text();
      const childVisited = new Set(visited);
      childVisited.add(path);
      const resolved = await resolveIncludes(included, childVisited, depth + 1);
      md = spliceMatch(md, match, resolved);
    }
    return md;
  };

  let renderPage = async page => {
    main.classList.add('hidden');
    article.innerHTML = '<p class="loading">Loading…</p>';
    main.classList.remove('hidden');
    fetch(page)
      .then(res => {
        if (!res.ok) {
          article.innerHTML = `<h1>Page not found</h1><p>Could not load <code>${page}</code> (HTTP ${res.status}).</p>`;
          return null;
        }
        return res.text();
      })
      .then(async md => {
        if (md === null) return;
        md = await resolveIncludes(md, new Set([page]));
        md = await resolveCSVIncludes(md);
        const { meta, body } = parseFrontmatter(md);
        let html = converter.makeHtml(body);
        // Sanitize converted HTML before DOM injection to prevent XSS via
        // inline event handlers (e.g. <img onerror="...">). Scripts are
        // extracted from the raw html string below, so this does not affect
        // intentional embedded page scripts.
        article.innerHTML = DOMPurify.sanitize(html, { FORCE_BODY: true });

        // Turn csv and vega-lite fenced blocks into tables and charts
        // before highlight.js runs. Charts load their library on demand and
        // fill in asynchronously.
        renderCSVBlocks(article.querySelectorAll('pre code.language-csv'));
        renderVegaBlocks(article.querySelectorAll('pre code.language-vega-lite'));

        // Render mermaid fenced blocks as diagrams before highlight.js runs
        article.querySelectorAll('pre code.language-mermaid').forEach(block => {
          const container = document.createElement('div');
          container.className = 'mermaid';
          container.textContent = block.innerText;
          block.closest('pre').replaceWith(container);
        });
        mermaid.initialize({ startOnLoad: false, theme: isDark() ? 'dark' : 'default' });
        mermaid.run({ querySelector: '.mermaid' });

        document.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block);
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
          if(script.hasAttribute('src')) promises.push(loadScript(script.getAttribute('src'), script.getAttribute('integrity')));
          else scripts.push(script.innerText);
        });
        Promise.all(promises).then(() => {
          scripts.forEach(script => {
            try { eval(script); }
            catch(e) { console.error('[uncompiled] Script error:', e); }
          });
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
        const siteTitle = (window.__uncompiled && window.__uncompiled.title) || '';
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
      })
      .catch(err => {
        article.innerHTML = `<h1>Failed to load page</h1><p>An error occurred while loading <code>${page}</code>.</p><pre>${err}</pre>`;
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
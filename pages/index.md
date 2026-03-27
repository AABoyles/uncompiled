# Page Index

<input id="search-input" type="text" placeholder="Filter pages…" style="width:55%;padding:0.4em 0.6em;font-size:1em;border:1px solid #ccc;border-radius:3px;margin-bottom:1em;">

<div id="page-list"></div>

<script>
(function() {
  var input = document.getElementById('search-input');
  var list  = document.getElementById('page-list');
  var pages = [];

  function render(items) {
    if (!items.length) {
      list.innerHTML = '<p><em>No pages match your search.</em></p>';
      return;
    }
    list.innerHTML = items.map(function(p) {
      var tags = (p.tags || []).map(function(t) {
        return '<span style="font-size:0.75em;background:#eee;border-radius:3px;padding:0.1em 0.4em;margin-right:0.3em;">' + t + '</span>';
      }).join('');
      return '<p><strong><a href="?' + 'q=' + p.path + '">' + p.title + '</a></strong>' +
        (p.date ? ' <span style="color:#888;font-size:0.85em;">— ' + p.date + '</span>' : '') +
        '<br>' + (p.description || '') +
        (tags ? '<br>' + tags : '') + '</p>';
    }).join('');
  }

  fetch('pages.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      pages = data.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
      render(pages);
    });

  input.addEventListener('input', function() {
    var q = input.value.toLowerCase();
    render(q ? pages.filter(function(p) {
      return (p.title + ' ' + (p.description || '') + ' ' + (p.tags || []).join(' ')).toLowerCase().includes(q);
    }) : pages);
  });
})();
</script>

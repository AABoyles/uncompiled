# All Pages

<section id="pages">
  <table class="table">
    <thead><tr>
      <th>Name</th>
      <th class="text-end">Length (bytes)</th>
      <th>History</th>
    </tr></thead>
    <tbody></tbody>
  </table>
</section>
<script>
  const titleize = str => {
    return str
      .substring(0, str.length - 3)
      .split('-')
      .map(word => word[0].toUpperCase() + word.substring(1))
      .join(' ');
  }

  fetch(`${config.apiURL}/contents/pages`).then(r => r.json()).then(d => {
    let files = d.filter(file => file.name.substring(file.name.length - 3) == '.md');
    let tbody = document.querySelector('tbody');
    files.forEach(file => {
      let tr = document.createElement('tr');
      tr.innerHTML = `
        <td><a href="?q=${file.path}">${titleize(file.name)}</a></td>
        <td class="text-end">${file.size.toLocaleString()}</td>
        <td><a href="${file.html_url.replace('blob', 'commits')}">History</a>
      `;
      tbody.append(tr);
    });
  });
</script>

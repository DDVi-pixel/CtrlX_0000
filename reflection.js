(function () {
  const article = document.querySelector('[data-markdown-target]');
  const source = document.body.dataset.source;
  if (!article || !source) return;

  const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  const inline = (value) => escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const render = (markdown) => {
    const lines = markdown.replace(/\r/g, '').split('\n');
    const output = [];
    let paragraph = [];
    let listOpen = false;

    const flushParagraph = () => {
      if (paragraph.length) output.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    };
    const closeList = () => {
      if (listOpen) output.push('</ul>');
      listOpen = false;
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushParagraph(); closeList(); continue; }
      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        flushParagraph(); closeList();
        const level = Math.min(4, heading[1].length + 1);
        output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        continue;
      }
      const item = line.match(/^-\s+(.+)$/);
      if (item) {
        flushParagraph();
        if (!listOpen) { output.push('<ul>'); listOpen = true; }
        output.push(`<li>${inline(item[1])}</li>`);
        continue;
      }
      closeList();
      paragraph.push(line);
    }
    flushParagraph(); closeList();
    return output.join('');
  };

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error('Không thể đọc tệp nguồn.');
      return response.text();
    })
    .then((markdown) => { article.innerHTML = render(markdown); })
    .catch(() => {
      article.innerHTML = `<div class="callout warning"><p>Không thể tải nội dung trong chế độ xem hiện tại. <a href="${source}">Mở tệp Markdown nguồn</a>.</p></div>`;
    });
}());

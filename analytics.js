// Daily seven-day accuracy chart and kid-readable progress labels.
(() => {
  const originalStats = stats;
  const dateKey = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

  function dailyChartMarkup() {
    const days = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      days.push({ date, key: dateKey(date), correct: 0, total: 0 });
    }
    const byKey = new Map(days.map(day => [day.key, day]));
    (state.history || []).forEach(entry => {
      if (!entry || !entry.date || !(entry.total > 0)) return;
      const date = new Date(entry.date);
      if (Number.isNaN(date.getTime())) return;
      const day = byKey.get(dateKey(date));
      if (day) { day.correct += Number(entry.correct) || 0; day.total += Number(entry.total) || 0; }
    });

    const left = 40, right = 354, top = 24, bottom = 174;
    const x = i => left + (right - left) * i / 6;
    const y = percent => bottom - (bottom - top) * percent / 100;
    const grid = [0, 50, 100].map(percent => `<line class="daily-grid" x1="${left}" y1="${y(percent)}" x2="${right}" y2="${y(percent)}"/><text class="daily-y-label" x="2" y="${y(percent) + 4}">${percent}%</text>`).join('');
    let path = '', started = false;
    days.forEach((day, i) => {
      if (!day.total) { started = false; return; }
      const px = x(i), py = y(day.correct / day.total * 100);
      path += `${started ? ' L' : ' M'} ${px} ${py}`;
      started = true;
    });
    const points = days.map((day, i) => {
      const label = day.date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short' });
      const dateLabel = day.date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'numeric' });
      const labelText = `${label} ${dateLabel}`;
      if (!day.total) return `<text class="daily-day-label" x="${x(i)}" y="204">${labelText}</text>`;
      const percent = Math.round(day.correct / day.total * 100);
      return `<circle class="daily-point" cx="${x(i)}" cy="${y(percent)}" r="5"><title>${labelText}: ${percent}% (${day.correct}/${day.total})</title></circle><text class="daily-day-label" x="${x(i)}" y="204">${labelText}</text>`;
    }).join('');
    const any = days.some(day => day.total);
    return `<div class="daily-chart-wrap"><svg class="daily-line-chart" viewBox="0 0 360 220" role="img" aria-label="${t('Tỷ lệ trả lời đúng trong 7 ngày gần nhất','Answer accuracy over the last 7 days')}">${grid}${path ? `<path class="daily-line" d="${path}"/>` : ''}${points}</svg>${any ? '' : `<p class="daily-chart-empty">${t('Chưa có lượt luyện trong 7 ngày qua.','No practice sessions in the last 7 days yet.')}</p>`}</div>`;
  }

  stats = function () {
    originalStats();
    const chart = $('#app .chart');
    if (chart) {
      chart.classList.add('daily-chart');
      chart.outerHTML = dailyChartMarkup();
      const card = $('#app .daily-chart-wrap')?.closest('.card');
      if (card) {
        card.classList.add('daily-chart-card');
        const title = card.querySelector('h3');
        if (title) title.textContent = t('7 ngày gần nhất','Last 7 days');
        const caption = card.querySelector('p');
        if (caption) caption.textContent = t('Tỷ lệ đúng mỗi ngày. Ngày không luyện sẽ không có điểm.','Daily accuracy. Days without practice have no data point.');
      }
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .daily-chart-card h3{font-size:21px}
    .daily-chart-card>p{font-size:15px;line-height:1.55;color:#405846}
    .daily-chart-wrap{position:relative;width:100%;min-width:0}
    .chart.daily-chart{display:block;height:auto;min-height:0;background:transparent;overflow:visible}
    .daily-line-chart{display:block;width:100%;height:auto;overflow:visible}
    .daily-grid{stroke:#d9e2d2;stroke-width:1;stroke-dasharray:3 4}
    .daily-y-label{fill:#536c55;font:700 11px NumiNunito,Arial,sans-serif}
    .daily-day-label{fill:#344e3c;font:700 10px NumiNunito,Arial,sans-serif;text-anchor:middle}
    .daily-line{fill:none;stroke:var(--green);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
    .daily-point{fill:var(--green);stroke:#fff;stroke-width:2.5}
    .daily-chart-empty{margin:0;padding:10px 8px 16px;color:var(--muted);font-size:15px;line-height:1.5;text-align:center}
    #app .metrics small{font-size:13px;line-height:1.45;color:#405846}
    #app .garden-column-label{font-size:15px}
    #app .garden-count,#app .garden-instruction,#app .garden-footer{font-size:15px;line-height:1.55}
    #app .flower-answer{font-size:clamp(24px,3vw,30px)}
    #app .pot-equation{font-size:clamp(20px,2.8vw,26px)}
    @media(max-width:700px){
      .daily-chart-card h3{font-size:19px}
      .daily-chart-card>p{font-size:14px}
      .daily-day-label{font-size:9px}
      .daily-y-label{font-size:10px}
      .daily-chart-empty{font-size:14px}
      #app .metrics small{font-size:12px}
      #app .garden-column-label{font-size:13px}
      #app .garden-count,#app .garden-instruction,#app .garden-footer{font-size:14px}
      #app .flower-answer{font-size:24px}
      #app .pot-equation{font-size:20px}
    }
  `;
  document.head.append(style);
})();

const winForm = document.getElementById('winForm');
const winInput = document.getElementById('winInput');
const category = document.getElementById('category');
const impact = document.getElementById('impact');
const winsList = document.getElementById('winsList');
const exportBtn = document.getElementById('exportBtn');

let wins = JSON.parse(localStorage.getItem('wins')) || [];

function renderWins() {
  winsList.innerHTML = '';
  wins.forEach((win, index) => {
    const div = document.createElement('div');
    div.classList.add('win');
    div.innerHTML = `
      <strong>${win.text}</strong>
      <button class="deleteBtn" data-index="${index}">✕</button><br/>
      <small>${win.category} • ${'⭐'.repeat(win.impact)} • ${win.date}</small>
    `;
    winsList.appendChild(div);
  });
}

winForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newWin = {
    text: winInput.value.trim(),
    category: category.value,
    impact: parseInt(impact.value),
    date: new Date().toLocaleString(),
  };

  if (!newWin.text) return;
  wins.push(newWin);
  localStorage.setItem('wins', JSON.stringify(wins));
  renderWins();

  amplitude.getInstance().logEvent('win_logged', {
    category: newWin.category,
    impact_level: newWin.impact,
    word_count: newWin.text.split(' ').length,
  });

  winInput.value = '';
});

winsList.addEventListener('click', (e) => {
  if (e.target.classList.contains('deleteBtn')) {
    const index = e.target.getAttribute('data-index');
    const deleted = wins.splice(index, 1)[0];
    localStorage.setItem('wins', JSON.stringify(wins));
    renderWins();

    amplitude.getInstance().logEvent('win_deleted', {
      category: deleted.category,
      impact_level: deleted.impact,
    });
  }
});

exportBtn.addEventListener('click', () => {
  if (wins.length === 0) {
    alert("No wins to export!");
    return;
  }

  const csvHeader = "Text,Category,Impact,Date\n";
  const csvRows = wins.map(win => {
    const text = `"${win.text.replace(/"/g, '""')}"`;
    return `${text},${win.category},${win.impact},${win.date}`;
  });
  const csvContent = csvHeader + csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `small_wins_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();

  amplitude.getInstance().logEvent('wins_exported', { total_wins: wins.length });
});

// initial render
renderWins();
amplitude.getInstance().logEvent('session_started', { time: new Date().toISOString() });

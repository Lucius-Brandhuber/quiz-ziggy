const answers = {};

function goTo(screenId) {
  document.querySelector('.screen.active').classList.remove('active');
  const target = document.getElementById(screenId);
  target.classList.add('active');
  target.style.animation = 'none';
  target.offsetHeight;
  target.style.animation = '';
  window.scrollTo(0, 0);

  if (screenId === 'screen-loading') runLoading();
}

// Option selection
document.querySelectorAll('.options').forEach(group => {
  const isMulti = group.classList.contains('multi');
  const question = group.dataset.question;
  const nextBtn = group.parentElement.querySelector('.btn-next');

  group.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      if (isMulti) {
        card.classList.toggle('selected');
        const selected = group.querySelectorAll('.selected');
        answers[question] = Array.from(selected).map(c => c.dataset.value);
        if (nextBtn) nextBtn.disabled = selected.length === 0;
      } else {
        group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        answers[question] = card.dataset.value;
        if (nextBtn) nextBtn.disabled = false;
      }
    });
  });
});

// Loading animation
function runLoading() {
  const fill = document.getElementById('loading-fill');
  const text = document.getElementById('loading-text');
  const steps = [
    { pct: 30, msg: 'Identificando padrões...' },
    { pct: 58, msg: 'Calculando potencial de economia...' },
    { pct: 87, msg: 'Preparando recomendações...' },
    { pct: 100, msg: 'Pronto!' }
  ];

  let i = 0;
  fill.style.width = '0%';

  function next() {
    if (i >= steps.length) {
      setTimeout(() => showResult(), 400);
      return;
    }
    fill.style.width = steps[i].pct + '%';
    text.textContent = steps[i].msg;
    i++;
    setTimeout(next, 900);
  }
  setTimeout(next, 400);
}

// Result logic
function showResult() {
  const profiles = {
    explorer: {
      title: 'Explorador Financeiro',
      desc: 'Você quer organizar sua vida financeira, mas ainda não possui um sistema consistente.'
    },
    impulsive: {
      title: 'Gastador Impulsivo',
      desc: 'Pequenos gastos recorrentes provavelmente estão consumindo uma parte importante da sua renda.'
    },
    evolving: {
      title: 'Organizador em Evolução',
      desc: 'Você já controla parte das finanças, mas ainda pode economizar mais automatizando esse processo.'
    }
  };

  let profile;
  const q2 = answers.q2;
  const q6 = answers.q6;

  if (q2 === 'organizada' || q2 === 'melhorar') {
    if (q6 === 'sobra' || q6 === 'zero') {
      profile = profiles.evolving;
    } else {
      profile = profiles.explorer;
    }
  } else if (q2 === 'incendios' || q2 === 'sem-nocao') {
    if (q6 === 'limite' || q6 === 'emprestado') {
      profile = profiles.impulsive;
    } else {
      profile = profiles.explorer;
    }
  } else {
    profile = profiles.explorer;
  }

  document.getElementById('result-title').textContent = profile.title;
  document.getElementById('result-desc').textContent = profile.desc;
  goTo('screen-result');
}

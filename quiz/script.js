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

// Result logic — scoring system
function showResult() {
  const profiles = {
    impulsive: {
      title: 'Gastador Impulsivo',
      desc: 'Pequenos gastos recorrentes provavelmente estão consumindo uma parte importante da sua renda. Você não tem um problema de ganhar pouco — tem um problema de vazamento silencioso.',
      bridge: 'O Ziggy identifica esses vazamentos assim que eles acontecem, antes que virem um buraco no fim do mês.'
    },
    explorer: {
      title: 'Explorador Financeiro',
      desc: 'Você quer organizar sua vida financeira, mas ainda não possui um sistema consistente. Isso não é falta de disciplina — é falta de visibilidade.',
      bridge: 'O Ziggy dá essa visibilidade automaticamente, sem você precisar criar o hábito de anotar nada.'
    },
    evolving: {
      title: 'Organizador em Evolução',
      desc: 'Você já controla parte das finanças, mas ainda pode economizar mais automatizando esse processo. O esforço manual tem um teto — e você já está perto dele.',
      bridge: 'O Ziggy pega o controle que você já tem hoje e automatiza, liberando o tempo que você gasta em planilha.'
    },
    suffocating: {
      title: 'Sufoco Financeiro',
      desc: 'Sua rotina financeira está no modo sobrevivência. Isso não se resolve com força de vontade — se resolve com um sistema que assume o controle por você.',
      bridge: 'O Ziggy organiza automaticamente o que hoje parece impossível de organizar sozinho, mostrando o caminho de saída passo a passo.'
    }
  };

  const scores = { impulsive: 0, explorer: 0, evolving: 0, suffocating: 0 };
  const q3 = answers.q3 || [];

  // Q2
  if (answers.q2 === 'organizada') scores.evolving += 2;
  if (answers.q2 === 'melhorar') { scores.impulsive += 1; scores.explorer += 1; }
  if (answers.q2 === 'incendios') { scores.explorer += 1; scores.suffocating += 2; }
  if (answers.q2 === 'sem-nocao') { scores.explorer += 2; scores.suffocating += 1; }

  // Q3 (multi)
  if (q3.includes('impulso') || q3.includes('delivery')) scores.impulsive += 2;
  if (q3.includes('assinaturas')) scores.explorer += 1;
  if (q3.includes('cartao') || q3.includes('parcelamentos')) { scores.impulsive += 1; scores.suffocating += 1; }
  if (q3.includes('sem-ideia')) scores.explorer += 2;

  // Q4
  if (answers.q4 === 'sim') scores.evolving += 2;
  if (answers.q4 === 'ideia') { scores.explorer += 1; scores.evolving += 1; }
  if (answers.q4 === 'nao') scores.explorer += 2;

  // Q5
  if (answers.q5 === 'mes') scores.explorer += 1;
  if (answers.q5 === 'meses') { scores.impulsive += 1; scores.explorer += 1; }
  if (answers.q5 === 'ano' || answers.q5 === 'nunca') scores.suffocating += 2;

  // Q6
  if (answers.q6 === 'sobra') scores.evolving += 2;
  if (answers.q6 === 'zero') { scores.explorer += 1; scores.evolving += 1; }
  if (answers.q6 === 'limite') { scores.impulsive += 1; scores.suffocating += 1; }
  if (answers.q6 === 'emprestado') scores.suffocating += 2;

  // Q9
  if (answers.q9 === 'planilha' || answers.q9 === 'app') scores.evolving += 2;
  if (answers.q9 === 'papel' || answers.q9 === 'banco') { scores.explorer += 1; scores.evolving += 1; }
  if (answers.q9 === 'nada') scores.explorer += 2;

  // Tie-break: explorer wins ties (most broadly applicable)
  const sorted = Object.entries(scores).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const priority = ['explorer', 'impulsive', 'evolving', 'suffocating'];
    return priority.indexOf(a[0]) - priority.indexOf(b[0]);
  });

  const winner = profiles[sorted[0][0]];
  document.getElementById('result-title').textContent = winner.title;
  document.getElementById('result-desc').textContent = winner.desc;
  document.getElementById('result-bridge').textContent = winner.bridge;
  goTo('screen-result');
}

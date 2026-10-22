(() => {
  const screens = [...document.querySelectorAll('.screen')];
  const order = ['welcome','identity','quiz','letterAsk','letter','memories','video','decision','outcomeYes','outcomeNo','final'];
  const progressFill = document.getElementById('progressFill');
  const toast = document.getElementById('toastNote');
  let quizIndex = 0;
  let selectedReason = '';
  let finalChoice = '';
  const answers = ['11/03/02','06/05/26'];
  function show(id) {
    screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
    const index = Math.max(0, order.indexOf(id));
    progressFill.style.width = `${Math.max(8, Math.round((index + 1) / order.length * 100))}%`;
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function say(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2400);
  }
  document.getElementById('openGate').addEventListener('click', () => show('identity'));
  document.getElementById('yesChicklet').addEventListener('click', () => { quizIndex = 0; show('quiz'); });
  document.getElementById('noChicklet').addEventListener('click', () => {
    document.getElementById('identityFeedback').textContent = 'This page is just for Chicklet. You can close it here.';
    say('Thanks for stopping by.');
  });
  const quizQuestion = document.getElementById('quizQuestion');
  const quizAnswer = document.getElementById('quizAnswer');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizStep = document.getElementById('quizStep');
  // Keep the mobile numeric keypad, while inserting slashes as digits are typed.
  quizAnswer.addEventListener('input', () => {
    const digits = quizAnswer.value.replace(/\D/g, '').slice(0, 6);
    let formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += `/${digits.slice(2, 4)}`;
    if (digits.length > 4) formatted += `/${digits.slice(4, 6)}`;
    quizAnswer.value = formatted;
  });
  document.getElementById('quizForm').addEventListener('submit', event => {
    event.preventDefault();
    const normalized = quizAnswer.value.trim().replace(/\s/g,'').replace(/-/g,'/');
    if (normalized !== answers[quizIndex]) {
      quizFeedback.textContent = quizIndex === 0 ? 'That doesn’t match. Try MM/DD/YY.' : 'Not quite. Try that date once more.';
      quizAnswer.select(); return;
    }
    quizFeedback.textContent = '';
    if (quizIndex === 0) {
      quizIndex = 1; quizQuestion.textContent = 'When is our monthsary?'; quizStep.innerHTML = '02 <span>·</span> Just between us'; quizAnswer.value = ''; quizAnswer.focus();
    } else show('letterAsk');
  });
  document.getElementById('openLetter').addEventListener('click', () => show('letter'));
  document.getElementById('declineLetter').addEventListener('click', () => show('declined'));
  document.querySelectorAll('.reason').forEach(button => button.addEventListener('click', () => {
    selectedReason = button.dataset.reason;
    document.querySelectorAll('.reason').forEach(item => item.classList.toggle('selected', item === button));
    document.getElementById('reasonFeedback').textContent = 'Thank you for telling me. You can continue whenever you’re ready.';
    window.setTimeout(() => show('memories'), 900);
  }));
  document.getElementById('skipReason').addEventListener('click', () => show('memories'));
  document.getElementById('toMemories').addEventListener('click', () => show('memories'));
  document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', () => {
    const expanded = card.classList.toggle('revealed');
    card.setAttribute('aria-expanded', String(expanded));
    card.querySelector('.memory-hint b').textContent = expanded ? '−' : '＋';
  }));
  document.getElementById('toVideo').addEventListener('click', () => show('video'));
  const video = document.getElementById('ourVideo');
  video.addEventListener('loadedmetadata', () => document.getElementById('videoFrame').classList.add('has-video'));
  video.addEventListener('error', () => document.getElementById('videoFrame').classList.remove('has-video'));
  document.getElementById('toDecision').addEventListener('click', () => show('decision'));
  document.getElementById('yesBreakup').addEventListener('click', () => { finalChoice = 'Yes, I’m sure — I want to end the relationship.'; show('outcomeYes'); });
  document.getElementById('noBreakup').addEventListener('click', () => { finalChoice = 'No — I’d like to talk.'; show('outcomeNo'); });
  function finish() {
    const response = { answer: finalChoice, reason: selectedReason || null, time: new Date().toISOString() };
    try { localStorage.setItem('chickletPageResponse', JSON.stringify(response)); } catch (_) {}
    document.getElementById('finalAnswer').textContent = finalChoice;
    document.getElementById('answerTime').textContent = `Saved ${new Date(response.time).toLocaleString()}`;
    const message = `My answer: ${finalChoice}${selectedReason ? `\nWhy I declined the letter: ${selectedReason}` : ''}`;
    const mailSubject = encodeURIComponent('My answer to your letter');
    const mailBody = encodeURIComponent(message);
    const emailAnswer = document.getElementById('emailAnswer');
    if (emailAnswer) emailAnswer.href = `mailto:cruseskenji1@gmail.com?subject=${mailSubject}&body=${mailBody}`;
    show('final');
  }
  document.getElementById('finishYes').addEventListener('click', finish);
  document.getElementById('finishNo').addEventListener('click', finish);
  async function shareAnswer() {
    const text = `My answer: ${finalChoice}${selectedReason ? `\nWhy I declined the letter: ${selectedReason}` : ''}`;
    try {
      if (navigator.share) await navigator.share({title:'My answer',text});
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); document.getElementById('shareFeedback').textContent = 'Answer copied. Open Messenger and paste it into your chat with Kenji.'; }
      else document.getElementById('shareFeedback').textContent = 'Open Messenger and send this answer: ' + text;
    } catch (error) { if (error.name !== 'AbortError') document.getElementById('shareFeedback').textContent = 'Sharing wasn’t available here. Try the email option instead.'; }
  }
  const messengerButton = document.getElementById('shareMessenger');
  if (messengerButton) messengerButton.addEventListener('click', shareAnswer);
  // Support older copies of the page that still use the original share button.
  const legacyShareButton = document.getElementById('shareAnswer');
  if (legacyShareButton) legacyShareButton.addEventListener('click', shareAnswer);
})();

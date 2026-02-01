// Simple interactive valentine page
(function(){
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const overlay = document.getElementById('overlay');
  const dialogContent = document.getElementById('dialogContent');
  const closeDialog = document.getElementById('closeDialog');
  const buttonArea = document.getElementById('buttonArea');

  // Utility: show overlay with content (html string)
  function showDialog(html){
    dialogContent.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    // delay to ensure element exists then focus first id'd element inside
    setTimeout(() => {
      const focusable = overlay.querySelector('[id]');
      if (focusable) focusable.focus();
    }, 40);
  }
  function hideDialog(){
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    // return focus to yes button
    yesBtn.focus();
    // reset NO button positioning so layout returns to normal
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.transform = '';
  }

  // YES behavior: show heart + confetti
  yesBtn.addEventListener('click', () => {
    const html = `
      <div class="heart" id="heartSVG">
        <svg viewBox="0 0 32 29.6" width="100%" height="100%" aria-hidden="true">
          <path fill="#ff5b86" d="M23.6 0c-2.9 0-5.4 1.6-6.8 4C15.8 1.6 13.3 0 10.4 0 4.7 0 0 4.7 0 10.4c0 7.5 9.6 13.6 15.6 18.4 1.7 1.2 4.2 1.2 5.9 0C22.4 24 32 17.9 32 10.4 32 4.7 27.3 0 23.6 0z"/>
        </svg>
      </div>
      <div class="msg"><strong>YAY... I LOVE YOU KB. YOU'RE MY VALENTINE FOREVER</strong></div>
      <div style="margin-top:.8rem;">
        <button id="yayClose" class="btn yes" style="padding:.6rem 1rem; font-size:1rem">Aww ❤️</button>
      </div>
    `;
    showDialog(html);
    createConfetti(28);

    // attach close handler to new button
    setTimeout(()=>{
      const yayClose = document.getElementById('yayClose');
      if(yayClose) yayClose.addEventListener('click', hideDialog);
    },50);
  });

  // NO behavior: pointer-aware dodge
  // Move button to random position inside buttonArea on pointerenter.
  noBtn.addEventListener('pointerenter', (ev) => {
    // only dodge for actual pointer (mouse/touch), not keyboard focus
    if(ev.pointerType === 'mouse' || ev.pointerType === 'touch'){
      dodgeButton();
    }
  });

  // Keep keyboard accessible: allow Enter/Space to "choose" NO
  noBtn.addEventListener('click', () => {
    const html = `
      <div class="msg"><strong>Oh!</strong> You clicked NO — maybe next time? 💌</div>
      <div style="margin-top:.8rem;">
        <button id="noClose" class="btn" style="background:#777;color:#fff;padding:.6rem 1rem; font-size:1rem">Close</button>
      </div>
    `;
    showDialog(html);
    setTimeout(()=>{
      const noClose = document.getElementById('noClose');
      if(noClose) noClose.addEventListener('click', hideDialog);
    },50);
  });

  // Close overlay handlers
  closeDialog.addEventListener('click', hideDialog);

  // click outside dialog to close
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) hideDialog();
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false'){
      hideDialog();
    }
  });

  // Confetti generator (simple)
  function createConfetti(count){
    const colors = ['#ffcdff','#ffd2a6','#64d68f','#ff6b6b','#ff5b86','#ffe66d'];
    const container = overlay; // position relative to overlay so confetti falls over dialog
    for(let i=0;i<count;i++){
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const w = 8 + Math.random()*10;
      const h = 12 + Math.random()*14;
      piece.style.width = `${w}px`;
      piece.style.height = `${h}px`;
      piece.style.background = colors[Math.floor(Math.random()*colors.length)];
      piece.style.left = `${20 + Math.random()*60}%`;
      piece.style.top = `${10 + Math.random()*10}%`;
      piece.style.transform = `rotate(${Math.random()*360}deg)`;
      // stagger animation durations and delays
      piece.style.animationDuration = `${900 + Math.random()*900}ms`;
      piece.style.borderRadius = `${Math.random()*50}%`;
      container.appendChild(piece);
      // remove after animation
      setTimeout(()=> {
        if(piece && piece.parentNode) piece.parentNode.removeChild(piece);
      }, 2200);
    }
  }

  // Dodge logic: move NO button to a random spot inside buttonArea without leaving bounds.
  function dodgeButton(){
    const areaRect = buttonArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // ensure buttonArea is the positioning parent (CSS has position:relative)
    noBtn.style.position = 'absolute';

    const areaWidth = areaRect.width;
    const areaHeight = areaRect.height;
    const btnW = btnRect.width;
    const btnH = btnRect.height;

    // compute a candidate position that keeps button fully inside area with a margin
    const margin = 8;
    const maxX = Math.max(0, areaWidth - btnW - margin);
    const maxY = Math.max(0, areaHeight - btnH - margin);

    // current position relative to area
    const currentLeft = btnRect.left - areaRect.left;
    const currentTop = btnRect.top - areaRect.top;

    let newX, newY, attempts = 0;
    do {
      newX = Math.round(margin + Math.random() * maxX);
      newY = Math.round(margin + Math.random() * maxY);
      attempts++;
      // try to avoid positions too close to current
    } while(distance(currentLeft, currentTop, newX, newY) < Math.max(btnW, btnH) * 0.75 && attempts < 20);

    // apply with a small transform animation
    noBtn.style.transition = 'transform 180ms ease, left 220ms ease, top 220ms ease';
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
    // small pop animation
    noBtn.style.transform = 'translateY(-6px) scale(1.02)';
    setTimeout(()=> {
      noBtn.style.transform = '';
    }, 220);
  }

  function distance(x1,y1,x2,y2){
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx*dx + dy*dy);
  }

  // On window resize, clear absolute positioning if layout compresses (so it doesn't overflow)
  window.addEventListener('resize', () => {
    // If area is too narrow for absolute positioning, reset to flow
    const areaRect = buttonArea.getBoundingClientRect();
    if(areaRect.width < 360){
      noBtn.style.position = '';
      noBtn.style.left = '';
      noBtn.style.top = '';
      noBtn.style.transform = '';
    }
  });

})();
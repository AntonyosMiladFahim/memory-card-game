function startgame(){
	const possiblecardfaces = ['\u{1F602}','\u{1F60E}','\u{1F60D}','\u{1F61C}','\u{1F643}','\u{1F913}'];
	const fliptimeout = 700;
	let clickcount = 0;
	let flipped = [];
	let matched = new Set();
	let locked = false;
	const cards = Array.from(document.querySelectorAll('.card'));
	const scoreboard = document.querySelector('#score-board');
	const clickcountels = document.querySelectorAll('.click-count');
	const lowscoreels = document.querySelectorAll('.low-score');
	const winscreen = document.querySelector('#win-screen');
	const replaybtn = document.querySelector('#replay');
	function shuffle(array){
		for (let i = array.length - 1; i > 0; --i){
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
	let timerInterval = null;
	let timeLeft = 60; 
	let timeEls = document.querySelectorAll('.time-count');

	if (!timeEls || timeEls.length === 0){
		const timeDiv = document.createElement('div');
		timeDiv.className = 'score time-count';
		timeDiv.textContent = 'Time: 01:00';
		if (scoreboard) scoreboard.appendChild(timeDiv);
		timeEls = document.querySelectorAll('.time-count');
	}
	
	let topTimerEl = document.getElementById('timer');
	if (!topTimerEl) {
		const timerDiv = document.createElement('div');
		timerDiv.id = 'timerdiv';
		timerDiv.innerHTML = 'Time left = <span id="timer">01:00</span>';
		document.body.insertBefore(timerDiv, document.body.firstChild);
		topTimerEl = document.getElementById('timer');
	}

	function formatTime(sec){
		const m = Math.floor(sec/60);
		const s = sec % 60;
		return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
	}

	function updateTimerDisplay(){
		timeEls.forEach(el => el.textContent = `Time: ${formatTime(timeLeft)}`);
		if (topTimerEl) topTimerEl.textContent = formatTime(timeLeft);
	}

	function startTimer(){
		stopTimer();
		timeLeft = 60;
		updateTimerDisplay();
		timerInterval = setInterval(()=>{
			timeLeft--;
			updateTimerDisplay();
			if (timeLeft <= 0) {
				stopTimer();
				endGameByTimer();
			}
		}, 1000);
	}

	function stopTimer(){
		if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
	}

	function endGameByTimer(){
		locked = true;
		winscreen.classList.add('visible');
		const win_clicks = winscreen.querySelectorAll('.click-count');
		win_clicks.forEach(el => el.textContent = `Total Clicks: ${clickcount}`);
		const win_low = winscreen.querySelectorAll('.low-score');
		win_low.forEach(el => el.textContent = `Low Score: ${localStorage.getItem('memory_best')}`);
		let win_time_el = winscreen.querySelector('.time-count');
		if(!win_time_el){
			win_time_el = document.createElement('div');
			win_time_el.className = 'time-count';
			winscreen.insertBefore(win_time_el, winscreen.querySelector('#replay'));
		}
		win_time_el.textContent = `Time: 00:00`;
		let starBox = winscreen.querySelector('.star-rating');
		if(!starBox){
			starBox = document.createElement('div');
			starBox.className = 'star-rating';
			winscreen.insertBefore(starBox, winscreen.querySelector('#replay'));
		}
		starBox.textContent = `Rating: ☆☆☆☆☆`;
		if (topTimerEl) topTimerEl.textContent = '00:00';
	}

	function newgame(){
		stopTimer();
		matched.clear();
		flipped = [];
		locked = false;
		clickcount = 0;
		updateclicks();
		winscreen.classList.remove('visible');
		const faces = possiblecardfaces.slice(0,6);
		const deck = faces.concat(faces);
		shuffle(deck);
		cards.forEach((card, idx) => {
			card.classList.remove('flipped');
			const front = card.querySelector('.front');
			const back = card.querySelector('.back');
			card.dataset.face = deck[idx];
			front.innerHTML = '';
			back.innerHTML = deck[idx];
			card.style.visibility = 'visible';
		});
		startTimer();
	}
	function updateclicks(){
		clickcountels.forEach(el => el.textContent = `Total Clicks: ${clickcount}`);
	}
	function updatelowscoredisplay(){
		const best = localStorage.getItem('memory_best') || 'N/A';
		lowscoreels.forEach(el => el.textContent = `Low Score: ${best}`);
	}
	function locktemporarily(ms){
		locked = true;
		setTimeout(()=> locked = false, ms);
	}
	function oncardclick(e){
		const card = e.currentTarget;
		const id = cards.indexOf(card);
		if (locked) return;
		if (matched.has(id)) return;
		if (flipped.includes(id)) return;
		card.classList.add('flipped');
		flipped.push(id);
		clickcount++;
		updateclicks();

		if (flipped.length === 2){
			const [a,b] = flipped;
			const faceA = cards[a].dataset.face;
			const faceB = cards[b].dataset.face;
			if (faceA === faceB){
				matched.add(a); matched.add(b);
				flipped = [];
				if (matched.size === cards.length){
					const prev = parseInt(localStorage.getItem('memory_best') || '0');
					if (prev === 0 || clickcount < prev) localStorage.setItem('memory_best', String(clickcount));
					updatelowscoredisplay();
					stopTimer();
					winscreen.classList.add('visible');
					const win_clicks = winscreen.querySelectorAll('.click-count');
					win_clicks.forEach(el => el.textContent = `Total Clicks: ${clickcount}`);
					const win_low = winscreen.querySelectorAll('.low-score');
					win_low.forEach(el => el.textContent = `Low Score: ${localStorage.getItem('memory_best')}`);
					let win_time_el = winscreen.querySelector('.time-count');
					if(!win_time_el){
						win_time_el = document.createElement('div');
						win_time_el.className = 'time-count';
						winscreen.insertBefore(win_time_el, winscreen.querySelector('#replay'));
					}
					win_time_el.textContent = `Time: ${formatTime(60-timeLeft)}`;
					let starBox = winscreen.querySelector('.star-rating');
					function computeStars(c){
						if (c <= 12) return 5;
						if (c <= 18) return 4;
						if (c <= 25) return 3;
						if (c <= 30) return 2;
						if (c <= 35) return 1;
						return 0;
					}
					const stars = computeStars(clickcount);
					const filled = '★'.repeat(stars);
					const empty = '☆'.repeat(5 - stars);
					if(!starBox){
						starBox = document.createElement('div');
						starBox.className = 'star-rating';
						winscreen.insertBefore(starBox, winscreen.querySelector('#replay'));
					}
					starBox.textContent = `Rating: ${filled}${empty}`;
				}
			} else {
				locktemporarily(fliptimeout+50);
				setTimeout(()=>{
					cards[a].classList.remove('flipped');
					cards[b].classList.remove('flipped');
					flipped = [];
				}, fliptimeout);
			}
		}
	}
	cards.forEach(c => c.removeEventListener('click', oncardclick));
	cards.forEach(c => c.addEventListener('click', oncardclick));
	replaybtn.removeEventListener('click', ()=> newgame());
	replaybtn.addEventListener('click', ()=> newgame());
	updatelowscoredisplay();
	newgame();
}
startgame();

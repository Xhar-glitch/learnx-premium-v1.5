(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
  const gate=$('#gate'), intro=$('#intro'), introVideo=$('#introVideo'), nextWrap=$('#nextWrap'), nextBtn=$('#nextBtn'), app=$('#app');
  const dashVideo=$('#dashboardVideo'), mute=$('#dashboardMute');
  const introSources=['assets/intro.mp4','./intro.mp4'];
  const dashSources=['assets/dashboard-base.mp4','./dashboard-base.mp4'];
  let introIndex=0,dashIndex=0,firstIntroEnd=false,dashStarted=false;
  function source(video,list,i){if(i>=list.length)return false;video.src=list[i];video.load();return true}
  function safePlay(v){const p=v.play();if(p?.catch)p.catch(()=>{});return p}
  function mount(){window.LearnXIcons?.mount(document)}

  // Fingerprint click is a real user gesture, allowing the intro to start with sound.
  $('#fingerprint').addEventListener('click',()=>{
    gate.classList.add('hidden');intro.classList.remove('hidden');firstIntroEnd=false;nextWrap.classList.add('hidden');introIndex=0;
    source(introVideo,introSources,introIndex);introVideo.muted=false;introVideo.volume=.82;safePlay(introVideo);
  });
  introVideo.addEventListener('error',()=>{introIndex++;if(source(introVideo,introSources,introIndex)){introVideo.muted=false;introVideo.volume=.82;safePlay(introVideo)}});
  introVideo.addEventListener('ended',()=>{firstIntroEnd=true;nextWrap.classList.remove('hidden');introVideo.currentTime=0;safePlay(introVideo)});
  nextBtn.addEventListener('click',()=>{
    if(!firstIntroEnd)return;introVideo.pause();intro.classList.add('hidden');app.classList.remove('hidden');window.scrollTo(0,0);startDashboard();store.set('sessions',(store.get('sessions',0)+1));renderProgress();
  });

  // Dashboard greeting: speech finishes before dashboard video audio is enabled.
  function startDashboard(){dashStarted=false;dashIndex=0;source(dashVideo,dashSources,dashIndex);dashVideo.muted=true;dashVideo.volume=.72;dashVideo.currentTime=0;updateMute();
    const start=()=>{if(dashStarted)return;dashStarted=true;dashVideo.muted=false;updateMute();safePlay(dashVideo)};
    if(!('speechSynthesis' in window)){setTimeout(start,400);return}
    try{speechSynthesis.cancel()}catch{}
    const u=new SpeechSynthesisUtterance('Hello everyone, welcome to LearnX');u.lang='en-US';u.rate=.86;u.pitch=1.08;u.volume=.72;
    const voices=speechSynthesis.getVoices();const female=voices.find(v=>/female|samantha|zira|aria|jenny|ava|google us english/i.test(v.name));if(female)u.voice=female;
    let done=false;const finish=()=>{if(done)return;done=true;start()};u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);setTimeout(finish,6500);
  }
  dashVideo.addEventListener('error',()=>{dashIndex++;if(source(dashVideo,dashSources,dashIndex)){dashVideo.muted=!dashStarted;safePlay(dashVideo)}});
  function updateMute(){mute.innerHTML=`<span data-icon="${dashVideo.muted?'volume':'volume'}"></span>`;mount();mute.setAttribute('aria-label',dashVideo.muted?'Nyalakan suara video':'Matikan suara video')}
  mute.addEventListener('click',()=>{dashVideo.muted=!dashVideo.muted;updateMute();safePlay(dashVideo)});

  // Lightweight navigation. Dashboard is the only heavy page and stays mounted.
  function showPage(id){
    if(id==='dashboard'){$$('.page').forEach(p=>p.classList.add('hidden'));$('#dashboard').classList.remove('hidden');return}
    $('#dashboard').classList.add('hidden');$$('.page').forEach(p=>p.classList.add('hidden'));const page=$('#'+id);if(page)page.classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});renderProgress();
  }
  document.addEventListener('click',e=>{const el=e.target.closest('[data-page]');if(el){e.preventDefault();showPage(el.dataset.page)}});

  // Custom touch feedback: tiny glow, never the browser blue focus box.
  document.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;const r=document.createElement('span');r.className='touch-glow';const rect=b.getBoundingClientRect();r.style.left=(e.clientX-rect.left)+'px';r.style.top=(e.clientY-rect.top)+'px';b.appendChild(r);setTimeout(()=>r.remove(),320)},{passive:true});

  // Curriculum content.
  const modules=[['Matematika','Aljabar, fungsi, geometri, statistika'],['Bahasa Indonesia','LHO, eksposisi, argumentasi, sastra'],['Bahasa Inggris','Grammar, reading, vocabulary, speaking'],['Bahasa Jepang','Hiragana, katakana, kosakata, dialog'],['IPA','Fisika, kimia, biologi, eksperimen'],['IPS','Sejarah, ekonomi, geografi, sosiologi'],['PKN','Pancasila, konstitusi, kewarganegaraan'],['Informatika','Algoritma, data, jaringan, coding'],['Seni Budaya','Seni rupa, musik, tari, teater'],['PJOK','Kebugaran, permainan, kesehatan']];
  $('#moduleGrid').innerHTML=modules.map((m,i)=>`<article><small>MODULE ${String(i+1).padStart(2,'0')}</small><h3>${m[0]}</h3><p>${m[1]}</p><button data-page="dashboard">Buka ruang</button></article>`).join('');

  // IQ pool: each session selects 10 unseen questions before recycling the full pool.
  const bank=[
    ['2, 4, 8, 16, …','24|30|32|34',2],['Semua L adalah M dan semua M adalah N. Maka…','Semua L adalah N|Semua N adalah L|Sebagian N adalah L|Tidak ada hubungan',0],['3, 6, 11, 18, 27, …','36|38|40|42',1],['Jika ▲=4 dan ■=7, maka ▲ + ■ × ▲ = …','32|28|44|35',0],['Yang berbeda adalah…','Apel|Mangga|Wortel|Jeruk',2],['A, C, F, J, O, …','T|U|V|W',0],['Jam terlambat 10 menit setiap jam. Setelah 3 jam…','10 menit|20 menit|30 menit|40 menit',2],['5, 10, 20, 40, …','60|70|80|90',2],['4 pekerja selesai 6 hari. 8 pekerja memerlukan…','2 hari|3 hari|4 hari|6 hari',1],['Semua mawar adalah bunga. Kesimpulan pasti…','Semua mawar cepat layu|Sebagian mawar cepat layu|Mawar termasuk bunga|Tidak ada mawar',2],['1, 1, 2, 3, 5, 8, …','11|12|13|14',2],['CAT→DBU. DOG→…','EPH|EOG|DPH|FPI',0],['12, 15, 21, 30, 42, …','54|55|57|60',2],['BUKU : MEMBACA = …','Pensil : Menulis|Kursi : Berlari|Sepatu : Makan|Jam : Tidur',0],['Jika Rabu, 17 hari lagi…','Jumat|Sabtu|Minggu|Senin',0],['9, 18, 36, 72, …','108|126|144|152',2],['3 bola merah + 2 biru. Peluang biru…','1/5|2/5|3/5|1/2',1],['Semua siswa A suka membaca. Rina di A. Maka…','Rina suka membaca|Rina tidak suka membaca|Rina guru|Tidak dapat disimpulkan',0],['4, 7, 13, 25, 49, …','73|85|97|101',2],['KAMUS disusun alfabetis. Huruf pertama…','A|K|M|S',0],['2, 5, 10, 17, 26, …','35|36|37|38',2],['1=3, 2=6, 3=9, maka 7=…','18|21|24|27',1],['Bukan alat tulis…','Penghapus|Penggaris|Kalkulator|Pensil',2],['Semua X adalah Y. Tidak ada Y yang Z. Maka…','Sebagian X adalah Z|Tidak ada X yang Z|Semua Z adalah X|Semua Y adalah Z',1],['10, 13, 19, 28, 40, …','52|55|56|58',1],['2 mesin membuat 2 barang dalam 2 menit. 1 mesin membuat 1 barang…','1 menit|2 menit|4 menit|8 menit',1],['Senin, Rabu, Jumat, …','Sabtu|Minggu|Senin|Selasa',1],['8, 12, 18, 26, 36, …','46|48|50|52',1],['KATA : HURUF = KALIMAT : …','Buku|Kata|Paragraf|Suara',1],['Semua A bukan B, C adalah A. Maka…','C adalah B|C bukan B|B adalah C|Tidak ada hubungan',1],['15, 14, 12, 9, 5, …','1|0|-1|-2',2],['3, 9, 27, 81, …','162|216|243|324',2],['Utara berlawanan selatan, timur berlawanan…','Barat|Atas|Bawah|Tengah',0],['Yang paling berbeda…','Segitiga|Persegi|Lingkaran|Kubus',3],['6 orang berjabat tangan sekali. Total…','12|15|18|30',1],['25% dari 80…','15|20|25|30',1],['7, 14, 28, 56, …','84|98|112|126',2],['Semua dokter terlatih. Sari dokter. Maka…','Sari terlatih|Sari bukan dokter|Semua terlatih dokter|Tidak pasti',0],['B, E, I, N, …','R|S|T|U',2],['3 buku 45 ribu, 5 buku…','60 ribu|65 ribu|70 ribu|75 ribu',3]
  ];
  let iq={set:[],pos:0,score:0,answered:false};
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  function newIq(){let used=store.get('iqUsed',[]);let pool=bank.map((_,i)=>i).filter(i=>!used.includes(i));if(pool.length<10){used=[];pool=bank.map((_,i)=>i)}iq={set:shuffle(pool).slice(0,10),pos:0,score:0,answered:false};store.set('iqUsed',[...used,...iq.set].slice(-bank.length));renderIq()}
  function renderIq(){if(!iq.set.length)return newIq();const q=bank[iq.set[iq.pos]],opts=q[1].split('|').map((t,i)=>({t,i}));shuffle(opts);$('#iqProgress').textContent=`SOAL ${iq.pos+1} / 10`;$('#iqBar').style.width=(iq.pos*10)+'%';$('#iqQuestion').textContent=q[0];const box=$('#iqAnswers');box.innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.className='answer';b.textContent=o.t;b.onclick=()=>answer(b,o.i,q[2]);box.appendChild(b)});$('#iqResult').classList.add('hidden');iq.answered=false}
  function answer(btn,choice,correct){if(iq.answered)return;iq.answered=true;$$('.answer').forEach(b=>b.disabled=true);if(choice===correct){btn.classList.add('correct');iq.score++}else btn.classList.add('wrong');setTimeout(()=>{if(iq.pos<9){iq.pos++;renderIq()}else{$('#iqBar').style.width='100%';$('#iqResult').classList.remove('hidden');const score=iq.score*10;store.set('bestIq',Math.max(score,store.get('bestIq',0)));$('#iqResult').innerHTML=`<b>Set selesai · ${score}/100</b><br><small>Skor latihan terhadap kunci soal aplikasi; bukan IQ klinis.</small>`;renderProgress()}},420)}
  $('#newIq').addEventListener('click',newIq);newIq();

  // Notes + focus.
  const notes=$('#notesArea');notes.value=store.get('notes','');notes.addEventListener('input',()=>{store.set('notes',notes.value);renderProgress()});let time=1500,timerId=null;function timerRender(){const m=String(Math.floor(time/60)).padStart(2,'0'),s=String(time%60).padStart(2,'0');$('#timer').textContent=`${m}:${s}`}timerRender();$('#timerStart').addEventListener('click',()=>{if(timerId){clearInterval(timerId);timerId=null;$('#timerStart').textContent='Mulai'}else{timerId=setInterval(()=>{time=Math.max(0,time-1);timerRender();if(time===0){clearInterval(timerId);timerId=null;$('#timerStart').textContent='Mulai'}},1000);$('#timerStart').textContent='Jeda'}});$('#timerReset').addEventListener('click',()=>{clearInterval(timerId);timerId=null;time=1500;timerRender();$('#timerStart').textContent='Mulai'});

  // Music island. Built-in tones are intentionally lightweight; users can search the local list or add a file.
  const tracks=[['Night Vector','Ambient'],['Quiet Orbit','Focus'],['Purple Room','Minimal'],['Soft Circuit','Study']];let current=null,audio=$('#audio'),ctx=null,osc=null;
  function stopTone(){try{osc?.stop()}catch{}osc=null;try{ctx?.close()}catch{}ctx=null;$('#musicPlay').textContent='Play'}
  function playTone(name){stopTone();ctx=new (window.AudioContext||window.webkitAudioContext)();const g=ctx.createGain();g.gain.value=.028;g.connect(ctx.destination);osc=ctx.createOscillator();osc.type='sine';osc.frequency.value=name==='Night Vector'?174:name==='Quiet Orbit'?196:name==='Purple Room'?220:147;osc.connect(g);osc.start();current=name;$('#trackName').textContent=name;$('#trackState').textContent='Ambient lokal';$('#musicPlay').textContent='Pause'}
  function renderMusic(q=''){const list=$('#musicList');list.innerHTML=tracks.filter(t=>t[0].toLowerCase().includes(q.toLowerCase())).map(t=>`<div class="track"><div><b>${t[0]}</b><small>${t[1]}</small></div><button data-track="${t[0]}">Pilih</button></div>`).join('')||'<small style="padding:9px;color:#716a79">Tidak ditemukan.</small>'}
  renderMusic();$('#musicToggle').addEventListener('click',()=>$('#musicPanel').classList.toggle('hidden'));$('#musicSearch').addEventListener('input',e=>renderMusic(e.target.value));$('#musicList').addEventListener('click',e=>{const b=e.target.closest('[data-track]');if(b)playTone(b.dataset.track)});$('#musicPlay').addEventListener('click',()=>{if(!current)playTone(tracks[0][0]);else if(ctx?.state==='running')stopTone();else playTone(current)});$('#musicFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;stopTone();audio.src=URL.createObjectURL(f);audio.loop=true;audio.play().then(()=>{$('#trackName').textContent=f.name;$('#trackState').textContent='File perangkat';$('#musicPlay').textContent='Pause'}).catch(()=>{})});

  function renderProgress(){$('#sessionCount').textContent=store.get('sessions',0);const b=store.get('bestIq',null);$('#bestIq').textContent=b===null?'—':b;$('#noteCount').textContent=(notes.value||'').length}
  renderProgress();mount();
})();

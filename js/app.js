/*
 * ANEX × Rixos (v2) — поведение лендинга.
 * Блоки: обратный отсчет до среды-розыгрыша · календарь июля · GSAP-анимации (hero, reveal, параллакс) · confetti.
 * Зависимости (CDN, подключены в index.html): GSAP + ScrollTrigger, canvas-confetti.
 */

(function(){
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- КАЛЕНДАРЬ: июль 2026, объявления-розыгрыши по понедельникам 13,20,27 ---------- */
  (function buildCal(){
    var grid = document.getElementById('calGrid'); if(!grid) return;
    var dows = [['ПН',0],['ВТ',0],['СР',0],['ЧТ',0],['ПТ',0],['СБ',1],['ВС',1]];
    dows.forEach(function(d){ var e=document.createElement('div'); e.className='dow'+(d[1]?' we':''); e.textContent=d[0]; grid.appendChild(e); });
    var firstCol = 2; // среда (0=ПН)
    var draws = {13:1,20:1,27:1}; // понедельники-объявления (июль)
    for(var i=0;i<firstCol;i++){ var em=document.createElement('div'); em.className='d empty'; grid.appendChild(em); }
    for(var day=1; day<=31; day++){
      var c=document.createElement('div'); c.className='d'+(draws[day]?' draw':''); c.textContent=day; grid.appendChild(c);
    }
  })();

  /* ---------- ТАЙМЕР: до старта 06.07.2026, затем до ближайшего понедельника-розыгрыша ---------- */
  (function timer(){
    var clock=document.getElementById('clock'), lbl=document.getElementById('timerLbl'), weeks=document.getElementById('weeks');
    if(!clock) return;
    var start=new Date('2026-07-06T00:00:00');
    var draws=['2026-07-13','2026-07-20','2026-07-27','2026-08-03','2026-08-10','2026-08-17','2026-08-24','2026-08-31'].map(function(d){return new Date(d+'T12:00:00');});
    function pad(n){return (n<10?'0':'')+n;}
    function target(){
      var now=new Date();
      if(now<start) return {d:start,l:'До старта конкурса'};
      for(var i=0;i<draws.length;i++) if(draws[i]>now) return {d:draws[i],l:'До ближайшего розыгрыша'};
      return {d:draws[draws.length-1],l:'Конкурс завершен'};
    }
    function tick(){
      var t=target(), diff=Math.max(0,t.d-new Date());
      var s=Math.floor(diff/1000), d=Math.floor(s/86400), h=Math.floor(s%86400/3600), m=Math.floor(s%3600/60), ss=s%60;
      clock.textContent=pad(d)+' : '+pad(h)+' : '+pad(m)+' : '+pad(ss);
      lbl.textContent=t.l;
    }
    tick(); setInterval(tick,1000);
    // подсветить ближайший розыгрыш
    if(weeks){
      var t=target(), nodes=weeks.querySelectorAll('[data-mon]'), done=false;
      nodes.forEach(function(n){
        var wd=new Date(n.getAttribute('data-mon')+'T12:00:00');
        if(!done && wd>=t.d){ n.classList.add('next'); done=true; }
      });
      if(!done) nodes[0].classList.add('next');
    }
  })();

  /* ---------- FAQ: плавное раскрытие нативного <details> ---------- */
  document.querySelectorAll('.faq__item').forEach(function(item){
    var ans=item.querySelector('.faq__answer');
    function open(){ ans.style.height=ans.scrollHeight+'px'; }
    if(item.open) ans.style.height='auto';
    item.querySelector('summary').addEventListener('click',function(e){
      e.preventDefault();
      if(item.open){ // закрыть
        ans.style.height=ans.scrollHeight+'px'; requestAnimationFrame(function(){ ans.style.transition='height .3s ease'; ans.style.height='0px'; });
        ans.addEventListener('transitionend',function h(){ item.open=false; ans.style.transition=''; ans.removeEventListener('transitionend',h); });
      } else {
        item.open=true; ans.style.height='0px'; requestAnimationFrame(function(){ ans.style.transition='height .3s ease'; ans.style.height=ans.scrollHeight+'px'; });
        ans.addEventListener('transitionend',function h(){ ans.style.height='auto'; ans.style.transition=''; ans.removeEventListener('transitionend',h); });
      }
    });
  });

  /* ---------- CONFETTI ---------- */
  function boom(){
    if(typeof confetti!=='function') return;
    confetti({particleCount:160,spread:80,origin:{y:.6},colors:['#E0823F','#3a63f4','#ed1c24','#fff']});
    setTimeout(function(){confetti({particleCount:80,angle:60,spread:55,origin:{x:0}});},120);
    setTimeout(function(){confetti({particleCount:80,angle:120,spread:55,origin:{x:1}});},120);
  }
  document.querySelectorAll('[data-confetti]').forEach(function(b){ b.addEventListener('click',function(){ boom(); }); });
  document.querySelectorAll('[data-scroll]').forEach(function(b){ b.addEventListener('click',function(){ var el=document.querySelector(b.getAttribute('data-scroll')); if(el) el.scrollIntoView({behavior:'smooth'}); }); });

  /* ---------- КАСТОМНЫЙ DROPDOWN отелей (единый вид на всех ОС) ---------- */
  (function(){
    var cs=document.querySelector('.cselect'); if(!cs) return;
    var trig=cs.querySelector('.cselect__trigger'), val=cs.querySelector('.cselect__value'),
        opts=cs.querySelectorAll('.cselect__opt'), fsel=cs.closest('.field--select');
    function close(){ cs.classList.remove('is-open'); trig.setAttribute('aria-expanded','false'); }
    trig.addEventListener('click',function(e){
      e.stopPropagation();
      var open=cs.classList.toggle('is-open'); trig.setAttribute('aria-expanded',open?'true':'false');
    });
    opts.forEach(function(o){ o.addEventListener('click',function(){
      opts.forEach(function(x){ x.removeAttribute('aria-selected'); });
      o.setAttribute('aria-selected','true');
      val.textContent=o.textContent; val.classList.remove('cselect__value--ph');
      cs.setAttribute('data-value',o.textContent);
      if(fsel) fsel.classList.remove('field--error');
      close();
    });});
    document.addEventListener('click',function(e){ if(!cs.contains(e.target)) close(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  })();

  /* ---------- ФОРМА: 4 состояния после отправки (демо-определение по номеру: 2=отказ, 3=дубль недели, 4=дубль прошлого, иначе успех) ---------- */
  var form=document.getElementById('regForm');
  var STATES={
    success:{c:'is-success',i:'✓',t:'Заявка принята',x:'Номер {n} участвует в ближайшем розыгрыше. Победителей объявим в понедельник — следите за блоком «Итоги».',b:'Зарегистрировать ещё'},
    reject:{c:'is-reject',i:'✕',t:'Заявка не подходит под условия',x:'В розыгрыше участвуют брони Rixos Египет от 5 ночей, оплаченные по договору, от независимых агентств. Проверьте параметры брони.',b:'Ввести другой номер'},
    dupweek:{c:'is-dup',i:'!',t:'Заявка уже зарегистрирована',x:'Номер {n} уже участвует в розыгрыше этой недели. Каждая бронь — отдельный билет, зарегистрируйте другую заявку.',b:'Ввести другой номер'},
    duppast:{c:'is-dup',i:'!',t:'Заявка из прошлого периода',x:'Номер {n} уже участвовал в розыгрыше прошлой недели. Для нового розыгрыша внесите бронь текущей недели.',b:'Ввести другой номер'}
  };
  if(form){
    var rf=form.querySelector('.reg__form'), fs=form.querySelector('.form-status');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      // кастомный select отеля не входит в нативную валидацию — проверяем вручную
      var fsel=form.querySelector('.field--select'), cs=fsel.querySelector('.cselect');
      if(!cs.getAttribute('data-value')){ fsel.classList.add('field--error'); cs.querySelector('.cselect__trigger').focus(); return; }
      var num=(form.num.value||'').trim();
      var key=num==='2'?'reject':num==='3'?'dupweek':num==='4'?'duppast':'success';
      var s=STATES[key];
      fs.className='form-status '+s.c;
      fs.querySelector('.form-status__ic').textContent=s.i;
      fs.querySelector('.form-status__title').textContent=s.t;
      fs.querySelector('.form-status__text').textContent=s.x.replace('{n}',num||'—');
      fs.querySelector('.form-status__btn').textContent=s.b;
      rf.classList.add('is-result');
      if(key==='success') boom();
    });
    fs.querySelector('.form-status__btn').addEventListener('click',function(){
      rf.classList.remove('is-result'); form.reset();
    });
  }

  /* ---------- АНИМАЦИИ GSAP + LENIS ---------- */
  if(reduce || typeof gsap==='undefined'){ document.body.classList.add('no-anim','is-ready'); return; }
  document.body.classList.add('is-ready');
  gsap.registerPlugin(ScrollTrigger);

  // нативный скролл (Lenis убран — давал залипание)

  // HERO: masked reveal заголовка + появление
  var tl=gsap.timeline({delay:.15});
  tl.from('.hero h1 .line>span',{yPercent:120,duration:1.05,stagger:.1,ease:'power4.out'})
    .from('.hero__sub',{y:24,opacity:0,duration:.7,ease:'power3.out'},'-=.5')
    .from('.hero__cta',{y:24,opacity:0,duration:.7,ease:'power3.out'},'-=.45')
    .from('.hero__phone',{y:80,opacity:0,duration:1,ease:'power3.out'},'-=.7')
    .from('.badge',{scale:.6,opacity:0,duration:.6,stagger:.12,ease:'back.out(1.7)'},'-=.5')
    .from('.hero__lockup',{y:-16,opacity:0,duration:.6,ease:'power2.out'},'-=1.1');
  // failsafe: гарантируем видимость hero, даже если анимация не доиграла
  setTimeout(function(){gsap.set('.hero__sub,.hero__cta,.hero__phone,.badge,.hero__lockup',{opacity:1,y:0,scale:1,clearProps:'opacity,transform'});},2600);

  // плашки-бейджи: мягко плавают туда-сюда (несинхронно, после появления)
  gsap.to('.badge--left',{y:-11,rotation:'-=2.5',duration:2.4,ease:'sine.inOut',yoyo:true,repeat:-1,delay:2.7});
  gsap.to('.badge--right',{y:-9,rotation:'+=2.5',duration:2.9,ease:'sine.inOut',yoyo:true,repeat:-1,delay:2.7});

  // HERO scroll-driven: айфон уезжает вверх+растет+поворот, текст уходит, фон parallax
  gsap.to('#heroPhone',{yPercent:-12,scale:1.03,rotation:2,ease:'none',
    scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero__content',{y:-80,opacity:.2,ease:'none',
    scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('#heroBg',{yPercent:18,ease:'none',
    scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});

  // REVEAL секций
  gsap.utils.toArray('.reveal').forEach(function(el){
    ScrollTrigger.create({trigger:el,start:'top 84%',once:true,onEnter:function(){el.classList.add('in');}});
  });

  // карточки призов: наплывание по очереди (fade, не трогаем наклон веера)
  gsap.from('.prize',{opacity:0,duration:1,stagger:.15,ease:'power2.out',
    scrollTrigger:{trigger:'.fan',start:'top 82%',once:true}});

  // CLIP-REVEAL больших фото (шторка снизу + легкий зум)
  gsap.utils.toArray('[data-reveal-img]').forEach(function(card){
    var img=card.querySelector('img.bg');
    gsap.fromTo(card,{opacity:0,scale:.94},{opacity:1,scale:1,duration:1.1,ease:'power3.out',
      scrollTrigger:{trigger:card,start:'top 82%',once:true}});
    if(img) gsap.fromTo(img,{scale:1.12},{scale:1,duration:1.5,ease:'power3.out',
      scrollTrigger:{trigger:card,start:'top 82%',once:true}});
  });

  // 3D-TILT карточек призов
  document.querySelectorAll('.prize').forEach(function(c){
    var base = c.style.transform || getComputedStyle(c).transform;
    var rx=gsap.quickTo(c,'rotationX',{duration:.5,ease:'power3'}),
        ry=gsap.quickTo(c,'rotationY',{duration:.5,ease:'power3'});
    c.style.transformStyle='preserve-3d';
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();
      ry(((e.clientX-(r.left+r.width/2))/r.width)*14);
      rx((-(e.clientY-(r.top+r.height/2))/r.height)*14);});
    c.addEventListener('mouseleave',function(){rx(0);ry(0);});
  });

  // (magnetic-эффект кнопки hero убран по просьбе)

  // КАЛЕНДАРЬ: обводки сред-розыгрышей «дорисовываются»
  ScrollTrigger.create({trigger:'.cal',start:'top 80%',once:true,onEnter:function(){
    gsap.from('.cal__grid .d.draw',{scale:.4,opacity:0,duration:.5,stagger:.12,ease:'back.out(2)'});
  }});
})();

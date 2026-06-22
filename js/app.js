/*
 * ANEX × Rixos (v2) — поведение лендинга.
 * Блоки: обратный отсчет до пятницы · календарь июля · GSAP-анимации (hero, reveal, параллакс) · confetti.
 * Зависимости (CDN, подключены в index.html): GSAP + ScrollTrigger, canvas-confetti.
 */

(function(){
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- КАЛЕНДАРЬ: июль 2026 (1 июля = среда), пятницы 3,10,17,24,31 ---------- */
  (function buildCal(){
    var grid = document.getElementById('calGrid'); if(!grid) return;
    var dows = [['ПН',0],['ВТ',0],['СР',0],['ЧТ',0],['ПТ',0],['СБ',1],['ВС',1]];
    dows.forEach(function(d){ var e=document.createElement('div'); e.className='dow'+(d[1]?' we':''); e.textContent=d[0]; grid.appendChild(e); });
    var firstCol = 2; // среда (0=ПН)
    var fri = {3:1,10:1,17:1,24:1,31:1};
    for(var i=0;i<firstCol;i++){ var em=document.createElement('div'); em.className='d empty'; grid.appendChild(em); }
    for(var day=1; day<=31; day++){
      var c=document.createElement('div'); c.className='d'+(fri[day]?' fri':''); c.textContent=day; grid.appendChild(c);
    }
  })();

  /* ---------- ТАЙМЕР: до старта 01.07.2026, затем до ближайшей пятницы 18:00 ---------- */
  (function timer(){
    var clock=document.getElementById('clock'), lbl=document.getElementById('timerLbl'), weeks=document.getElementById('weeks');
    if(!clock) return;
    var start=new Date('2026-07-01T00:00:00');
    var fridays=['2026-07-03','2026-07-10','2026-07-17','2026-07-24','2026-07-31','2026-08-07','2026-08-14','2026-08-21'].map(function(d){return new Date(d+'T18:00:00');});
    function pad(n){return (n<10?'0':'')+n;}
    function target(){
      var now=new Date();
      if(now<start) return {d:start,l:'До старта конкурса'};
      for(var i=0;i<fridays.length;i++) if(fridays[i]>now) return {d:fridays[i],l:'До ближайшего розыгрыша'};
      return {d:fridays[fridays.length-1],l:'Конкурс завершен'};
    }
    function tick(){
      var t=target(), diff=Math.max(0,t.d-new Date());
      var s=Math.floor(diff/1000), d=Math.floor(s/86400), h=Math.floor(s%86400/3600), m=Math.floor(s%3600/60), ss=s%60;
      clock.textContent=pad(d)+' : '+pad(h)+' : '+pad(m)+' : '+pad(ss);
      lbl.textContent=t.l;
    }
    tick(); setInterval(tick,1000);
    // подсветить ближайшую неделю
    if(weeks){
      var t=target(), nodes=weeks.querySelectorAll('.week'), done=false;
      nodes.forEach(function(n){
        var fd=new Date(n.getAttribute('data-fri')+'T18:00:00');
        if(!done && fd>=t.d){ n.classList.add('next'); done=true; }
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

  /* ---------- ФОРМА ---------- */
  var form=document.getElementById('regForm');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=form.querySelector('.reg__submit'); btn.textContent='Заявка отправлена ✓'; btn.style.background='#1b9e4b';
    boom();
    setTimeout(function(){ btn.textContent='Отправить'; btn.style.background=''; form.reset(); },3500);
  });

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

  // КАЛЕНДАРЬ: обводки пятниц «дорисовываются»
  ScrollTrigger.create({trigger:'.cal',start:'top 80%',once:true,onEnter:function(){
    gsap.from('.cal__grid .d.fri',{scale:.4,opacity:0,duration:.5,stagger:.12,ease:'back.out(2)'});
  }});
})();

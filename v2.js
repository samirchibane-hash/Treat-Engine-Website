/* Treat Engine — V2 page behaviour: floating nav shadow on scroll, reveal-on-scroll. */
(function(){
  var nav = document.querySelector('.v2-nav');
  if (nav) {
    var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 30); };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function(e){ e.classList.add('visible'); }); return; }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, {threshold:0.08});
  els.forEach(function(e){ obs.observe(e); });
})();

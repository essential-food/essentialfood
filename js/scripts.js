// scroll reveal
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

  // active nav link on scroll
  const links = document.querySelectorAll('.rail a.navlink, .mobile-menu a.navlink');
  const secs = [...links].map(l=>document.querySelector(l.getAttribute('href')));
  const navObs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        secs.forEach((s,idx)=>{ if(s===e.target) links[idx].classList.add('active'); });
      }
    });
  }, {threshold:0.4});
  secs.forEach(s=>s && navObs.observe(s));

  // mobile menu toggle
  const mbarToggle = document.getElementById('mbarToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileBar = document.getElementById('mobileBar');
  if(mbarToggle && mobileMenu){
    mbarToggle.addEventListener('click', ()=>{
      mobileMenu.classList.toggle('open');
      mobileBar.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a.navlink').forEach(a=>{
      a.addEventListener('click', ()=>{
        mobileMenu.classList.remove('open');
        mobileBar.classList.remove('open');
      });
    });
  }

  // doc tabs
  document.querySelectorAll('.doc-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.doc-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.doc-mock').forEach(d=>d.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('doc-'+btn.dataset.doc).classList.add('active');
    });
  });

  // qr scan simulation
  const scanBtn = document.getElementById('scanBtn');
  const scanline = document.getElementById('scanline');
  const cert = document.getElementById('certCard');
  scanBtn.addEventListener('click', ()=>{
    cert.classList.remove('show');
    scanline.classList.remove('run');
    void scanline.offsetWidth;
    scanline.classList.add('run');
    setTimeout(()=>cert.classList.add('show'), 1500);
  });

  // finish picker — real material colors update the page accent live
  document.querySelectorAll('.finish').forEach(f=>{
    f.addEventListener('click', ()=>{
      document.querySelectorAll('.finish').forEach(x=>x.classList.remove('active'));
      f.classList.add('active');
      document.documentElement.style.setProperty('--forest-deep', f.dataset.accent);
      document.documentElement.style.setProperty('--accent-soft', f.dataset.soft);
    });
  });

  // parallax on hero logo
  const heroLogo = document.querySelector('.hero-logo');
  document.getElementById('hero').addEventListener('mousemove', (e)=>{
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - 0.5;
    const y = (e.clientY - r.top)/r.height - 0.5;
    heroLogo.style.transform = `scale(1.02) translate(${x*10}px, ${y*10}px)`;
  });
  document.getElementById('hero').addEventListener('mouseleave', ()=>{ heroLogo.style.transform=''; });

  // animated counters
  const statObs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals);
        let cur = 0;
        const step = target/40;
        const tick = ()=>{
          cur += step;
          if(cur >= target){ el.textContent = target.toFixed(decimals); return; }
          el.textContent = cur.toFixed(decimals);
          requestAnimationFrame(tick);
        };
        tick();
        statObs.unobserve(el);
      }
    });
  }, {threshold:0.5});
  document.querySelectorAll('.stat .num').forEach(el=>statObs.observe(el));

  // shopping cart
  let cart = [];
  const cartFab = document.getElementById('cartFab');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const cartCheckout = document.getElementById('cartCheckout');

  function formatCOP(n){ return '$' + n.toLocaleString('es-CO'); }

  window.addToCart = function(name, price){
    const existing = cart.find(i=>i.name===name);
    if(existing){ existing.qty += 1; } else { cart.push({name, price, qty:1}); }
    renderCart();
    openCart();
  };

  function changeQty(name, delta){
    const item = cart.find(i=>i.name===name);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0){ cart = cart.filter(i=>i.name!==name); }
    renderCart();
  }
  window.changeQty = changeQty;

  function renderCart(){
    if(cart.length===0){
      cartItemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío.</div>';
    } else {
      cartItemsEl.innerHTML = cart.map(i=>`
        <div class="cart-item">
          <div>
            <div class="cart-item-name">${i.name}</div>
            <div class="cart-item-qty">
              <button onclick="changeQty('${i.name.replace(/'/g,"\\'")}',-1)" style="border:none;background:none;cursor:pointer;color:var(--forest-deep);">−</button>
              ${i.qty}
              <button onclick="changeQty('${i.name.replace(/'/g,"\\'")}',1)" style="border:none;background:none;cursor:pointer;color:var(--forest-deep);">+</button>
            </div>
          </div>
          <div class="cart-item-price">${formatCOP(i.price*i.qty)}</div>
        </div>`).join('');
    }
    const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const count = cart.reduce((s,i)=>s+i.qty,0);
    cartTotalEl.textContent = formatCOP(total);
    cartCountEl.textContent = count;
    cartCountEl.style.display = count>0 ? 'flex' : 'none';
  }

  function openCart(){ cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); }
  function closeCart(){ cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); }

  cartFab.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  cartCheckout.addEventListener('click', ()=>{
    if(cart.length===0) return;
    const lines = cart.map(i=>`- ${i.name} x${i.qty}: ${formatCOP(i.price*i.qty)}`).join('%0A');
    const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const msg = `Hola, quiero hacer este pedido:%0A${lines}%0ATotal: ${formatCOP(total)}`;
    window.open(`https://wa.me/573208658868?text=${msg}`, '_blank');
  });

  function WhatsappBS (){
    window.open(`https://wa.me/573208658868?text=${"Hola quisiera contactarme con tu empresa para obtener mas informacion."}`, '_blank');
  }

  function tiktokir () {
    window.open('https://www.tiktok.com/@user9812126953328?is_from_webapp=1&sender_device=pc', '_blank');
  }

  function facebookir () {
    window.open('https://www.facebook.com/share/18QSiL1xUJ/', '_blank');    
  }

  function instagramIr () {
    window.open(' https://www.instagram.com/essencialfood12/?next=%2Ffxcal%2Fauth%2F%3Fapp_id%3D567067343352427', '_blank');    
  }
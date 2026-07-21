/* =====================================================================
   SUPREME COMMERCE — FAQ CHAT WIDGET
   ---------------------------------------------------------------------
   Self-contained: injects its own HTML + CSS on load. To add to a page,
   just include this one script tag near the end of <body>, after
   style.css has already been loaded (it reuses the site's CSS variables
   like --brass-bright, --ink-2, --line, --porcelain, --font-display,
   --font-body, --font-mono):

     <script src="assets/chat-widget.js"></script>

   No backend, no API key, no network calls — every answer below is
   scripted. Free-text input is matched against keyword groups; anything
   unmatched falls back to a "let's get you to a human" message linking
   to contact.html.
   ===================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. CONTENT — edit answers here, nothing else needs to change.
     ------------------------------------------------------------------ */

  var GREETING = "Hi! I'm the Supreme Commerce assistant. I can answer quick questions about our services, pricing, and how we work \u2014 or point you to a real person. What would you like to know?";

  var MENU = [
    { label: 'Our services', key: 'services' },
    { label: 'Pricing', key: 'pricing' },
    { label: 'How it works', key: 'process' },
    { label: 'Contact a human', key: 'contact' }
  ];

  var TOPICS = {
    services: {
      reply: "We run seven core services, each delivered by our in-house team:<br><br>" +
        "\u2022 Walmart Automation<br>" +
        "\u2022 Facebook Marketplace<br>" +
        "\u2022 TikTok Shop<br>" +
        "\u2022 Shopify Stores<br>" +
        "\u2022 Website Development<br>" +
        "\u2022 SEO<br>" +
        "\u2022 Social Media Management<br><br>" +
        "Want details on a specific one, or see pricing?",
      chips: ['pricing', 'process', 'contact']
    },
    pricing: {
      reply: "Starting prices (fixed, quoted upfront \u2014 no surprise invoices):<br><br>" +
        "\u2022 Facebook Marketplace \u2014 from $420<br>" +
        "\u2022 Walmart Automation \u2014 from $680<br>" +
        "\u2022 Shopify Stores \u2014 from $920<br>" +
        "\u2022 Website Development \u2014 from $1,150<br>" +
        "\u2022 TikTok Shop \u2014 from $1,450<br>" +
        "\u2022 Social Media Management \u2014 from $380/mo<br>" +
        "\u2022 SEO \u2014 from $540/mo<br><br>" +
        "Final pricing depends on scope \u2014 want a fixed quote for your project?",
      chips: ['contact', 'services']
    },
    process: {
      reply: "Our process is the same for every project:<br><br>" +
        "1. Tell us your goal &amp; channel<br>" +
        "2. We scope it and send a fixed price + timeline\u2014no calls needed<br>" +
        "3. You approve each milestone before we move forward<br>" +
        "4. We launch, and can keep managing it if you want ongoing support<br><br>" +
        "Most projects get a quote back within 24 hours.",
      chips: ['pricing', 'contact']
    },
    contact: {
      reply: "Happy to connect you with our team directly \u2014 tap an icon below, or use our contact form and we'll reply personally within one business day.",
      chips: [],
      cta: { label: 'Open contact page \u2192', href: 'contact.html' },
      icons: [
        { type: 'email', label: 'Email us', href: 'mailto:supremecommerce1@gmail.com' },
        { type: 'whatsapp', label: 'WhatsApp us', href: 'https://wa.me/13475196450' }
      ]
    }
  };

  /* Keyword groups for free-typed questions -> route to the same topics above. */
  var KEYWORDS = {
    services: ['service', 'services', 'offer', 'what do you do', 'walmart', 'facebook', 'marketplace', 'tiktok', 'shopify', 'website', 'seo', 'social media'],
    pricing: ['price', 'pricing', 'cost', 'how much', 'rate', 'rates', 'fee', 'budget'],
    process: ['process', 'how it works', 'how does it work', 'timeline', 'how long', 'turnaround', 'steps'],
    contact: ['contact', 'email', 'phone', 'call', 'talk to', 'human', 'reach', 'support', 'address']
  };

  var FALLBACK = "I don't have an exact answer for that one \u2014 but our team will. Want me to connect you?";

  /* ------------------------------------------------------------------
     2. STYLES
     ------------------------------------------------------------------ */

  var css = "" +
  ".sc-chat-bubble{position:fixed;bottom:24px;right:24px;z-index:500;width:60px;height:60px;border-radius:50%;" +
    "background:linear-gradient(135deg,var(--brass-bright,#C98D8A),var(--brass,#A85D5F));border:none;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(168,93,95,0.55);" +
    "transition:transform .25s cubic-bezier(.2,.8,.3,1.3);}" +
  ".sc-chat-bubble:hover{transform:scale(1.08);}" +
  ".sc-chat-bubble svg{width:26px;height:26px;}" +
  ".sc-chat-bubble .sc-icon-close{display:none;}" +
  ".sc-chat-bubble.sc-open .sc-icon-chat{display:none;}" +
  ".sc-chat-bubble.sc-open .sc-icon-close{display:block;}" +
  ".sc-chat-ping{position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--brass-bright,#C98D8A);" +
    "animation:scChatPing 2.6s ease-out infinite;pointer-events:none;}" +
  "@keyframes scChatPing{0%{transform:scale(0.9);opacity:0.9;}100%{transform:scale(1.35);opacity:0;}}" +
  ".sc-chat-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;" +
    "background:var(--signal,#3FA796);border:2px solid var(--ink,#0B0F14);}" +

  ".sc-chat-panel{position:fixed;bottom:96px;right:24px;z-index:499;width:min(360px,calc(100vw - 32px));" +
    "max-height:min(560px,calc(100vh - 140px));display:flex;flex-direction:column;overflow:hidden;" +
    "background:var(--ink-2,#121822);border:1px solid var(--line,#212A38);border-radius:20px;" +
    "box-shadow:0 40px 90px -20px rgba(0,0,0,0.65);" +
    "opacity:0;transform:translateY(16px) scale(0.97);pointer-events:none;visibility:hidden;" +
    "transition:opacity .25s ease,transform .25s cubic-bezier(.2,.8,.2,1),visibility 0s linear .25s;}" +
  ".sc-chat-panel.sc-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;visibility:visible;" +
    "transition:opacity .25s ease,transform .25s cubic-bezier(.2,.8,.2,1),visibility 0s linear 0s;}" +

  ".sc-chat-head{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--line,#212A38);" +
    "background:linear-gradient(135deg,rgba(201,141,138,0.14),rgba(63,167,150,0.08));flex-shrink:0;}" +
  ".sc-chat-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;" +
    "background:linear-gradient(135deg,var(--brass-bright,#C98D8A),var(--brass,#A85D5F));" +
    "display:flex;align-items:center;justify-content:center;font-family:var(--font-mono,monospace);" +
    "font-size:12px;font-weight:700;color:var(--ink,#0B0F14);}" +
  ".sc-chat-head-text{flex:1;min-width:0;}" +
  ".sc-chat-head-text strong{display:block;font-family:var(--font-display,serif);font-size:14.5px;color:var(--porcelain,#F6F4EF);}" +
  ".sc-chat-head-text span{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--slate,#8891A0);}" +
  ".sc-chat-head-text span::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--signal,#3FA796);flex-shrink:0;}" +
  ".sc-chat-close-x{margin-left:auto;background:none;border:none;color:var(--slate,#8891A0);cursor:pointer;padding:4px;" +
    "display:flex;flex-shrink:0;}" +
  ".sc-chat-close-x:hover{color:var(--porcelain,#F6F4EF);}" +

  ".sc-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;" +
    "-webkit-overflow-scrolling:touch;min-height:200px;}" +
  ".sc-msg{max-width:86%;font-size:13.5px;line-height:1.55;padding:10px 13px;border-radius:14px;}" +
  ".sc-msg-bot{align-self:flex-start;background:rgba(255,255,255,0.06);color:var(--porcelain,#F6F4EF);" +
    "border-bottom-left-radius:4px;}" +
  ".sc-msg-user{align-self:flex-end;background:linear-gradient(135deg,var(--brass-bright,#C98D8A),var(--brass,#A85D5F));" +
    "color:var(--ink,#0B0F14);font-weight:600;border-bottom-right-radius:4px;}" +
  ".sc-msg-cta{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;margin-top:2px;" +
    "font-size:12.5px;font-weight:700;color:var(--brass-bright,#C98D8A);text-decoration:none;}" +
  ".sc-msg-cta:hover{color:var(--porcelain,#F6F4EF);}" +

  ".sc-msg-icons{display:flex;gap:8px;align-self:flex-start;margin-top:2px;}" +
  ".sc-msg-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;" +
    "background:rgba(255,255,255,0.06);border:1px solid var(--line,#212A38);color:var(--brass-bright,#C98D8A);" +
    "transition:transform .2s ease,border-color .2s ease,background .2s ease;flex-shrink:0;}" +
  ".sc-msg-icon svg{width:17px;height:17px;}" +
  ".sc-msg-icon:hover{transform:scale(1.08);border-color:var(--brass-bright,#C98D8A);background:rgba(201,141,138,0.12);}" +

  ".sc-chips{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:100%;}" +
  ".sc-chip{font-family:var(--font-mono,monospace);font-size:11.5px;padding:7px 12px;border-radius:100px;" +
    "border:1px solid var(--line,#212A38);background:rgba(255,255,255,0.03);color:var(--porcelain,#F6F4EF);" +
    "cursor:pointer;transition:border-color .2s ease,color .2s ease,background .2s ease;white-space:nowrap;}" +
  ".sc-chip:hover{border-color:var(--brass-bright,#C98D8A);color:var(--brass-bright,#C98D8A);background:rgba(201,141,138,0.08);}" +

  ".sc-chat-typing{display:flex;gap:4px;align-self:flex-start;padding:12px 14px;background:rgba(255,255,255,0.06);" +
    "border-radius:14px;border-bottom-left-radius:4px;}" +
  ".sc-chat-typing span{width:6px;height:6px;border-radius:50%;background:var(--slate,#8891A0);" +
    "animation:scTypingBounce 1.1s ease-in-out infinite;}" +
  ".sc-chat-typing span:nth-child(2){animation-delay:.15s;}" +
  ".sc-chat-typing span:nth-child(3){animation-delay:.3s;}" +
  "@keyframes scTypingBounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-4px);opacity:1;}}" +

  ".sc-chat-foot{flex-shrink:0;display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,#212A38);}" +
  ".sc-chat-input{flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--line,#212A38);border-radius:100px;" +
    "padding:10px 16px;color:var(--porcelain,#F6F4EF);font-family:var(--font-body,sans-serif);font-size:13.5px;" +
    "outline:none;min-width:0;}" +
  ".sc-chat-input:focus{border-color:var(--brass-bright,#C98D8A);}" +
  ".sc-chat-send{flex-shrink:0;width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;" +
    "background:linear-gradient(135deg,var(--brass-bright,#C98D8A),var(--brass,#A85D5F));" +
    "display:flex;align-items:center;justify-content:center;transition:transform .2s ease;}" +
  ".sc-chat-send:hover{transform:scale(1.06);}" +
  ".sc-chat-send svg{width:16px;height:16px;color:var(--ink,#0B0F14);}" +

  ".sc-chat-body::-webkit-scrollbar{width:5px;}" +
  ".sc-chat-body::-webkit-scrollbar-thumb{background:var(--line,#212A38);border-radius:10px;}" +

  "@media(max-width:480px){" +
    ".sc-chat-bubble{bottom:18px;right:18px;width:54px;height:54px;}" +
    ".sc-chat-panel{bottom:82px;right:16px;left:16px;width:auto;max-height:min(520px,calc(100vh - 120px));}" +
  "}";

  var styleTag = document.createElement('style');
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ------------------------------------------------------------------
     3. MARKUP
     ------------------------------------------------------------------ */

  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<button class="sc-chat-bubble" id="scChatBubble" aria-label="Open chat" aria-expanded="false">' +
      '<span class="sc-chat-ping" aria-hidden="true"></span>' +
      '<svg class="sc-icon-chat" viewBox="0 0 24 24" fill="none" stroke="#0B0F14" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>' +
      '<svg class="sc-icon-close" viewBox="0 0 24 24" fill="none" stroke="#0B0F14" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '<span class="sc-chat-badge" id="scChatBadge" aria-hidden="true"></span>' +
    '</button>' +
    '<div class="sc-chat-panel" id="scChatPanel" role="dialog" aria-label="Chat with Supreme Commerce" aria-hidden="true">' +
      '<div class="sc-chat-head">' +
        '<div class="sc-chat-avatar">SC</div>' +
        '<div class="sc-chat-head-text"><strong>Supreme Commerce</strong><span>Usually replies in minutes</span></div>' +
        '<button class="sc-chat-close-x" id="scChatCloseX" aria-label="Close chat"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '</div>' +
      '<div class="sc-chat-body" id="scChatBody"></div>' +
      '<div class="sc-chat-foot">' +
        '<input type="text" class="sc-chat-input" id="scChatInput" placeholder="Type a question\u2026" autocomplete="off">' +
        '<button class="sc-chat-send" id="scChatSend" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);

  /* ------------------------------------------------------------------
     4. BEHAVIOUR
     ------------------------------------------------------------------ */

  var bubble = document.getElementById('scChatBubble');
  var panel = document.getElementById('scChatPanel');
  var body = document.getElementById('scChatBody');
  var input = document.getElementById('scChatInput');
  var sendBtn = document.getElementById('scChatSend');
  var closeX = document.getElementById('scChatCloseX');
  var badge = document.getElementById('scChatBadge');
  var started = false;
  var isOpen = false;

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function addMessage(text, who) {
    var el = document.createElement('div');
    el.className = 'sc-msg ' + (who === 'user' ? 'sc-msg-user' : 'sc-msg-bot');
    el.innerHTML = text;
    body.appendChild(el);
    scrollToBottom();
  }

  function addCta(label, href) {
    var a = document.createElement('a');
    a.className = 'sc-msg-cta';
    a.href = href;
    a.textContent = label;
    body.appendChild(a);
    scrollToBottom();
  }

  var ICON_SVGS = {
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4zM4 4l8 8 8-8"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 1.67c2.29 0 4.44.89 6.06 2.51a8.53 8.53 0 012.5 6.06c0 4.72-3.84 8.56-8.56 8.56a8.55 8.55 0 01-4.36-1.19l-.31-.19-3.12.82.83-3.04-.2-.32a8.5 8.5 0 01-1.31-4.55c0-4.72 3.85-8.56 8.57-8.56zm-3.32 4.29c-.16 0-.42.06-.64.31s-.85.83-.85 2.03.87 2.35.99 2.52c.12.16 1.72 2.72 4.29 3.7 2.13.82 2.56.66 3.02.62.46-.05 1.49-.61 1.7-1.2.21-.59.21-1.09.15-1.2-.06-.11-.23-.17-.48-.29-.25-.13-1.49-.74-1.72-.82-.23-.09-.4-.13-.57.13-.17.25-.65.82-.8.99-.15.16-.29.19-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.66-1.25-1.48-1.4-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.24-.41.08-.16.04-.31-.02-.44-.06-.13-.57-1.38-.79-1.89-.2-.49-.41-.42-.57-.43-.15-.01-.31-.01-.47-.01z"/></svg>'
  };

  function addIcons(icons) {
    if (!icons || !icons.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'sc-msg-icons';
    icons.forEach(function (icon) {
      var a = document.createElement('a');
      a.className = 'sc-msg-icon';
      a.href = icon.href;
      a.setAttribute('aria-label', icon.label);
      a.title = icon.label;
      if (icon.href.indexOf('mailto:') !== 0) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.innerHTML = ICON_SVGS[icon.type] || '';
      wrap.appendChild(a);
    });
    body.appendChild(wrap);
    scrollToBottom();
  }

  function addChips(keys) {
    if (!keys || !keys.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'sc-chips';
    keys.forEach(function (key) {
      var found = MENU.filter(function (m) { return m.key === key; })[0];
      var chip = document.createElement('button');
      chip.className = 'sc-chip';
      chip.type = 'button';
      chip.textContent = found ? found.label : key;
      chip.addEventListener('click', function () { handleTopic(key); });
      wrap.appendChild(chip);
    });
    body.appendChild(wrap);
    scrollToBottom();
  }

  function showTyping(callback) {
    var typing = document.createElement('div');
    typing.className = 'sc-chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(typing);
    scrollToBottom();
    setTimeout(function () {
      typing.remove();
      callback();
    }, 500 + Math.random() * 350);
  }

  function handleTopic(key) {
    var topic = TOPICS[key];
    if (!topic) return;
    var menuItem = MENU.filter(function (m) { return m.key === key; })[0];
    if (menuItem) addMessage(menuItem.label, 'user');
    showTyping(function () {
      addMessage(topic.reply, 'bot');
      if (topic.cta) addCta(topic.cta.label, topic.cta.href);
      addIcons(topic.icons);
      addChips(topic.chips);
    });
  }

  function matchKeywords(text) {
    var lower = text.toLowerCase();
    var keys = Object.keys(KEYWORDS);
    for (var i = 0; i < keys.length; i++) {
      var list = KEYWORDS[keys[i]];
      for (var j = 0; j < list.length; j++) {
        if (lower.indexOf(list[j]) !== -1) return keys[i];
      }
    }
    return null;
  }

  function handleUserText(text) {
    if (!text.trim()) return;
    addMessage(text.replace(/</g, '&lt;'), 'user');
    input.value = '';
    var matched = matchKeywords(text);
    showTyping(function () {
      if (matched) {
        var topic = TOPICS[matched];
        addMessage(topic.reply, 'bot');
        if (topic.cta) addCta(topic.cta.label, topic.cta.href);
        addIcons(topic.icons);
        addChips(topic.chips);
      } else {
        addMessage(FALLBACK, 'bot');
        addChips(['contact', 'services']);
      }
    });
  }

  function startConversation() {
    if (started) return;
    started = true;
    addMessage(GREETING, 'bot');
    addChips(MENU.map(function (m) { return m.key; }));
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add('sc-open');
    bubble.classList.add('sc-open');
    bubble.setAttribute('aria-label', 'Close chat');
    bubble.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    badge.style.display = 'none';
    startConversation();
    setTimeout(function () { input.focus({ preventScroll: true }); }, 260);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('sc-open');
    bubble.classList.remove('sc-open');
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  }

  bubble.addEventListener('click', function () {
    isOpen ? closePanel() : openPanel();
  });
  closeX.addEventListener('click', closePanel);

  sendBtn.addEventListener('click', function () { handleUserText(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleUserText(input.value);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* Close on outside click (but not on the bubble itself, handled above). */
  document.addEventListener('click', function (e) {
    if (isOpen && !panel.contains(e.target) && !bubble.contains(e.target)) closePanel();
  });
})();

/* ===== DACHECKERMEISTERBETRIEB SLOAN – WEBSITE SCRIPTS ===== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== MOBILE MENU TOGGLE =====
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        });

        // Close menu on link click
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
    }

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== FAQ ACCORDION =====
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const toggle = question.querySelector('.faq-toggle');

            // Close all others
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.nextElementSibling.classList.remove('active');
                    q.querySelector('.faq-toggle').classList.remove('active');
                }
            });

            // Toggle current
            answer.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    });

    // ===== SIMPLE LEAD FORM HANDLER =====
    const handleLeadSubmit = (form, source = 'website') => {
        const data = new FormData(form);
        const lead = {
            name: data.get('name'),
            phone: data.get('phone'),
            email: data.get('email') || 'nicht angegeben',
            roofType: data.get('roof-type') || 'nicht angegeben',
            message: data.get('message') || 'nicht angegeben',
            date: data.get('date') || 'nicht angegeben',
            source: source,
            timestamp: new Date().toISOString()
        };

        // Log lead (in production, send to CRM/email)
        console.log('=== NEUE LEAD-ANFRAGE ===', lead);

        // Show success message
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Gesendet! Wir melden uns in 24h.';
        btn.style.background = '#27ae60';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
        }, 4000);

        return false;
    };

    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLeadSubmit(leadForm, 'Hero Formular');
        });
    }

    const ctaForm = document.getElementById('cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLeadSubmit(ctaForm, 'CTA Formular');
        });
    }

    // ===== AI CHATBOT =====
    const chatTrigger = document.getElementById('chat-trigger');
    const chatWidget = document.getElementById('chat-widget');
    const closeChat = document.getElementById('close-chat');
    const sendChat = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    let leadData = {};
    let chatStep = null; // null, 'awaiting_name', 'awaiting_phone', 'awaiting_address', 'awaiting_date'

    // Toggle chat
    chatTrigger.addEventListener('click', () => {
        chatWidget.classList.add('open');
        chatTrigger.style.display = 'none';
        // Show quick replies if no conversation yet
        if (chatBody.querySelectorAll('.message.user').length === 0) {
            setTimeout(showQuickReplies, 600);
        }
    });

    closeChat.addEventListener('click', () => {
        chatWidget.classList.remove('open');
        chatTrigger.style.display = 'flex';
    });

    // Add message to chat
    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerHTML = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    // Show typing indicator
    const showTyping = () => {
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.id = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const hideTyping = () => {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    };

    // Show quick reply buttons
    const showQuickReplies = () => {
        const div = document.createElement('div');
        div.className = 'quick-replies';
        div.id = 'quick-replies';
        div.innerHTML = `
            <button class="quick-btn" data-action="inspection">🔍 Kostenlose Besichtigung</button>
            <button class="quick-btn" data-action="emergency">🚨 Notfall melden</button>
            <button class="quick-btn" data-action="quote">💰 Angebot anfragen</button>
            <button class="quick-btn" data-action="faq">❓ Fragen zur Reparatur</button>
        `;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;

        div.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => handleQuickReply(btn.dataset.action));
        });
    };

    const removeQuickReplies = () => {
        const qr = document.getElementById('quick-replies');
        if (qr) qr.remove();
    };

    // Show lead form inside chat
    const showLeadForm = (fields) => {
        const formDiv = document.createElement('div');
        formDiv.className = 'chat-lead-form';
        let html = '<form id="chat-lead-form">';

        if (fields.includes('name')) {
            html += '<input type="text" name="name" placeholder="Vor- und Nachname *" required>';
        }
        if (fields.includes('phone')) {
            html += '<input type="tel" name="phone" placeholder="Telefonnummer *" required>';
        }
        if (fields.includes('address')) {
            html += '<input type="text" name="address" placeholder="Ihre Adresse (Straße, PLZ, Ort)">';
        }
        if (fields.includes('date')) {
            html += '<input type="date" name="date">';
        }

        html += '<button type="submit" class="btn-chat-submit"><i class="fas fa-paper-plane"></i> Absenden & Termin sichern</button>';
        html += '</form>';
        formDiv.innerHTML = html;
        chatBody.appendChild(formDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        const form = formDiv.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            if (fields.includes('name')) leadData.name = fd.get('name');
            if (fields.includes('phone')) leadData.phone = fd.get('phone');
            if (fields.includes('address')) leadData.address = fd.get('address');
            if (fields.includes('date')) leadData.date = fd.get('date');

            // Log lead
            console.log('=== CHAT LEAD ===', { ...leadData, timestamp: new Date().toISOString() });

            formDiv.remove();
            showTyping();
            setTimeout(() => {
                hideTyping();
                addMessage('Vielen Dank! <strong>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</strong> Möchten Sie gleich einen Termin für die kostenlose Besichtigung?', 'bot');
                setTimeout(() => showQuickReplies(), 500);
            }, 1500);
        });
    };

    // Handle quick reply clicks
    const handleQuickReply = (action) => {
        removeQuickReplies();

        switch(action) {
            case 'inspection':
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    addMessage('Gerne! Eine <strong>kostenlose Besichtigung</strong> ist der beste erste Schritt. Ein Meister kommt zu Ihnen, begutachtet Ihr Dach und erstellt ein unverbindliches Festpreis-Angebot.', 'bot');
                    setTimeout(() => {
                        addMessage('Bitte hinterlassen Sie Ihre Daten:', 'bot');
                        showLeadForm(['name', 'phone', 'address', 'date']);
                    }, 500);
                }, 1000);
                break;

            case 'emergency':
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    addMessage('🚨 <strong>Notdienst!</strong> Bei akuten Schäden rufen Sie uns bitte sofort an:', 'bot');
                    setTimeout(() => {
                        addMessage('📞 <a href="tel:+4956112345678" style="color:#F47920;font-weight:700;font-size:1.2rem;">+49 561 123 456 78</a><br><br>Wir sind <strong>24/7</strong> für Sie da und innerhalb von 2 Stunden vor Ort.', 'bot');
                        setTimeout(() => {
                            addMessage('Soll ich trotzdem Ihre Daten aufnehmen, damit wir Sie zurückrufen können?', 'bot');
                            setTimeout(() => showQuickReplies(), 400);
                        }, 500);
                    }, 800);
                }, 1000);
                break;

            case 'quote':
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    addMessage('Gerne erstellen wir Ihnen ein <strong>unverbindliches Festpreis-Angebot</strong>. Dafür benötige ich ein paar Informationen:', 'bot');
                    setTimeout(() => {
                        showLeadForm(['name', 'phone']);
                    }, 500);
                }, 1000);
                break;

            case 'faq':
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    addMessage('Gerne beantworte ich Ihre Fragen zur Dachreparatur! Hier sind häufige Themen:', 'bot');
                    setTimeout(() => {
                        const div = document.createElement('div');
                        div.className = 'quick-replies';
                        div.innerHTML = `
                            <button class="quick-btn" data-action="faq-cost">💰 Kosten einer Reparatur</button>
                            <button class="quick-btn" data-action="faq-duration">⏱️ Dauer einer Neueindeckung</button>
                            <button class="quick-btn" data-action="faq-insurance">📋 Versicherungsabwicklung</button>
                            <button class="quick-btn" data-action="faq-emergency">🚨 Notdienst Wochenende</button>
                        `;
                        chatBody.appendChild(div);
                        chatBody.scrollTop = chatBody.scrollHeight;
                        div.querySelectorAll('.quick-btn').forEach(btn => {
                            btn.addEventListener('click', () => {
                                div.remove();
                                handleFAQSubQuestion(btn.dataset.action);
                            });
                        });
                    }, 500);
                }, 1000);
                break;
        }
    };

    const handleFAQSubQuestion = (action) => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            const answers = {
                'faq-cost': 'Die <strong>Kosten einer Dachreparatur</strong> variieren je nach Schaden: Kleinreparaturen ab ca. €500, umfangreichere Sanierungen €2.000–€5.000. Eine <strong>kostenlose Besichtigung</strong> gibt Ihnen Klarheit – mit Festpreis-Garantie!',
                'faq-duration': 'Ein Standard-Einfamilienhaus ist in <strong>3–7 Werktagen</strong> neu eingedeckt. Wir planen mit einem festen Zeitplan, den Sie vorab erhalten.',
                'faq-insurance': 'Ja, wir <strong>übernehmen die Abwicklung mit Ihrer Versicherung</strong> komplett für Sie: Schadensbericht, Fotos, Kostenvoranschlag – alles aus einer Hand.',
                'faq-emergency': 'Ja! Unser <strong>24/7 Notdienst</strong> ist auch an Wochenenden und Feiertagen für Sie da. Rufen Sie uns an: <a href="tel:+4956112345678" style="color:#F47920;font-weight:700;">+49 561 123 456 78</a>'
            };
            addMessage(answers[action] || 'Gerne beantworte ich Ihre Frage persönlich. Am besten vereinbaren wir eine kostenlose Besichtigung!', 'bot');
            setTimeout(() => {
                addMessage('Kann ich sonst noch etwas für Sie tun?', 'bot');
                setTimeout(() => showQuickReplies(), 400);
            }, 800);
        }, 1000);
    };

    // Handle text input (fallback for custom questions)
    const handleTextInput = (text) => {
        const query = text.toLowerCase().trim();

        let response = 'Vielen Dank für Ihre Nachricht! Am besten vereinbaren wir eine <strong>kostenlose Besichtigung</strong>, damit ein Meister sich Ihr Dach vor Ort ansehen kann. Klicken Sie einfach auf "Kostenlose Besichtigung" unten.';

        if (query.includes('hallo') || query.includes('hi') || query.includes('guten tag') || query.includes('guten morgen') || query.includes('guten abend')) {
            response = 'Hallo! Schön, dass Sie da sind. Wie kann ich Ihnen rund um Ihr Dach in Kassel helfen?';
            setTimeout(() => showQuickReplies(), 600);
        } else if (query.includes('kosten') || query.includes('preis') || query.includes('was kostet') || query.includes('teuer')) {
            response = 'Die Kosten hängen stark von Material und Fläche ab. Wir bieten <strong>kostenlose Inspektionen</strong> an, um Ihnen ein exaktes Festpreis-Angebot zu machen – ganz unverbindlich.';
            setTimeout(() => showQuickReplies(), 600);
        } else if (query.includes('reparatur') || query.includes('schaden') || query.includes('sturm') || query.includes('undicht') || query.includes('leck')) {
            response = 'Bei Schäden reagieren wir <strong>schnell</strong>. Unser Notdienst ist 24/7 für Kassel erreichbar. Sollen wir sofort jemanden vorbeischicken?';
            setTimeout(() => showQuickReplies(), 600);
        } else if (query.includes('inspektion') || query.includes('termin') || query.includes('besichtigung') || query.includes('vorbeikommen') || query.includes('angebot')) {
            response = 'Gerne! Eine <strong>kostenlose Besichtigung</strong> ist jederzeit möglich. Hinterlassen Sie mir bitte Ihre Daten, und wir melden uns zur Terminabstimmung.';
            setTimeout(() => showLeadForm(['name', 'phone', 'address']), 600);
        } else if (query.includes('flachdach') || query.includes('dachboden') || query.includes('ausbau')) {
            response = 'Flachdächer und Dachausbau sind Spezialgebiete von uns, besonders für Gewerbeimmobilien in Kassel. Wir verwenden modernste Abdichtungssysteme und Dämmmaterialien.';
        } else if (query.includes('meister') || query.includes('qualität') || query.includes('erfahrung') || query.includes('zertifiziert')) {
            response = 'Ja, wir sind ein <strong>eingetragener Meisterbetrieb</strong> mit über 20 Jahren Erfahrung. Der Chef arbeitet selbst mit und garantiert höchste Qualität bei jedem Projekt.';
        } else if (query.includes('danke') || query.includes('vielen dank')) {
            response = 'Gerne! Wenn Sie weitere Fragen haben, bin ich jederzeit für Sie da. Einen schönen Tag noch! <br><br>📞 <a href="tel:+4956112345678" style="color:#F47920;font-weight:700;">Direkt anrufen: +49 561 123 456 78</a>';
        } else if (query.includes('telefon') || query.includes('nummer') || query.includes('anrufen') || query.includes('kontakt')) {
            response = 'Sie erreichen uns direkt unter: <br><br>📞 <strong><a href="tel:+4956112345678" style="color:#F47920;font-size:1.2rem;">+49 561 123 456 78</a></strong><br><br>Wir sind Mo–Fr von 7–18 Uhr und Sa von 8–14 Uhr für Sie da.';
        } else if (query.includes('wo') || query.includes('gebiet') || query.includes('kassel') || query.includes('umgebung')) {
            response = 'Wir sind in <strong>Kassel und Umgebung</strong> tätig: Kassel (alle Stadtteile), Vellmar, Baunatal, Lohfelden, Fuldatal, Ahnatal und viele weitere Gemeinden.';
        }

        return response;
    };

    // Send message handler
    const handleSend = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';
        removeQuickReplies();
        chatStep = null;

        showTyping();
        setTimeout(() => {
            hideTyping();
            const response = handleTextInput(text);
            addMessage(response, 'bot');
            // If quick replies were shown inside handleTextInput, don't show defaults
        }, 1000 + Math.random() * 800);
    };

    sendChat.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Initial chatbot greeting with context
    console.log('🤖 Sloan AI Sales Agent aktiv – Bereit für Leads aus Kassel!');
});
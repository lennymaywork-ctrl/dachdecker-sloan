document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // 2. FAQ Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 3. AI Sales Agent (Chatbot)
    const chatTrigger = document.getElementById('chat-trigger');
    const chatWidget = document.getElementById('chat-widget');
    const closeChat = document.getElementById('close-chat');
    const sendChat = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const chatReplies = document.getElementById('chat-replies');

    let currentStep = 'init';
    let leadData = {};
    let flowType = ''; // 'besichtigung', 'notfall', 'angebot', 'faq'

    const faqs = [
        { q: 'kosten', a: 'Eine präzise Kostenschätzung erfordert eine Besichtigung. Kleinere Reparaturen starten bei ca. 250€. Wir bieten Festpreis-Garantie nach dem Check.' },
        { q: 'besichtigung', a: 'Unsere Besichtigungen in Kassel sind 100% kostenlos und unverbindlich. Ein Meister schaut sich den Zustand vor Ort an.' },
        { q: 'versicherung', a: 'Wir unterstützen Sie vollumfänglich bei der Schadensregulierung mit Ihrer Versicherung, inklusive Fotos und Dokumentation.' },
        { q: 'dauer', a: 'Ein neues Dach dauert meist 1-2 Wochen. Reparaturen erledigen wir oft innerhalb eines Tages.' },
        { q: 'notdienst', a: 'Ja, unser Notdienst ist 24/7 unter +49 561 12345678 erreichbar und in der Regel binnen 2 Stunden vor Ort.' },
        { q: 'gebiet', a: 'Wir sind in ganz Kassel und im Umkreis von ca. 50km (Vellmar, Baunatal, Lohfelden etc.) tätig.' }
    ];

    chatTrigger.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatTrigger.style.display = 'none';
        if (currentStep === 'init') {
            // scrollToBottom
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

    closeChat.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        chatTrigger.style.display = 'flex';
    });

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return msgDiv;
    };

    const showTyping = () => {
        const typing = document.createElement('div');
        typing.classList.add('message', 'bot', 'typing');
        typing.textContent = 'Schreibt...';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;
        return typing;
    };

    const handleBotResponse = (text) => {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            processFlow(text);
        }, 1000);
    };

    const processFlow = (userInput) => {
        const input = userInput.toLowerCase();

        // 1. Initial Flow Selection (if not in a flow)
        if (currentStep === 'init' || flowType === 'faq') {
            if (input.includes('besichtigung') || input === 'besichtigung') {
                startBesichtigungFlow();
                return;
            } else if (input.includes('notfall') || input === 'notfall') {
                startNotfallFlow();
                return;
            } else if (input.includes('angebot') || input === 'angebot') {
                startAngebotFlow();
                return;
            } else if (input.includes('reparatur') || input === 'reparatur') {
                addMessage("Gerne helfen wir bei Ihrer Reparatur. Handelt es sich um einen akuten Notfall (z.B. Wassereintritt) oder möchten Sie ein normales Angebot?", "bot");
                showQuickReplies([
                    {text: "Akuter Notfall", val: "notfall"},
                    {text: "Normales Angebot", val: "angebot"}
                ]);
                return;
            }

            // FAQ Matching
            const matchedFaq = faqs.find(f => input.includes(f.q));
            if (matchedFaq) {
                addMessage(matchedFaq.a + "\n\nKann ich sonst noch etwas für Sie tun?", "bot");
                showDefaultReplies();
                flowType = 'faq';
                return;
            }

            // Fallback
            if (userInput !== "") {
                addMessage("Das habe ich leider nicht ganz verstanden. Möchten Sie eine kostenlose Besichtigung vereinbaren oder ein Angebot anfragen?", "bot");
                showDefaultReplies();
            }
        }

        // 2. Besichtigung Flow
        else if (flowType === 'besichtigung') {
            if (currentStep === 'ask_name') {
                leadData.name = userInput;
                currentStep = 'ask_phone';
                addMessage(`Freut mich, Herr/Frau ${userInput}. Unter welcher Telefonnummer können wir Sie für die Terminabsprache erreichen?`, "bot");
            } else if (currentStep === 'ask_phone') {
                leadData.phone = userInput;
                currentStep = 'ask_address';
                addMessage("Vielen Dank. Und wie lautet die Adresse des Objekts in Kassel oder Umgebung?", "bot");
            } else if (currentStep === 'ask_address') {
                leadData.address = userInput;
                currentStep = 'ask_date';
                addMessage("Haben Sie einen Wunschtermin für die Besichtigung?", "bot");
            } else if (currentStep === 'ask_date') {
                leadData.date = userInput;
                finishLead("Besichtigung");
            }
        }

        // 3. Notfall Flow
        else if (flowType === 'notfall') {
            if (currentStep === 'ask_event') {
                leadData.event = userInput;
                currentStep = 'ask_phone_notfall';
                addMessage("Verstanden. Bitte geben Sie mir Ihre Telefonnummer, damit unser Notfall-Team Sie sofort kontaktieren kann.", "bot");
            } else if (currentStep === 'ask_phone_notfall') {
                leadData.phone = userInput;
                finishLead("NOTFALL");
            }
        }

        // 4. Angebot Flow
        else if (flowType === 'angebot') {
            if (currentStep === 'ask_roof_type') {
                leadData.roofType = userInput;
                currentStep = 'ask_size';
                addMessage("Ungefähr wie viele Quadratmeter hat das Dach?", "bot");
            } else if (currentStep === 'ask_size') {
                leadData.size = userInput;
                currentStep = 'ask_contact';
                addMessage("Alles klar. Bitte hinterlassen Sie mir Ihren Namen und Ihre Telefonnummer für das Angebot.", "bot");
            } else if (currentStep === 'ask_contact') {
                leadData.contact = userInput;
                finishLead("Angebot");
            }
        }
    };

    const startBesichtigungFlow = () => {
        flowType = 'besichtigung';
        currentStep = 'ask_name';
        addMessage("Sehr gerne! Für eine kostenlose Besichtigung benötige ich ein paar Details. Wie ist Ihr Name?", "bot");
        hideQuickReplies();
    };

    const startNotfallFlow = () => {
        flowType = 'notfall';
        currentStep = 'ask_event';
        addMessage("<strong>NOTFALL-SERVICE:</strong> Bitte rufen Sie direkt <strong>+49 561 12345678</strong> an für die schnellste Hilfe!\n\nOder schreiben Sie mir hier kurz: Was ist passiert? (z.B. Sturmloch, Wasser im Dach)", "bot");
        hideQuickReplies();
    };

    const startAngebotFlow = () => {
        flowType = 'angebot';
        currentStep = 'ask_roof_type';
        addMessage("Gerne erstellen wir ein Angebot. Um was für ein Dach handelt es sich? (z.B. Steildach, Flachdach, Garage)", "bot");
        hideQuickReplies();
    };

    const finishLead = (type) => {
        console.log(`LEAD COLLECTED [${type}]:`, leadData);
        addMessage(`<strong>Vielen Dank!</strong> Wir haben Ihre Anfrage für eine ${type} erhalten.\n\nEin Mitarbeiter von Dachdeckermeisterbetrieb Sloan wird sich innerhalb von 24 Stunden (im Notfall sofort) bei Ihnen melden.`, "bot");
        
        if (type !== "Besichtigung") {
            setTimeout(() => {
                addMessage("Möchten Sie zusätzlich gleich einen Termin für eine kostenlose Besichtigung reservieren?", "bot");
                showQuickReplies([
                    {text: "Ja, gerne", val: "besichtigung"},
                    {text: "Nein, danke", val: "init"}
                ]);
            }, 2000);
        } else {
            showDefaultReplies();
        }
        
        // Reset
        flowType = 'faq'; // Allow general questions again
        currentStep = 'init';
    };

    const showQuickReplies = (replies) => {
        chatReplies.innerHTML = '';
        replies.forEach(r => {
            const btn = document.createElement('button');
            btn.classList.add('reply-btn');
            btn.textContent = r.text;
            btn.dataset.value = r.val;
            btn.addEventListener('click', () => {
                addMessage(r.text, 'user');
                handleBotResponse(r.val);
            });
            chatReplies.appendChild(btn);
        });
    };

    const showDefaultReplies = () => {
        showQuickReplies([
            {text: "Kostenlose Besichtigung", val: "besichtigung"},
            {text: "Notfall melden", val: "notfall"},
            {text: "Angebot anfragen", val: "angebot"},
            {text: "Fragen zur Reparatur", val: "reparatur"}
        ]);
    };

    const hideQuickReplies = () => {
        chatReplies.innerHTML = '';
    };

    const handleSend = () => {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            chatInput.value = '';
            handleBotResponse(text);
        }
    };

    sendChat.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Initialize buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = this.dataset.value;
            const text = this.textContent;
            addMessage(text, 'user');
            handleBotResponse(val);
        });
    });

    // Hero Form Submission Mock
    const heroForm = document.getElementById('hero-form');
    if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = heroForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Gesendet!';
            btn.disabled = true;
            btn.style.background = '#28a745';
            console.log("Hero Form Lead:", new FormData(heroForm));
            setTimeout(() => {
                heroForm.reset();
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = '';
            }, 3000);
        });
    }

    // Final Form Submission Mock
    const finalForm = document.getElementById('final-form');
    if (finalForm) {
        finalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = finalForm.querySelector('button');
            btn.textContent = 'Termin angefragt!';
            btn.disabled = true;
            console.log("Final CTA Lead:", new FormData(finalForm));
        });
    }
});

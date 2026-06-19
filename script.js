document.addEventListener('DOMContentLoaded', () => {
    // Navigation Toggle
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

    // FAQ Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all other items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Chatbot Logic
    const chatTrigger = document.getElementById('chat-trigger');
    const chatWidget = document.getElementById('chat-widget');
    const closeChat = document.getElementById('close-chat');
    const sendChat = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const chatReplies = document.getElementById('chat-replies');

    let botState = 'initial';
    let leadData = {};

    const openChat = () => {
        chatWidget.style.display = 'flex';
        chatTrigger.style.transform = 'scale(0)';
    };

    const hideChat = () => {
        chatWidget.style.display = 'none';
        chatTrigger.style.transform = 'scale(1)';
    };

    chatTrigger.addEventListener('click', openChat);
    closeChat.addEventListener('click', hideChat);

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const showTyping = () => {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot', 'typing');
        typingDiv.textContent = 'Schreibt...';
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return typingDiv;
    };

    const handleBotResponse = (input) => {
        const typing = showTyping();
        
        setTimeout(() => {
            typing.remove();
            
            if (botState === 'collecting_name') {
                leadData.name = input;
                addMessage(`Vielen Dank, ${input}. Wie lautet Ihre Telefonnummer für Rückfragen?`, 'bot');
                botState = 'collecting_phone';
                return;
            }

            if (botState === 'collecting_phone') {
                leadData.phone = input;
                addMessage(`Haben wir. Und für welche Adresse oder welchen Stadtteil in Kassel ist die Anfrage?`, 'bot');
                botState = 'collecting_address';
                return;
            }

            if (botState === 'collecting_address') {
                leadData.address = input;
                addMessage(`Super. Ein Experte wird sich in Kürze bei Ihnen melden. Vielen Dank!`, 'bot');
                console.log('Lead Collected via Chat:', leadData);
                botState = 'finished';
                return;
            }

            const lowInput = input.toLowerCase();
            
            if (lowInput.includes('besichtigung') || lowInput.includes('termin') || lowInput.includes('angebot')) {
                addMessage('Gerne! Um ein passendes Angebot zu erstellen, brauche ich ein paar Infos. Wie ist Ihr vollständiger Name?', 'bot');
                botState = 'collecting_name';
            } else if (lowInput.includes('notfall') || lowInput.includes('sturm') || lowInput.includes('wasser')) {
                addMessage('WICHTIG: Bei akuten Notfällen rufen Sie uns bitte direkt an: +49 176 30714891. Wir sind 24/7 für Sie da!', 'bot');
            } else if (lowInput.includes('reparatur') || lowInput.includes('kosten')) {
                addMessage('Kleinere Reparaturen fangen oft bei 250€ an. Am besten vereinbaren wir eine kostenlose Besichtigung. Möchten Sie das?', 'bot');
            } else {
                addMessage('Ich habe Sie nicht ganz verstanden. Möchten Sie eine kostenlose Besichtigung vereinbaren oder haben Sie einen Notfall?', 'bot');
            }
        }, 1000);
    };

    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            chatInput.value = '';
            handleBotResponse(text);
        }
    };

    sendChat.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Handle Quick Replies
    chatReplies.addEventListener('click', (e) => {
        if (e.target.classList.contains('reply-btn')) {
            const val = e.target.getAttribute('data-value');
            const label = e.target.textContent;
            addMessage(label, 'user');
            handleBotResponse(label);
            chatReplies.style.display = 'none'; // Hide replies after first selection
        }
    });

    // Form Handling
    const forms = document.querySelectorAll('.quote-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Mock success
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Anfrage gesendet ✓';
            btn.style.background = '#28a745';
            btn.disabled = true;
            
            console.log('Form Submission:', data);
            
            setTimeout(() => {
                form.reset();
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 5000);
        });
    });
});

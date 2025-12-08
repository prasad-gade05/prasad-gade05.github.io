/* ============================================
   PRASAD GADE - PORTFOLIO JAVASCRIPT
   Neural Network & Data Visualization Animations
   ============================================ */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initNeuralNetwork();
    initDataParticles();
    initTypingEffect();
    initHeroChart();
    initScrollAnimations();
    initNavigation();
    initCounterAnimation();
    initProjectFilters();
    initProjectAnimations();
    initContactNetwork();
    initDataPipeline();
});

/* ============================================
   NEURAL NETWORK ANIMATION
   Forward and Backward Pass Visualization
   ============================================ */
function initNeuralNetwork() {
    const canvas = document.getElementById('neural-network');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];
    let connections = [];
    
    // Set canvas size
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initNodes();
    }
    
    // Initialize neural network nodes
    function initNodes() {
        nodes = [];
        connections = [];
        
        const layers = [4, 6, 8, 6, 4]; // Neural network architecture
        const layerSpacing = canvas.width / (layers.length + 1);
        
        layers.forEach((nodeCount, layerIndex) => {
            const nodeSpacing = canvas.height / (nodeCount + 1);
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: layerSpacing * (layerIndex + 1),
                    y: nodeSpacing * (i + 1),
                    layer: layerIndex,
                    index: i,
                    activation: Math.random(),
                    targetActivation: Math.random(),
                    radius: 4 + Math.random() * 2,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        });
        
        // Create connections between adjacent layers
        nodes.forEach(node => {
            nodes.filter(n => n.layer === node.layer + 1).forEach(nextNode => {
                connections.push({
                    from: node,
                    to: nextNode,
                    weight: Math.random(),
                    signal: 0,
                    signalProgress: Math.random(),
                    active: Math.random() > 0.5
                });
            });
        });
    }
    
    // Animation variables
    let forwardPass = true;
    let passProgress = 0;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update pass progress
        passProgress += 0.005;
        if (passProgress > 1) {
            passProgress = 0;
            forwardPass = !forwardPass;
        }
        
        // Draw connections
        connections.forEach(conn => {
            // Update signal
            if (conn.active) {
                conn.signalProgress += 0.01;
                if (conn.signalProgress > 1) {
                    conn.signalProgress = 0;
                    conn.active = Math.random() > 0.3;
                }
            } else {
                if (Math.random() > 0.995) conn.active = true;
            }
            
            // Draw connection line
            const gradient = ctx.createLinearGradient(
                conn.from.x, conn.from.y,
                conn.to.x, conn.to.y
            );
            
            const alpha = 0.1 + conn.weight * 0.2;
            gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha})`);
            gradient.addColorStop(1, `rgba(124, 58, 237, ${alpha})`);
            
            ctx.beginPath();
            ctx.moveTo(conn.from.x, conn.from.y);
            ctx.lineTo(conn.to.x, conn.to.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw signal traveling along connection
            if (conn.active) {
                const progress = forwardPass ? conn.signalProgress : 1 - conn.signalProgress;
                const signalX = conn.from.x + (conn.to.x - conn.from.x) * progress;
                const signalY = conn.from.y + (conn.to.y - conn.from.y) * progress;
                
                ctx.beginPath();
                ctx.arc(signalX, signalY, 3, 0, Math.PI * 2);
                ctx.fillStyle = forwardPass ? '#00d4ff' : '#7c3aed';
                ctx.fill();
                
                // Signal glow
                ctx.beginPath();
                ctx.arc(signalX, signalY, 8, 0, Math.PI * 2);
                const glowGradient = ctx.createRadialGradient(signalX, signalY, 0, signalX, signalY, 8);
                glowGradient.addColorStop(0, forwardPass ? 'rgba(0, 212, 255, 0.5)' : 'rgba(124, 58, 237, 0.5)');
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.fill();
            }
        });
        
        // Draw nodes
        nodes.forEach(node => {
            // Update activation
            node.activation += (node.targetActivation - node.activation) * 0.02;
            if (Math.random() > 0.99) node.targetActivation = Math.random();
            
            // Pulse animation
            node.pulsePhase += 0.05;
            const pulse = 1 + Math.sin(node.pulsePhase) * 0.2;
            
            // Node glow
            const glowRadius = node.radius * 3 * pulse;
            const glowGradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, glowRadius
            );
            const color = node.layer % 2 === 0 ? '0, 212, 255' : '124, 58, 237';
            glowGradient.addColorStop(0, `rgba(${color}, ${0.3 * node.activation})`);
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
            
            // Node core
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${0.5 + node.activation * 0.5})`;
            ctx.fill();
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resize);
    resize();
    animate();
}

/* ============================================
   DATA PARTICLES ANIMATION
   Floating data points visualization
   ============================================ */
function initDataParticles() {
    const canvas = document.getElementById('data-particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    
    function initParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#00d4ff' : '#7c3aed',
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, index) => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Bounce off edges
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            
            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    p.vx -= (dx / distance) * force * 0.5;
                    p.vy -= (dy / distance) * force * 0.5;
                }
            }
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            
            // Draw connections to nearby particles
            particles.slice(index + 1).forEach(p2 => {
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = p.color;
                    ctx.globalAlpha = (1 - distance / 100) * 0.2;
                    ctx.stroke();
                }
            });
        });
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resize);
    resize();
    animate();
}

/* ============================================
   TYPING EFFECT
   ============================================ */
function initTypingEffect() {
    const nameElement = document.getElementById('typed-name');
    const roleElement = document.getElementById('typed-role');
    
    if (!nameElement || !roleElement) return;
    
    const name = 'Prasad Gade';
    const roles = [
        'data into insights',
        'numbers into stories',
        'patterns into predictions',
        'complexity into clarity'
    ];
    
    let roleIndex = 0;
    
    // Type name
    typeText(nameElement, name, 100, () => {
        // Start role typing after name is done
        typeRole();
    });
    
    function typeRole() {
        const role = roles[roleIndex];
        typeText(roleElement, role, 50, () => {
            setTimeout(() => {
                deleteText(roleElement, 30, () => {
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeRole, 500);
                });
            }, 2000);
        });
    }
}

function typeText(element, text, speed, callback) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    
    type();
}

function deleteText(element, speed, callback) {
    function del() {
        if (element.textContent.length > 0) {
            element.textContent = element.textContent.slice(0, -1);
            setTimeout(del, speed);
        } else if (callback) {
            callback();
        }
    }
    
    del();
}

/* ============================================
   HERO CHART - Real-time Data Visualization
   ============================================ */
function initHeroChart() {
    const canvas = document.getElementById('hero-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let dataPoints = [];
    const maxPoints = 50;
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    
    function generateData() {
        // Simulate real-time data generation
        const value = 50 + Math.sin(Date.now() / 1000) * 20 + Math.random() * 20;
        dataPoints.push(value);
        
        if (dataPoints.length > maxPoints) {
            dataPoints.shift();
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
        
        // Draw circular grid
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * i / 4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.stroke();
        }
        
        // Draw radial lines
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.stroke();
        }
        
        // Draw data points as radar chart
        if (dataPoints.length > 2) {
            ctx.beginPath();
            
            dataPoints.forEach((value, i) => {
                const angle = (i / maxPoints) * Math.PI * 2 - Math.PI / 2;
                const r = (value / 100) * radius;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.closePath();
            
            // Fill
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Stroke
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw points
            dataPoints.forEach((value, i) => {
                const angle = (i / maxPoints) * Math.PI * 2 - Math.PI / 2;
                const r = (value / 100) * radius;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#00d4ff';
                ctx.fill();
            });
        }
        
        // Center text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Space Grotesk"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DATA', centerX, centerY - 10);
        ctx.font = '14px "JetBrains Mono"';
        ctx.fillStyle = '#00d4ff';
        ctx.fillText('VISUALIZATION', centerX, centerY + 15);
    }
    
    function animate() {
        generateData();
        draw();
        setTimeout(() => requestAnimationFrame(animate), 100);
    }
    
    window.addEventListener('resize', resize);
    resize();
    animate();
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger stagger animations for children
                if (entry.target.classList.contains('stagger-animation')) {
                    entry.target.classList.add('active');
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.section-header, .about-content, .skill-category, .timeline-item, .project-card, .edu-card, .publication-card, .achievement-card, .cert-card, .contact-link').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
    
    // Observe skill grids for stagger animation
    document.querySelectorAll('.skills-grid, .projects-grid, .achievements-grid, .cert-grid').forEach(el => {
        el.classList.add('stagger-animation');
        observer.observe(el);
    });
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile toggle
    navToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.dataset.target);
                const duration = 2000;
                const startTime = performance.now();
                const isDecimal = target % 1 !== 0;
                
                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = target * easeOutQuart;
                    
                    counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                    
                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        counter.textContent = isDecimal ? target.toFixed(1) : target;
                    }
                }
                
                requestAnimationFrame(update);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

/* ============================================
   PROJECT FILTERS
   ============================================ */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            projectCards.forEach(card => {
                const category = card.dataset.category;
                
                if (filter === 'all' || category.includes(filter)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* ============================================
   PROJECT CARD ANIMATIONS
   Mini visualizations for each project
   ============================================ */
function initProjectAnimations() {
    // Neural network mini animation
    initMiniNeural();
    
    // Chart mini animation
    initMiniChart();
    
    // Flow mini animation
    initMiniFlow();
    
    // Scatter mini animation
    initMiniScatter();
    
    // Donut mini animation
    initMiniDonut();
    
    // Bars mini animation
    initMiniBars();
}

function initMiniNeural() {
    const canvas = document.querySelector('#project-legal .mini-neural');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    
    let nodes = [];
    
    function init() {
        nodes = [];
        const layers = [3, 4, 4, 3];
        const layerSpacing = canvas.width / (layers.length + 1);
        
        layers.forEach((count, li) => {
            const nodeSpacing = canvas.height / (count + 1);
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x: layerSpacing * (li + 1),
                    y: nodeSpacing * (i + 1),
                    layer: li,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        nodes.forEach(n1 => {
            nodes.filter(n2 => n2.layer === n1.layer + 1).forEach(n2 => {
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
                ctx.stroke();
            });
        });
        
        // Draw nodes
        nodes.forEach(node => {
            node.pulse += 0.05;
            const size = 4 + Math.sin(node.pulse) * 2;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            ctx.fillStyle = node.layer % 2 === 0 ? '#00d4ff' : '#7c3aed';
            ctx.fill();
        });
        
        requestAnimationFrame(draw);
    }
    
    resize();
    init();
    draw();
    window.addEventListener('resize', () => { resize(); init(); });
}

function initMiniChart() {
    const canvas = document.querySelector('#project-ids .mini-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let data = Array(20).fill(0).map(() => Math.random() * 80 + 20);
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update data
        data.shift();
        data.push(Math.random() * 80 + 20);
        
        // Draw bars
        const barWidth = canvas.width / data.length - 4;
        data.forEach((val, i) => {
            const height = (val / 100) * (canvas.height - 40);
            const x = i * (barWidth + 4) + 2;
            const y = canvas.height - height - 20;
            
            const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - 20);
            gradient.addColorStop(0, '#00d4ff');
            gradient.addColorStop(1, '#7c3aed');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, height);
        });
        
        setTimeout(() => requestAnimationFrame(draw), 100);
    }
    
    resize();
    draw();
    window.addEventListener('resize', resize);
}

function initMiniFlow() {
    const canvas = document.querySelector('#project-kindhearts .mini-flow');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    
    function init() {
        particles = [];
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw flow lines
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
            const y = canvas.height / 2 + Math.sin((x + Date.now() / 100) / 30) * 30;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();
        });
        
        requestAnimationFrame(draw);
    }
    
    resize();
    init();
    draw();
    window.addEventListener('resize', () => { resize(); init(); });
}

function initMiniScatter() {
    const canvas = document.querySelector('#project-celestial .mini-scatter');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let points = [];
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    
    function init() {
        points = [];
        const colors = ['#00d4ff', '#7c3aed', '#f59e0b'];
        
        for (let i = 0; i < 50; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        points.forEach(p => {
            p.twinkle += 0.1;
            const alpha = 0.5 + Math.sin(p.twinkle) * 0.5;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    
    resize();
    init();
    draw();
    window.addEventListener('resize', () => { resize(); init(); });
}

function initMiniDonut() {
    const canvas = document.querySelector('#project-nutri .mini-donut');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let rotation = 0;
    const segments = [
        { value: 30, color: '#00d4ff' },
        { value: 25, color: '#7c3aed' },
        { value: 25, color: '#10b981' },
        { value: 20, color: '#f59e0b' }
    ];
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
        const innerRadius = radius * 0.6;
        
        let startAngle = rotation;
        const total = segments.reduce((sum, s) => sum + s.value, 0);
        
        segments.forEach(segment => {
            const angle = (segment.value / total) * Math.PI * 2;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + angle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            
            startAngle += angle;
        });
        
        rotation += 0.01;
        requestAnimationFrame(draw);
    }
    
    resize();
    draw();
    window.addEventListener('resize', resize);
}

function initMiniBars() {
    const canvas = document.querySelector('#project-audio .mini-bars');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const barCount = 32;
    let bars = Array(barCount).fill(0);
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / barCount - 2;
        const centerY = canvas.height / 2;
        
        bars = bars.map(() => Math.random() * 0.8 + 0.2);
        
        bars.forEach((val, i) => {
            const height = val * (canvas.height - 20);
            const x = i * (barWidth + 2) + 1;
            
            // Top bar
            const gradient = ctx.createLinearGradient(0, centerY - height / 2, 0, centerY);
            gradient.addColorStop(0, '#00d4ff');
            gradient.addColorStop(1, '#7c3aed');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, centerY - height / 2, barWidth, height / 2);
            
            // Bottom bar (mirror)
            const gradient2 = ctx.createLinearGradient(0, centerY, 0, centerY + height / 2);
            gradient2.addColorStop(0, '#7c3aed');
            gradient2.addColorStop(1, '#00d4ff');
            ctx.fillStyle = gradient2;
            ctx.fillRect(x, centerY, barWidth, height / 2);
        });
        
        setTimeout(() => requestAnimationFrame(draw), 50);
    }
    
    resize();
    draw();
    window.addEventListener('resize', resize);
}

/* ============================================
   CONTACT NETWORK ANIMATION
   ============================================ */
function initContactNetwork() {
    const canvas = document.getElementById('contact-network');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let centerNode;
    
    function resize() {
        canvas.width = canvas.parentElement?.offsetWidth || 400;
        canvas.height = canvas.parentElement?.offsetHeight || 400;
        init();
    }
    
    function init() {
        nodes = [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Center node (you)
        centerNode = {
            x: centerX,
            y: centerY,
            radius: 20,
            label: 'PG',
            color: '#00d4ff'
        };
        
        // Surrounding nodes (contacts/skills)
        const labels = ['📧', '💼', '🐙', '📊', '🔗'];
        const radius = Math.min(canvas.width, canvas.height) / 3;
        
        labels.forEach((label, i) => {
            const angle = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
            nodes.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                targetX: centerX + Math.cos(angle) * radius,
                targetY: centerY + Math.sin(angle) * radius,
                radius: 25,
                label: label,
                angle: angle,
                orbitRadius: radius,
                orbitSpeed: 0.001 + Math.random() * 0.001
            });
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Update and draw connections
        nodes.forEach(node => {
            // Update orbit
            node.angle += node.orbitSpeed;
            node.x = centerX + Math.cos(node.angle) * node.orbitRadius;
            node.y = centerY + Math.sin(node.angle) * node.orbitRadius;
            
            // Draw connection
            ctx.beginPath();
            ctx.moveTo(centerNode.x, centerNode.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw orbit path
            ctx.beginPath();
            ctx.arc(centerX, centerY, node.orbitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        
        // Draw center node
        ctx.beginPath();
        ctx.arc(centerNode.x, centerNode.y, centerNode.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            centerNode.x, centerNode.y, 0,
            centerNode.x, centerNode.y, centerNode.radius
        );
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#7c3aed');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Center label
        ctx.fillStyle = '#0a0a0f';
        ctx.font = 'bold 14px "Space Grotesk"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerNode.label, centerNode.x, centerNode.y);
        
        // Draw surrounding nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(26, 26, 37, 0.9)';
            ctx.fill();
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Node label
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, node.x, node.y);
        });
        
        requestAnimationFrame(draw);
    }
    
    resize();
    draw();
    window.addEventListener('resize', resize);
}

/* ============================================
   DATA PIPELINE ANIMATION
   ============================================ */
function initDataPipeline() {
    const stages = document.querySelectorAll('.pipeline-stage');
    let currentStage = 0;
    
    function activateStage() {
        stages.forEach((stage, index) => {
            if (index === currentStage) {
                stage.classList.add('active');
            } else {
                stage.classList.remove('active');
            }
        });
        
        currentStage = (currentStage + 1) % stages.length;
    }
    
    setInterval(activateStage, 500);
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ============================================
   PARALLAX EFFECT ON MOUSE MOVE
   ============================================ */
document.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const rect = hero.getBoundingClientRect();
    if (e.clientY > rect.bottom) return;
    
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translate(${x}px, ${y}px)`;
    }
});

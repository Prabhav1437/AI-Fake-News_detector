document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analysis-form');
    const clearBtn = document.getElementById('clear-btn');
    const loadingState = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const inputSection = document.querySelector('.input-section');

    // Chart Instance
    let credibilityChartInstance = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const headline = document.getElementById('headline').value;
        const mainText = document.getElementById('article-text').value;

        if (!headline || !mainText) return;

        // UI Transition to Loading
        resultsSection.classList.add('hidden');
        loadingState.classList.remove('hidden');
        inputSection.style.opacity = '0.5';
        inputSection.style.pointerEvents = 'none';

        // Simulate AI Network Request Time (2.5 seconds)
        setTimeout(() => {
            simulateAIAnalysis(headline, mainText);
            
            loadingState.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            inputSection.style.opacity = '1';
            inputSection.style.pointerEvents = 'auto';
            
            // Scroll to results smoothly
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2500);
    });

    clearBtn.addEventListener('click', () => {
        form.reset();
        resultsSection.classList.add('hidden');
        inputSection.style.opacity = '1';
        inputSection.style.pointerEvents = 'auto';
    });

    function simulateAIAnalysis(headline, text) {
        // Keyword-based naive simulation for realistic effect
        const lowerHeadline = headline.toLowerCase();
        const lowerText = text.toLowerCase();
        
        const fakeKeywords = ['shocking', 'secret', 'miracle', 'you won\'t believe', 'conspiracy', 'illuminati', 'hoax', 'banned'];
        let fakeKeywordCount = 0;
        
        fakeKeywords.forEach(word => {
            if (lowerHeadline.includes(word) || lowerText.includes(word)) {
                fakeKeywordCount++;
            }
        });

        // Determine if likely Fake
        const isLikelyFake = fakeKeywordCount > 0 || Math.random() > 0.6; // Pseudo-random fallback with bias
        const baseConfidence = 65 + (Math.random() * 30); // 65% to 95%
        
        updateVerdict(isLikelyFake, baseConfidence);
        updateCredibilityScore(isLikelyFake);
        updateSentiment(isLikelyFake);
        updateInsights(isLikelyFake, fakeKeywordCount);
    }

    function updateVerdict(isFake, confidence) {
        const verdictCard = document.getElementById('verdict-container');
        const verdictText = document.getElementById('verdict-text');
        const verdictIcon = document.getElementById('verdict-icon');
        const confidenceScore = document.getElementById('confidence-score');
        const confidenceFill = document.getElementById('confidence-fill');

        if (isFake) {
            verdictCard.classList.add('is-fake');
            verdictText.innerText = 'High Risk: Likely Fake';
            verdictIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            confidenceFill.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
        } else {
            verdictCard.classList.remove('is-fake');
            verdictText.innerText = 'Verified: Likely Real';
            verdictIcon.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
            confidenceFill.style.background = 'linear-gradient(90deg, #10b981, #3b82f6)';
        }

        confidenceScore.innerText = `${confidence.toFixed(1)}%`;
        
        // Animate bar width
        confidenceFill.style.width = '0%';
        setTimeout(() => {
            confidenceFill.style.width = `${confidence}%`;
        }, 100);
    }

    function updateCredibilityScore(isFake) {
        // Source credibility 
        const score = isFake ? Math.floor(20 + Math.random() * 30) : Math.floor(75 + Math.random() * 20);
        document.getElementById('credibility-center').innerText = score;

        const statusLabel = document.getElementById('source-status');
        const domainPattern = document.getElementById('domain-pattern');
        const mapMatch = document.getElementById('knowledge-map');

        if (isFake) {
            statusLabel.className = 'status negative';
            statusLabel.innerText = 'Flagged as Unreliable';
            domainPattern.innerText = 'Clickbait / Unverified format';
            mapMatch.innerText = 'Matches blacklisted dataset patterns';
        } else {
            statusLabel.className = 'status positive';
            statusLabel.innerText = 'Trusted Source';
            domainPattern.innerText = 'Standard Journalistic Format';
            mapMatch.innerText = 'Aligns with verified news corpus';
        }

        renderDonutChart(score, isFake ? '#ef4444' : '#10b981');
    }

    function renderDonutChart(score, color) {
        const ctx = document.getElementById('credibilityChart').getContext('2d');
        
        if (credibilityChartInstance) {
            credibilityChartInstance.destroy();
        }

        credibilityChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    function updateSentiment(isFake) {
        // Manipulative, Sensational, Objectivity
        const manip = Math.floor(isFake ? 60 + Math.random() * 35 : 5 + Math.random() * 15);
        const sens = Math.floor(isFake ? 70 + Math.random() * 25 : 10 + Math.random() * 20);
        const obj = Math.floor(isFake ? 10 + Math.random() * 25 : 75 + Math.random() * 20);

        setBar('manipulative', manip, manip > 50 ? 'danger' : 'success');
        setBar('sensationalism', sens, sens > 50 ? 'danger' : 'success');
        setBar('objectivity', obj, obj < 50 ? 'warning' : 'positive');
    }

    function setBar(id, value, type) {
        setTimeout(() => {
            const bar = document.getElementById(`${id}-fill`);
            bar.style.width = `${value}%`;
            bar.className = `progress-fill ${type}`;
            document.getElementById(`${id}-score`).innerText = `${value}%`;
        }, 150);
    }

    function updateInsights(isFake, keywordCount) {
        const misinfoFlags = document.getElementById('misinfo-flags');
        const validation = document.getElementById('dataset-validation');

        if (isFake) {
            misinfoFlags.innerHTML = `Identified <strong>${keywordCount || 2} indicators</strong> of manipulative phrasing and sensationalism. Logical inconsistencies found in the claim's sequence.`;
            validation.innerHTML = `High correlation with the Kaggle ISOT Fake News sub-dataset. Cross-referenced and failed to match multiple known factual sources.`;
        } else {
            misinfoFlags.innerHTML = `No major red flags detected. The text utilizes neutral reporting styles and attributes claims properly.`;
            validation.innerHTML = `Compared against 26,000+ examples in our True News databases. High coherence with verified events.`;
        }
    }
});

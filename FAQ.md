---
layout: default-shared
title: "Frequently Asked Questions | Bluedobie Developing"
description: "Learn the answers to some of our most frequently asked questions. Partner with Bluedobie for exceptional results!"
og_image: "https://bluedobiedev.com/images/confused-sabre.webp"
canonical: "https://www.bluedobiedev.com/FAQ"
permalink: /FAQ.html
---

<style>
.faq-page-content {
  padding: 60px 20px;
  background: #f9f9f9;
  min-height: 70vh;
}

.faq-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.faq-header {
  text-align: center;
  margin-bottom: 50px;
}

.faq-header h1 {
  font-size: 2.5rem;
  color: #042d4d;
  margin-bottom: 10px;
}

.faq-header p {
  font-size: 1.2rem;
  color: #666;
}

.faq-section {
  margin-bottom: 40px;
}

.faq-section h2 {
  font-size: 1.8rem;
  color: #042d4d;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 3px solid #042d4d;
}

.faq-item {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 15px;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  font-size: 1.15rem;
  font-weight: bold;
  cursor: pointer;
  padding: 18px 20px;
  background-color: #042d4d;
  color: #fff;
  border-radius: 8px;
  margin: 10px 0;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question::after {
  content: '+';
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.faq-question.active::after {
  content: '−';
  transform: rotate(180deg);
}

.faq-question:hover {
  background-color: #063a63;
}

.faq-answer {
  display: none;
  padding: 20px;
  margin: 0;
  background-color: #f9f9f9;
  border-radius: 0 0 8px 8px;
  border-left: 4px solid #042d4d;
  line-height: 1.7;
  font-size: 1.05rem;
  color: #333;
}

.faq-answer.active {
  display: block;
}

.cta {
  text-align: center;
  margin-top: 50px;
  padding: 30px;
  background-color: #f0f8ff;
  border-radius: 8px;
  border: 2px solid #042d4d;
}

.cta p {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.cta a {
  color: #042d4d;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
}

.cta a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .faq-container {
    padding: 30px 20px;
  }

  .faq-header h1 {
    font-size: 2rem;
  }

  .faq-section h2 {
    font-size: 1.5rem;
  }

  .faq-question {
    font-size: 1rem;
    padding: 15px;
  }

  .faq-answer {
    font-size: 0.95rem;
    padding: 15px;
  }
}
</style>

<div class="faq-page-content">
  <div class="faq-container">
    <div class="faq-header">
      <h1>Frequently Asked Questions</h1>
      <p>Have questions? We've got answers!</p>
    </div>

    <!-- General Questions Section -->
    <div class="faq-section">
      <h2>General Questions</h2>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">What is Bluedobie Developing?</div>
        <div class="faq-answer">Bluedobie Developing is a web design and development agency dedicated to helping small businesses succeed online with custom websites and digital solutions.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">Who is Sabre?</div>
        <div class="faq-answer">Sabre is our beloved blue Doberman mascot, symbolizing loyalty, agility, and excellence!</div>
      </div>
    </div>

    <!-- Services Offered Section -->
    <div class="faq-section">
      <h2>Services Offered</h2>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">What services do you provide?</div>
        <div class="faq-answer">We specialize in custom web design, SEO optimization, e-commerce solutions, and branding.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">Can you help with social media branding?</div>
        <div class="faq-answer">Yes, we offer tailored social media branding packages to boost your online presence.</div>
      </div>
    </div>

    <!-- Pricing and Payments Section -->
    <div class="faq-section">
      <h2>Pricing and Payments</h2>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">What's your pricing structure?</div>
        <div class="faq-answer">We provide flexible packages to meet your needs. Contact us for a custom quote.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">Do you offer payment plans?</div>
        <div class="faq-answer">Yes, we offer payment plans for select services. Let's discuss what works for you.</div>
      </div>
    </div>

    <!-- Technical Support Section -->
    <div class="faq-section">
      <h2>Technical Support</h2>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">What if I need help after my website is live?</div>
        <div class="faq-answer">We offer ongoing support packages to ensure your site runs smoothly.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">Do you help with website updates?</div>
        <div class="faq-answer">Absolutely! We provide maintenance services for updates, content changes, and more.</div>
      </div>
    </div>

    <!-- Getting Started Section -->
    <div class="faq-section">
      <h2>Getting Started</h2>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">How do I get started with Bluedobie Developing?</div>
        <div class="faq-answer">Simply reach out to us via our contact form, and we'll guide you through the process.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFAQ(this)">What's the typical project timeline?</div>
        <div class="faq-answer">Timelines vary based on project complexity, but we'll provide a clear estimate upfront.</div>
      </div>
    </div>

    <!-- Call-to-Action -->
    <div class="cta">
      <p>Didn't find what you're looking for? <a href="/contact.html">Contact us</a> for personalized assistance!</p>
    </div>
  </div>
</div>

<script>
function toggleFAQ(element) {
  // Toggle active class on question
  element.classList.toggle('active');
  
  // Toggle answer visibility
  const answer = element.nextElementSibling;
  answer.classList.toggle('active');
  
  // Optional: Close other FAQs (comment out if you want multiple open at once)
  /*
  const allQuestions = document.querySelectorAll('.faq-question');
  const allAnswers = document.querySelectorAll('.faq-answer');
  
  allQuestions.forEach(q => {
    if (q !== element && q.classList.contains('active')) {
      q.classList.remove('active');
    }
  });
  
  allAnswers.forEach(a => {
    if (a !== answer && a.classList.contains('active')) {
      a.classList.remove('active');
    }
  });
  */
}
</script>

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
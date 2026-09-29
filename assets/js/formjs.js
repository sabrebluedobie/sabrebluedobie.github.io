document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('multiForm');
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const serviceSelect = form.querySelector('select[name="request-type"]');
  const websiteInput = form.querySelector('input[name="website"]');
  const statusMessage = form.querySelector('#form-status');
  const preselectedNote = form.querySelector('#form-preselected');
  const formIntro = document.getElementById('form-intro');

  const defaultIntro = formIntro ? formIntro.innerHTML : null;

  // The intro above the form names whichever service is selected. Variants
  // live in <template data-service="..."> blocks in contact.html, keyed by
  // the exact option value, so the copy stays editable in the page. An
  // option with no template falls back to the default intro.
  function syncFormIntro() {
    if (!formIntro || defaultIntro === null) return;

    const selected = serviceSelect ? serviceSelect.value : '';
    const variant = selected
      ? document.querySelector(
          `template[data-service="${window.CSS && CSS.escape ? CSS.escape(selected) : selected}"]`
        )
      : null;

    if (variant) {
      formIntro.replaceChildren(variant.content.cloneNode(true));
    } else {
      formIntro.innerHTML = defaultIntro;
    }
  }

  function isAuditRequest() {
    return serviceSelect && serviceSelect.value.toLowerCase() === 'free web audit';
  }

  function syncWebsiteRequirement() {
    if (!websiteInput) return;

    const auditSelected = isAuditRequest();
    websiteInput.required = auditSelected;
    websiteInput.placeholder = auditSelected
      ? 'Website URL (required for a free web audit)'
      : 'Website (if applicable)';
  }

  function showStep(stepNumber) {
    steps.forEach((step) => step.classList.remove('active'));

    const targetStep = form.querySelector(`#step${stepNumber}`);
    if (targetStep) {
      targetStep.classList.add('active');
    }
  }

  function validateStep(stepNumber) {
    const currentStep = form.querySelector(`#step${stepNumber}`);
    if (!currentStep) return false;

    const requiredFields = currentStep.querySelectorAll(
      'input[required], select[required], textarea[required]'
    );

    for (const field of requiredFields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    return true;
  }

  // Every visitor now starts on step 1, but a field on a later step can
  // still be invalid at submit time. A browser can't show a validation
  // bubble for a display:none field, so form.reportValidity() would fail
  // silently. Walk every field in DOM order instead, and jump to whichever
  // step holds the first invalid one before reporting it.
  function goToFirstInvalidField() {
    const fields = form.querySelectorAll('input, select, textarea');

    for (const field of fields) {
      if (!field.checkValidity()) {
        const stepEl = field.closest('.form-step');
        const match = stepEl && stepEl.id.match(/^step(\d+)$/);
        if (match) showStep(Number(match[1]));
        field.reportValidity();
        return true;
      }
    }

    return false;
  }

  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });
    return utm;
  }

  function trackEvent(name, extraParams) {
    const params = Object.assign({}, extraParams, getUtmParams());
    try {
      // GA4 is loaded by Cloudflare Zaraz here, which means there is no global
      // gtag on the page - zaraz.track is its equivalent. The old code guarded
      // on `typeof gtag === 'function'`, which is always false under Zaraz, so
      // every event was silently dropped. The gtag branch stays as a fallback
      // in case the site ever loads gtag.js directly again.
      if (window.zaraz && typeof window.zaraz.track === 'function') {
        window.zaraz.track(name, params);
      } else if (typeof gtag === 'function') {
        gtag('event', name, params);
      }
    } catch (error) {
      // Analytics must never block navigation or form submission.
      console.warn('Analytics event failed:', name, error);
    }
  }

  window.nextStep = function (currentStep) {
    if (!validateStep(currentStep)) return;

    if (currentStep === 2 && isAuditRequest() && websiteInput && !websiteInput.checkValidity()) {
      showStep(1);
      websiteInput.reportValidity();
      return;
    }

    showStep(currentStep + 1);
  };

  window.prevStep = function (targetStep) {
    showStep(targetStep);
  };

  // Preselect a service from links such as ?service=Free%20Web%20Audit.
  //
  // The audit deep link used to call showStep(2) so the preselection was
  // visible straight away, but step 2 is the inquiry step: that dropped
  // the visitor past step 1, where their name, email and website URL are
  // collected, and left them to work out that they had to press Back.
  // Everyone starts on step 1 now, and the preselection is confirmed in
  // place by the note at the top of that step.
  const requestedService = new URLSearchParams(window.location.search).get('service');

  if (requestedService && serviceSelect) {
    const normalizedService = requestedService.trim().toLowerCase();
    const matchingOption = Array.from(serviceSelect.options).find(
      (option) => option.value.trim().toLowerCase() === normalizedService
    );

    if (matchingOption) {
      serviceSelect.value = matchingOption.value;

      if (preselectedNote) {
        preselectedNote.textContent =
          'Your details first. ' +
          matchingOption.textContent.trim() +
          ' is already selected for you on step 2.';
        preselectedNote.hidden = false;
      }

      if (normalizedService === 'free web audit') {
        trackEvent('audit_flow_start', { service_type: matchingOption.value });
      }
    }
  }

  syncWebsiteRequirement();
  syncFormIntro();
  if (serviceSelect) {
    serviceSelect.addEventListener('change', function () {
      syncWebsiteRequirement();
      syncFormIntro();
    });
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (goToFirstInvalidField()) {
      return;
    }

    // Honeypot check
    const honey = form.querySelector('input[name="company_website"]');
    if (honey && honey.value.trim() !== '') {
      console.warn('Honeypot triggered. Submission blocked.');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';

    if (statusMessage) {
      statusMessage.textContent = '';
      statusMessage.classList.remove('form-status-error', 'form-status-success');
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    form.setAttribute('aria-busy', 'true');

    // Collect form data
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://hook.us2.make.com/mw8kpkfkzarglrhqsk4ynuw7swg5p3ao', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Make-ApiKey": "dobiecore_audit_expo_2026"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Make webhook failed with status ${response.status}`);
      }

      trackEvent('generate_lead', { service_type: payload['request-type'] });

      form.reset();
      syncWebsiteRequirement();
      syncFormIntro();
      showStep(1);

      if (statusMessage) {
        statusMessage.textContent = 'Thanks! Your request has been sent. We will be in touch within 24 hours.';
        statusMessage.classList.add('form-status-success');
      }
    } catch (error) {
      console.error('Form submission error:', error);

      if (statusMessage) {
        statusMessage.textContent = 'Something went wrong while sending your request. Please try again or email melanie.brown@bluedobiedev.com.';
        statusMessage.classList.add('form-status-error');
      } else {
        alert('Something went wrong. Please try again later.');
      }
    } finally {
      form.removeAttribute('aria-busy');

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});

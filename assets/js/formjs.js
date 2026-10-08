document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('multiForm');
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const serviceSelect = form.querySelector('select[name="request-type"]');
  const websiteInput = form.querySelector('input[name="website"]');
  const statusMessage = form.querySelector('#form-status');
  const preselectedNote = form.querySelector('#form-preselected');
  const formIntro = document.getElementById('form-intro');

  const fieldsContainer = form.querySelector('fieldset');
  let submitting = false;
  form.noValidate = true; // Reveal the correct step before reporting native validation.

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
    const label = form.querySelector('label[for="contact-website"]');
    if (label) label.textContent = auditSelected ? 'Website (required for a free web audit)' : 'Website (optional)';
    websiteInput.placeholder = auditSelected
      ? 'Website URL (required for a free web audit)'
      : 'Website (if applicable)';
  }

  function showStep(stepNumber, moveFocus = true) {
    const targetStep = form.querySelector(`#step${stepNumber}`);
    if (!targetStep) return;
    steps.forEach(step => {
      const active = step === targetStep;
      step.classList.toggle('active', active);
      step.hidden = !active;
    });
    if (moveFocus) targetStep.querySelector('h3')?.focus();
  }

  function setStatus(message, state = '') {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.classList.toggle('form-status-error', state === 'error');
    statusMessage.classList.toggle('form-status-success', state === 'success');
  }

  function firstInvalid(container) {
    for (const field of container.querySelectorAll('input, select, textarea')) {
      if (field.required && field.type !== 'hidden') {
        field.setCustomValidity(field.value.trim() ? '' : 'Please complete this required field.');
      }
      if (!field.checkValidity()) return field;
    }
    return null;
  }

  function reportField(field) {
    const step = field.closest('.form-step');
    if (step) showStep(Number(step.id.replace('step', '')), false);
    field.setAttribute('aria-invalid', 'true');
    const label = field.labels?.[0]?.textContent || 'This field';
    setStatus(label + ': ' + field.validationMessage, 'error');
    field.focus();
    field.reportValidity();
  }

  function validateStep(stepNumber) {
    const step = form.querySelector(`#step${stepNumber}`);
    if (!step) return false;
    const invalid = firstInvalid(step);
    if (invalid) { reportField(invalid); return false; }
    setStatus('');
    return true;
  }

  function goToFirstInvalidField() {
    const invalid = firstInvalid(form);
    if (!invalid) return false;
    reportField(invalid);
    return true;
  }

  form.addEventListener('input', event => {
    if (typeof event.target.setCustomValidity !== 'function') return;
    event.target.setCustomValidity('');
    event.target.removeAttribute('aria-invalid');
    if (statusMessage?.classList.contains('form-status-error')) setStatus('');
  });

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
    if (submitting || !validateStep(currentStep)) return;

    if (currentStep === 2 && isAuditRequest() && websiteInput && !websiteInput.checkValidity()) {
      reportField(websiteInput);
      return;
    }

    showStep(currentStep + 1);
  };

  window.prevStep = function (targetStep) {
    if (!submitting) showStep(targetStep);
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
    const aliases = { 'logo-sprint': 'Logo Design', 'logo-sprint-basic': 'Logo Design', 'logo-sprint-pro': 'Logo Design' };
    const requested = requestedService.trim().toLowerCase();
    const normalizedService = (aliases[requested] || requested).toLowerCase();
    const summary = form.querySelector('[name=summary]');
    if (summary && !summary.value && /^logo-sprint-(basic|pro)$/.test(requested)) {
      summary.value = requested.endsWith('basic') ? 'Logo Sprint Basic inquiry' : 'Logo Sprint Pro inquiry';
    }
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
    if (submitting) return;

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

    const payload = Object.fromEntries(new FormData(form).entries());
    submitting = true;
    setStatus('Sending your request…');
    if (fieldsContainer) fieldsContainer.disabled = true;
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Sending…'; }
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('https://hook.us2.make.com/mw8kpkfkzarglrhqsk4ynuw7swg5p3ao', {
        signal: controller.signal,
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
      showStep(1, false);
      if (preselectedNote) preselectedNote.hidden = true;

      setStatus('Thanks! Your request has been sent. We will be in touch within 24 hours.', 'success');
    } catch (error) {
      // A timeout/network error cannot prove whether the server received the request.
      setStatus('We could not confirm that your request was sent. It may have arrived. Before sending again, email melanie.brown@bluedobiedev.com or call 270-388-3535. Your details are still here.', 'error');
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      if (fieldsContainer) fieldsContainer.disabled = false;
      form.removeAttribute('aria-busy');
      statusMessage?.focus();

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
  showStep(1, false);
  if (fieldsContainer) fieldsContainer.disabled = false;
  const unavailable = document.getElementById('form-unavailable');
  if (unavailable) unavailable.hidden = true;

});

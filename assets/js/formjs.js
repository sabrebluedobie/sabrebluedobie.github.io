document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('multiForm');
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const serviceSelect = form.querySelector('select[name="request-type"]');
  const websiteInput = form.querySelector('input[name="website"]');
  const statusMessage = form.querySelector('#form-status');

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

  // A deep link (?service=Free Web Audit) can land the visitor on step 2
  // directly, which can leave step 1's required fields empty and hidden.
  // A browser can't show a validation bubble for a display:none field, so
  // form.reportValidity() would silently fail in that case. Walk every
  // field in DOM order instead, and jump to whichever step holds the
  // first invalid one before reporting it.
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
    try {
      if (typeof gtag === 'function') {
        gtag('event', name, Object.assign({}, extraParams, getUtmParams()));
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
  const requestedService = new URLSearchParams(window.location.search).get('service');

  if (requestedService && serviceSelect) {
    const normalizedService = requestedService.trim().toLowerCase();
    const matchingOption = Array.from(serviceSelect.options).find(
      (option) => option.value.trim().toLowerCase() === normalizedService
    );

    if (matchingOption) {
      serviceSelect.value = matchingOption.value;

      // Only the Free Web Audit deep link jumps straight to step 2 so the
      // preselection is visibly confirmed immediately. Other ?service=
      // values keep the existing behavior (preselected, but step 1 first).
      if (normalizedService === 'free web audit') {
        showStep(2);
        trackEvent('audit_flow_start', { service_type: matchingOption.value });
      }
    }
  }

  syncWebsiteRequirement();
  if (serviceSelect) {
    serviceSelect.addEventListener('change', syncWebsiteRequirement);
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

      if (payload['request-type'] === 'Free Web Audit') {
        trackEvent('audit_form_submit', { service_type: payload['request-type'] });
      }

      form.reset();
      syncWebsiteRequirement();
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

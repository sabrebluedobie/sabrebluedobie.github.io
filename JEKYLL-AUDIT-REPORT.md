# Jekyll vs Standalone HTML Audit Report
**Generated:** October 12, 2025  
**Repository:** sabrebluedobie.github.io

## Summary
This audit identifies which pages are using Jekyll layouts (with front matter) versus standalone HTML files.

---

## ✅ JEKYLL PAGES (Using Layouts)

These pages have YAML front matter and use Jekyll layouts:

### Core Site Pages
- **index.html** - Uses `layout: default-shared`
- **about.html** - Uses `layout: default-shared`  
- **contact.html** - Uses `layout: default-shared`
- **services.html** - Uses `layout: default-shared`
- **our-portfolio.html** - Uses `layout: default-shared` ✅ (Converted 10/11/25)

---

## ❌ STANDALONE HTML PAGES TO CONVERT

### High Priority (Active/Visible Pages)
Convert these first as they're actively linked from main navigation:

1. **meet-sabre.html** - Most visible, linked from nav dropdown
2. **blog-home.html** - Blog landing page (if still active)
3. **FAQ.html** - Support page

### Medium Priority (Secondary Pages)
4. **privacy.html** - Legal page
5. **business-links.html** - Resource page

### Low Priority (Utility/Rarely Used)
- **404.html** - Error page
- **401.html** - Error page  
- **access-denied.html** - Error page
- **thank-you.html** - Form thank you
- **order-confirmation.html** - Order confirmation

---

## 🗑️ PAGES TO DELETE (Per user request)

### Newsletter Pages (No longer needed)
- newsletter-1.html
- newsletter-2.html
- newsletter-3.html
- newsletters.html
- gazette-waitlist.html
- gazette-thankyou.html
- detail_monthly-newsletter.html

---

## 📂 PAGES THAT NEED REVIEW

### Product/Service Directories
Need to check individual files in these directories:
- **captioncraft/** (directory)
- **dobiecore/** (directory)
- **gazette/** (directory - keep gazette.html, delete newsletter pages)
- **KidGames/** (directory)

### Blog Pages (Need to confirm if active)
- blog-home.html
- blog-details-2.html
- blogpost1.html
- blogpost2.html
- blogpost3.html
- blogpost4.html

### Marketing/Landing Pages (Review for current use)
- landing-page.html
- logo-sprint-landing.html
- mascot-builder.html
- league-setup.html
- referral-page.html
- sales.html

### Form/Utility Pages (Review for current use)
- contact-new.html (duplicate of contact.html?)
- contact-new-simple.html (duplicate?)
- contact-final.html (duplicate?)
- form.html
- log-in.html
- sign-up.html
- reset-password.html
- update-password.html
- user-account.html

### Detail/Info Pages (Review for current use)
- detail_post.html
- detail_sku.html
- gazette.html (keep as Jekyll)

### Other Pages to Review
- our-portfolio-new.html (duplicate of our-portfolio.html?)
- services-new.html (duplicate of services.html?)
- quickspin.html
- resources.html
- sucuri.html
- bluedobie-developing-terms-and-conditions.html

---

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1: Convert High Priority Pages
1. **meet-sabre.html** - Start here (most important)
2. **FAQ.html**
3. **privacy.html**

### Phase 2: Clean Up & Delete
4. Delete all newsletter pages
5. Delete duplicate pages (contact-new, services-new, etc.)
6. Archive or delete unused marketing pages

### Phase 3: Product Pages
7. Review and convert active product pages (captioncraft, dobiecore, etc.)
8. Convert or delete blog pages based on usage

### Phase 4: Utility Pages
9. Convert error pages (404, 401)
10. Convert form confirmation pages

---

## 📋 CONVERSION TEMPLATE

For each page to convert:

```markdown
### [PAGE NAME]

**Current State:** Standalone HTML  
**Target Layout:** `default-shared`  
**Conversion Steps:**
1. [ ] Extract content between `<body>` tags
2. [ ] Remove `<!DOCTYPE>`, `<html>`, `<head>`, and `<body>` tags
3. [ ] Add Jekyll front matter:
   ```yaml
   ---
   layout: default-shared
   title: [Page Title]
   description: [Meta Description]
   permalink: /[filename].html
   extra_css:
     - /css/[page-specific].css
   ---
   ```
4. [ ] Create page-specific CSS file if needed
5. [ ] Test page rendering locally
6. [ ] Commit changes
7. [ ] Verify on live site
```

---

## 📝 NOTES

- All Jekyll pages use the `default-shared` layout
- Extra CSS can be included via `extra_css` front matter array
- The `default-shared` layout handles nav, footer, and global styles
- Newsletter pages confirmed for deletion
- Portfolio page successfully converted on 10/11/25

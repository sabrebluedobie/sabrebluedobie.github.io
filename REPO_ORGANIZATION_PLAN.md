# Bluedobie Repository Organization Plan
**Created:** October 4, 2025  
**Status:** Planning Phase - DO NOT EXECUTE WITHOUT REVIEW

---

## 🎯 Purpose
This document outlines recommended changes to organize the sabrebluedobie.github.io repository. **NO FILES WILL BE MOVED until you're ready to update links.**

---

## 🚨 Current Issues

### Critical (Fix First)
1. **Git Repository Corruption**
   - Multiple index files in `.git/` folder (index, index 2, index 3, etc.)
   - Lock files present (index 8.lock, index 9.lock)
   - Indicates merge conflicts and Git crashes
   - **Impact:** Unstable version control, potential data loss
   - **Solution:** Clean Git reset (see Git Cleanup section below)

2. **73 Unresolved Merge Conflicts** (from Notion tasks)
   - Blocks ability to commit/push changes safely
   - **Must resolve before any reorganization**

### Moderate (Organize Later)
3. **31 HTML Files at Root Level**
   - Hard to find specific pages
   - Confusing for maintenance
   - No clear structure

4. **Duplicate Folders**
   - `Bluedobie--Dialogues/` (double dash)
   - `Bluedobie-Dialogues/` (single dash)
   - **Decision needed:** Which is active?

5. **Test/Old Files Cluttering Root**
   - `about-old.html`, `index-old.html`
   - `contact-test-*.html` files
   - `local.html`, `blank.html`

---

## 📋 Current File Inventory

### Root Level HTML Files (31 total)
```
Main Pages:
- index.html (homepage)
- about.html
- services.html
- contact.html
- our-portfolio.html

Duplicate/Version Files:
- about-old.html
- index-old.html
- services-new.html
- our-portfolio-new.html
- contact-new.html
- contact-final.html
- contact-new-simple.html
- landing-page.html
- landing-page-original.html

Test Files:
- contact-test-nocaptcha.html
- contact-test-simple.html
- local.html
- blank.html

Product/Service Pages:
- logo-sprint-landing.html
- quickspin.html
- mascot-builder.html
- league-setup.html

Newsletter/Blog:
- newsletters.html
- newsletter-1.html
- newsletter-2.html
- newsletter-3.html
- blog-home.html
- blogpost1.html
- blogpost2.html
- blogpost3.html
- blogpost4.html
- blog-details-2.html

Gazette Related:
- gazette.html
- gazette-waitlist.html
- gazette-thankyou.html

Other:
- meet-sabre.html
- sales.html
- resources.html
- business-links.html
- FAQ.html
- referral-page.html
- thank-you.html
- order-confirmation.html
- detail_monthly-newsletter.html
- detail_post.html
- detail_sku.html
- sign-up.html
- log-in.html
- reset-password.html
- update-password.html
- user-account.html
- form.html
- sucuri.html
- tags.html
- access-denied.html
- privacy.html
- bluedobie-developing-terms-and-conditions.html

Error Pages:
- 401.html
- 404.html
```

### Project Folders
```
✅ Well Organized:
- gazette/ (4 .md files)
- captioncraft/ (HTML, CSS, JS)
- _posts/ (Jekyll blog posts)
- _layouts/ (templates)
- _includes/ (components)
- assets/, css/, js/, images/, videos/

🟡 Needs Review:
- Bluedobie--Dialogues/ (12 HTML files)
- Bluedobie-Dialogues/ (12 HTML files) 
- blog/ (structure unclear)
- documents/
- dobiecore/
- poll-backend/
- template/

📁 Standard:
- .github/ (GitHub workflows)
- .well-known/ (domain verification)
- .vscode/ (editor config)
- _site/ (Jekyll build output)
```

### Utility/Dev Files at Root
```
- extract_urls.py
- list_sprite.py
- serp_summary.xlsx
- urls.txt
- b6133b0e4710441bbaa05d61a2aa424f.txt (what is this?)
```

---

## 🎯 Recommended Actions

### Phase 1: Git Cleanup (PRIORITY)
**DO THIS FIRST - Doesn't move any files**

#### Steps:
1. **Backup Current State**
   ```bash
   # Create a backup branch
   git branch backup-before-cleanup
   
   # Or zip the entire folder as backup
   # (do this outside Git)
   ```

2. **Check for Uncommitted Work**
   ```bash
   git status
   # If you have changes you want to keep, commit them first
   ```

3. **Nuclear Option: Fresh Git Start**
   ```bash
   # Navigate to repo
   cd /Users/melaniebrown/Documents/sabrebluedobie.github.io
   
   # Backup the .git folder (just in case)
   mv .git .git-backup
   
   # Initialize fresh Git
   git init
   git add .
   git commit -m "Fresh start - cleaned up Git repository"
   
   # Reconnect to GitHub (get URL from GitHub repo settings)
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main --force
   ```

4. **Alternative: Try to Salvage**
   ```bash
   # Remove duplicate index files
   cd .git
   rm "index 2" "index 3" "index 4" "index 5" "index 6" "index 7" "index 8" "index 9"
   rm "index(1)" "index(2)"
   rm "index 8.lock" "index 9.lock"
   rm "ORIG_HEAD(1)"
   
   # Reset to clean state
   cd ..
   git reset --hard HEAD
   git clean -fd
   ```

**RISK ASSESSMENT:**
- ✅ Low risk: Doesn't touch your actual website files
- ⚠️ Medium risk: Loses commit history (if using nuclear option)
- 🛡️ Mitigated by: Backup branch/folder before starting

---

### Phase 2: Identify & Document Duplicates
**Research only - no changes yet**

#### Questions to Answer:
1. **Bluedobie Dialogues:**
   - Which folder is active: `Bluedobie--Dialogues/` or `Bluedobie-Dialogues/`?
   - Are they identical or different content?
   - Which one does _config.yml reference?

2. **Contact Pages:**
   - Which is live: contact.html, contact-new.html, or contact-final.html?
   - Can we delete the others?

3. **Services/Portfolio:**
   - Are `-new` versions the current ones?
   - Can we delete old versions?

4. **Test Files:**
   - Are any test files still needed?
   - Can we delete: contact-test-*.html, local.html, blank.html?

#### How to Check:
```bash
# Find which files are linked to from index.html
grep -r "href=" index.html

# Search all HTML files for internal links
grep -r "\.html" *.html | grep href

# Check what _config.yml references
cat _config.yml
```

---

### Phase 3: Safe Deletions (When Ready)
**Only delete files confirmed as unused**

#### Candidates for Deletion:
```
Low Risk (Probably Safe):
- blank.html
- local.html
- contact-test-nocaptcha.html
- contact-test-simple.html

Medium Risk (Check Links First):
- about-old.html
- index-old.html
- landing-page-original.html

To Archive (Move to /archive folder):
- extract_urls.py
- list_sprite.py
- serp_summary.xlsx
- urls.txt
```

#### Before Deleting:
1. Search for any references to the file:
   ```bash
   grep -r "filename.html" .
   ```
2. Check Google Analytics (if set up) for traffic to that page
3. Make a Git commit before deletion so you can recover if needed

---

### Phase 4: Future Reorganization (DO LAST)
**Only after Phases 1-3 complete**

#### Proposed Structure:
```
sabrebluedobie.github.io/
├── index.html ✅ (stays at root)
├── _config.yml ✅
├── _includes/ ✅
├── _layouts/ ✅
├── _posts/ ✅ (Bluedobie Dialogues blog)
│
├── projects/ (NEW - when ready to move)
│   ├── gazette/
│   ├── captioncraft/
│   ├── logo-sprint/
│   └── quickspin/
│
├── pages/ (NEW - when ready to move)
│   ├── about/
│   ├── services/
│   ├── portfolio/
│   ├── contact/
│   └── legal/
│
├── newsletters/ (NEW - consolidate newsletter files)
│
├── auth/ (NEW - user account pages)
│   ├── sign-up.html
│   ├── log-in.html
│   ├── reset-password.html
│   └── user-account.html
│
├── assets/ ✅
├── css/ ✅
├── js/ ✅
├── images/ ✅
├── videos/ ✅
│
├── archive/ (NEW)
│   ├── old-versions/
│   └── tests/
│
└── dev-tools/ (NEW)
    └── scripts/
```

#### Migration Process (When Moving Files):
1. **Pick ONE file to move as a test**
2. **Update ALL links to that file**
3. **Test thoroughly**
4. **Commit**
5. **Repeat for next file**

**DO NOT move multiple files at once - you'll lose track of what broke.**

---

## 🔗 Link Update Strategy

### When You're Ready to Move Files:

#### Step 1: Find All References
```bash
# Find all files linking to the file you want to move
grep -r "old-location.html" .

# Or use this Python script to generate a report
python3 << 'EOF'
import os
import re

target_file = "contact.html"  # File you want to move
references = []

for root, dirs, files in os.walk('.'):
    # Skip .git and _site folders
    if '.git' in root or '_site' in root:
        continue
    
    for file in files:
        if file.endswith(('.html', '.md', '.css', '.js')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if target_file in content:
                        # Find the actual line numbers
                        lines = content.split('\n')
                        for i, line in enumerate(lines, 1):
                            if target_file in line:
                                references.append(f"{filepath}:{i} - {line.strip()}")
            except:
                pass

print(f"References to {target_file}:")
for ref in references:
    print(ref)
EOF
```

#### Step 2: Update Links
- Use find-and-replace in your editor
- Test each page manually
- Use relative paths (./pages/contact.html) not absolute (/pages/contact.html)

#### Step 3: Update Redirects
Add to your HTML files or .htaccess:
```html
<!-- In old location file -->
<meta http-equiv="refresh" content="0; url=/new-location.html">
```

---

## ✅ Action Checklist

### Immediate (This Week)
- [ ] Backup entire repository (zip file)
- [ ] Create backup Git branch
- [ ] Fix Git repository (.git folder cleanup)
- [ ] Commit all current work
- [ ] Test that Git push/pull works

### Short Term (Next 2 Weeks)
- [ ] Identify which Bluedobie-Dialogues folder is active
- [ ] Document which contact/services/portfolio file is live
- [ ] List all files that can be safely deleted
- [ ] Search for references to files marked for deletion
- [ ] Create /archive folder and move deprecated files

### Long Term (When You Have Time)
- [ ] Plan file reorganization
- [ ] Create new folder structure
- [ ] Move files ONE at a time
- [ ] Update links after each move
- [ ] Test thoroughly after each change

---

## 🚫 What NOT to Do

❌ Don't move multiple files at once  
❌ Don't delete files without checking for links  
❌ Don't reorganize while Git is broken  
❌ Don't force push without a backup  
❌ Don't rename folders that Jekyll uses (_posts, _layouts, etc.)  
❌ Don't touch the Gridiron-Gazette repo (it's separate - good!)  

---

## 📝 Notes

### Questions to Answer Later:
1. What is `b6133b0e4710441bbaa05d61a2aa424f.txt`?
2. What's in `dobiecore/` folder?
3. Is `poll-backend/` active or deprecated?
4. What's the difference between `blog/` and `_posts/`?

### Related Notion Tasks:
- Fix responsive issues on homepage grid
- Resolve Git merge conflicts (73 conflicted files)
- Clean up _config.yml and layouts
- Ensure favicon.ico, video-poster.jpg are replaced
- Add project separation: Bluedobie Dialogues, Gridiron Gazette, Sentinel Health

---

## 🆘 Emergency Recovery

If something breaks:

### Restore from Backup
```bash
# If you have .git-backup folder
rm -rf .git
mv .git-backup .git

# If you have backup branch
git checkout backup-before-cleanup

# If you have zip file
# Unzip to a new location and copy files back
```

### Check GitHub for Last Good Version
```bash
git fetch origin
git reset --hard origin/main
```

---

## 📞 Need Help?

Before making major changes:
1. Commit current work
2. Create a backup
3. Test on a single file first
4. Ask for help if unsure

**Remember:** It's easier to prevent problems than fix them!

---

*End of Document*

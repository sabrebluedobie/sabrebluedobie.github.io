---
layout: default-shared
title: "Meta Publishing Core — Application Privacy Policy"
description: "Privacy policy for Meta Publishing Core, the internal social publishing application operated by Bluedobie Developing."
canonical: "https://www.bluedobiedev.com/app-privacy"
permalink: /app-privacy.html
sitemap: false
extra_css:
  - /assets/css/pages/privacy.css
---


<div class="privacy-hero">
  <h1>Application Privacy Policy</h1>
  <p>Meta Publishing Core</p>
</div>

<div class="privacy-content">
  <p class="privacy-effective-date"><strong>Effective Date:</strong> November 2, 2026</p>

  <p><strong>Application:</strong> Meta Publishing Core</p>
  <p><strong>Type:</strong> Internal business tool, not a public product</p>

  <p>This policy covers the Meta Publishing Core application only. It is separate from and additional to the <a href="/privacy.html">privacy policy for www.bluedobiedev.com</a>, which covers visitors to the website.</p>

  <h2>Who operates this application</h2>
  <p>Meta Publishing Core is built and operated by Bluedobie Developing, LLC, of Princeton, Kentucky. Contact:</p>
  <ul>
    <li>Email: melanie.brown@bluedobiedev.com</li>
    <li>Phone: (270) 388-3535</li>
  </ul>

  <p>The application is <strong>not a public product</strong>. It has no sign-up, no customer accounts, and no users other than its operator. It is used by one person, on one computer, to publish content to social media accounts that we own and administer ourselves.</p>

  <h2>Whose data the application handles</h2>
  <p>The application handles data about <strong>our own organization's accounts only</strong>:</p>
  <ul>
    <li>Our LinkedIn personal profile, LinkedIn Page, and LinkedIn showcase page</li>
    <li>Our Facebook Pages</li>
    <li>Our Instagram Business accounts</li>
  </ul>
  <p>The application does <strong>not</strong> access, collect, store, or process personal data about any other member of LinkedIn, Facebook, or Instagram. It does not read follower lists, connection lists, member profiles, comment authors, direct messages, or audience demographics. It does not identify individuals.</p>

  <h2>What the application accesses and stores</h2>

  <h3>Account information</h3>
  <p>For each account we administer: the account's platform-assigned identifier, display name, username, account type, the permissions our access has been granted, and the time the account was last checked. This is used to address the correct account when publishing and to tell the operator when access needs renewing.</p>

  <h3>Content we create</h3>
  <p>Post captions, alt text, internal titles and topics, destination links, and scheduling times. This is our own content, not data obtained from any platform.</p>

  <h3>Images and video we upload</h3>
  <p>Media files supplied from our own device, together with their dimensions, file size, format, and a checksum. Alt text we write is stored alongside them.</p>

  <h3>Publishing records</h3>
  <p>For each post published: the platform's post identifier, the published URL, the time of publication, and the outcome of each attempt including any error the platform returned. This record exists so the operator can confirm a post actually published and never publishes the same content twice.</p>

  <h3>Performance figures</h3>
  <p>Aggregate, non-identifying statistics the platforms report about our own posts and accounts &mdash; counts such as views, reach, impressions, likes, comments, shares, saves, and clicks. These are <strong>numbers only</strong>. The application does not retrieve, and cannot retrieve, the identity of any person who viewed, liked, or commented on a post.</p>

  <h2>Access credentials</h2>
  <p>Access tokens issued to us by a platform are held in a local environment file on the operator's computer, readable only by the operator's own user account.</p>
  <p><strong>Tokens are never written to the application's database.</strong> The database stores only the <em>name</em> of the environment variable that holds a given account's token &mdash; a pointer, not a credential. Tokens are never written to logs, never shown in the application's interface, and never transmitted anywhere other than to the platform that issued them.</p>
  <p>Internal approval links are stored as a one-way hash, not in their original form, and expire 72 hours after they are created.</p>

  <h2>Where data is stored, and who can reach it</h2>
  <p>The application runs entirely on one computer operated by us. Its database is PostgreSQL listening on that computer's loopback interface only; the database port is not exposed to any network. The application's web interface is restricted to the local machine and is not published to the internet.</p>
  <p>Two exceptions involve services outside that computer, and both are listed below.</p>

  <h2>Third parties</h2>
  <p>We do not sell, rent, share, or disclose data to anyone for advertising, analytics, profiling, or any commercial purpose. The application contains no advertising, no tracking, and no third-party analytics.</p>
  <p>Two service providers are necessarily involved:</p>
  <ul>
    <li><strong>Cloudflare R2</strong> &mdash; Instagram requires that images be fetched from a publicly reachable address rather than uploaded directly. Images destined for Instagram are therefore uploaded to a Cloudflare R2 bucket served from our own subdomain, where they are <strong>publicly accessible to anyone holding the URL</strong> for as long as they remain there. Only images we have chosen to publish are placed there. No account data, credentials, captions, or statistics are stored in that bucket. Where a platform permits direct upload &mdash; as Facebook and LinkedIn both do &mdash; no public hosting is used.</li>
    <li><strong>Apple iCloud Drive</strong> &mdash; verified nightly database backups are mirrored to our own iCloud Drive so that a hardware failure does not destroy the publishing record. These backups contain the database as described above. They do not contain access tokens, which are not in the database.</li>
  </ul>

  <h2>How long data is kept</h2>
  <p>Content, publishing records, and performance figures are kept for as long as the application is in use, because their purpose is to be a durable record of what was published and how it performed. Database backups are pruned on a retention schedule set by the operator. Media files remain until deleted by the operator.</p>

  <h2>Deletion and withdrawal of access</h2>
  <p>Because the data concerns our own accounts and our own content, there are no third-party data subjects to make a request. The operator may at any time:</p>
  <ul>
    <li>Disconnect an account, which removes its stored account record;</li>
    <li>Revoke the application's access from within LinkedIn, Facebook, or Instagram directly, which immediately ends the application's ability to act;</li>
    <li>Delete content items, media files, publishing records, or the database in full; and</li>
    <li>Remove published media from the public media bucket.</li>
  </ul>
  <p>Revoking access at the platform is effective immediately and does not depend on any action by us.</p>

  <h2>Children</h2>
  <p>The application is an internal business tool. It is not directed at children and does not knowingly handle any data concerning them.</p>

  <h2>Changes to this policy</h2>
  <p>If the application's handling of data changes, this policy will be updated and the effective date above revised. Should the application ever be opened to people other than its operator, this policy will be rewritten before that happens, because the statements about sole operation and the absence of third-party data subjects would no longer be true.</p>

  <h2>Contact</h2>
  <p>Questions about this policy or about the application's handling of data:</p>
  <ul>
    <li>Email: melanie.brown@bluedobiedev.com</li>
    <li>Phone: (270) 388-3535</li>
  </ul>
  <p>Bluedobie Developing, LLC &mdash; Princeton, Kentucky</p>
</div>

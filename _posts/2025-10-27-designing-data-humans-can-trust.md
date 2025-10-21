---
layout: blog
title: "Designing Data Humans Can Trust: The Missing Layer in AI Strategy"
date: 2025-10-27
author: "Melanie Brown"
excerpt: "AI trust starts with human-readable data. Learn how design clarity and traceability prevent errors and build accessible, explainable systems."
image: /assets/images/dialogues/data-trust-hero.png
tags: [artificial intelligence, data strategy, web development, explainable AI]
toc: true
---

## When AI Gets It Wrong

In 2017, internal documents revealed that IBM's Watson for Oncology—a cutting-edge artificial intelligence system designed to recommend cancer treatments—had provided "multiple examples of unsafe and incorrect treatment recommendations."[^1] In one documented case, the system recommended administering bevacizumab, a chemotherapy drug with a "black box" FDA warning against use in patients with severe bleeding, to a 65-year-old lung cancer patient who was actively experiencing severe bleeding.[^2] The error wasn't a software glitch. Watson was working exactly as designed. The problem lay in how the system had been trained: engineers used "synthetic" or hypothetical patient cases created by a small group of specialists, rather than real patient data or established medical guidelines.[^3] As one physician at Jupiter Hospital in Florida told IBM executives: "This product is a piece of s---. We bought it for marketing and with hopes that you would achieve the vision. We can't use it for most cases."[^4]

Fortunately, no patients were harmed—oncologists caught the errors before implementing Watson's recommendations.[^5] But the incident exposed a fundamental truth about AI systems: **they're only as reliable as the data architecture supporting them.**

This isn't a story about broken technology. It's a story about broken **data design**.

---

## The Problem: Data for Machines, Not for Minds

I use AI every day. It helps me organize complex projects, draft technical content, analyze client data, and even manage my own cognitive load. In other words, AI is **assistive technology**—a tool that supports the way I think, not a replacement for it.

That's why I notice quickly when a system hides its reasoning. If I can't understand why an AI made a suggestion, I can't trust it enough to act on it.

Businesses across every industry are racing to "AI-enable" their operations. Chatbots answer customer questions. Algorithms screen résumés. Predictive systems set inventory levels.  
But most of these systems run on data pipelines designed for **machine efficiency**, not **human comprehension**.

- Field names are cryptic (`usr_stat_7`) instead of meaningful (`customer_engagement_score`).
- Provenance is missing—no one knows where the numbers came from.
- Decisions can't be explained without digging into raw logs or proprietary code.

That's not artificial intelligence. That's artificial **opacity**.

**Here's what this looks like in practice:**

- A manager sees an AI-generated forecast but can't verify how it was calculated.  
- A loan officer gets a credit risk score but no explanation for the denial.  
- A web developer sees a performance "anomaly" flag but has no clue what data triggered it.

These breakdowns don't happen because people are resisting technology. They happen because the technology resists people.

Treating data as *fuel* for AI misses its actual purpose: **shared context** between human and machine reasoning.  
Without that context, bias hides, errors multiply, and oversight becomes impossible.

According to IBM's 2024 Global AI Adoption Index, *73% of executives say they don't understand how their AI systems make decisions.*  
And yet, companies still spend nearly *80% of their AI budgets on data preparation—and less than 20% on making that data comprehensible.*

That's the real crisis. AI doesn't just need more data—it needs better data design.

---

## The Solution: Accessible Data Design

Designing data for humans and machines isn't about adding more dashboards or prettier charts. It's about building information systems that **explain themselves**.

I break that into three pillars: **readability, traceability, and cognitive ease.**

### 1. Human Readability

If you can't read your data, you can't reason about it.

Readable data design mirrors how people think and talk about real-world concepts.  
That means:
- Using field names that mean something (`purchase_total` instead of `purch_amt_3`).
- Maintaining clear documentation of where data comes from and how it's used.
- Providing visual explanations, not just visualizations.

A dashboard that shows "Engagement dropped 15%" tells me *what* happened.  
A transparent data system tells me *why*—showing which variables influenced the decline and how heavily they were weighted.

Think of this as **information architecture for your data layer**.  
The same logic you'd apply to designing a website's navigation applies to designing a dataset: clear labeling, consistent hierarchy, predictable structure.

> **Pro tip:** Human-readable data is accessible data. For users who rely on AI to assist with cognitive processing, clarity isn't just nice—it's necessary.

---

### 2. Traceability

"Show your work."

Remember math class? You could use a calculator to get the answer, but you still had to show the steps. That wasn't busywork—it was accountability. Your teacher needed to see that you understood the process, not just that you got the right number. The calculator was your tool, but the reasoning was still yours to demonstrate.

AI is no different. The tool can do the heavy lifting, but humans still need to verify the logic.

Every dataset should be auditable—meaning you can trace any output back to the inputs that shaped it.  
That includes:
- **Version control** (think of it like "track changes" in Microsoft Word—a record of who edited what, when, and why)
- **Transformation logs** that record when data was cleaned, merged, or filtered  
- **Access records** that show who viewed or downloaded the data

These may sound like developer details, but they're trust mechanisms.

When I'm using AI to draft copy or analyze site data, I want to know where the insight came from. If it's pulling from an outdated source that would give incorrect information, I can catch and correct that before my name is on a project that goes out. If it's merging datasets incorrectly, I can fix it.

Without traceability, you get **magic without accountability**.  
And magic might sell demos, but it doesn't build reliable systems. Instead, you're stuck in a loop: your project works great, then it breaks, and you can't figure out why. Without accountability, you can't keep your projects moving in the right direction.

In cognitive terms, traceability reduces what's called "verification friction"—the effort it takes to confirm whether a claim is true.  
Less friction means more trust, especially for users who depend on AI to structure or simplify complex information. This is ultimately very important for people with cognitive disabilities like brain fog, memory loss, or attention difficulties. When you can't rely on your own memory to recall how something was configured last week, being able to trace back through clear records becomes essential—not just convenient.

---

### 3. Cognitive Ease

Cognitive ease is about reducing the mental load required to understand or verify AI outputs.  
If using an AI tool feels like decoding a mystery, something's wrong with the design.

Good systems build in checkpoints instead of cognitive roadblocks:

- **Confidence indicators:** Show how sure the system is. "95% likely" and "60% likely" lead to very different human decisions.  
- **Explanation layers:** Summarize the top three factors influencing each output, with the option to drill deeper.  
- **Clear error states:** Don't just say "invalid input"—say *why* it's invalid and how to fix it.

When I use AI to prioritize client projects or audit content performance, I need a system that helps me verify reasoning in under two minutes.  
That speed matters not because I'm impatient, but because my focus and energy are finite resources. Accessible design respects that.

Here's a simple example: When I ask ChatGPT for specific technical details, it often responds with "please verify this information." That's not a weakness—it's exactly what trustworthy AI should do. It's telling me when confidence is lower and where I need to double-check. That single phrase does more for trust than false certainty ever could.

> **For many professionals who use AI as assistive technology, cognitive clarity is accessibility.**  
> The easier it is to verify, the more empowering the tool becomes.

---

## What This Looks Like in Practice

Here's a quick visual comparison:

**Bad Data Design**
```
usr_stat_7: 0.847
```

**Accessible Data Design**
```
user_confidence_score: 84.7%
(calculated from: login_frequency + task_completion_rate)
last_updated: 2025-10-21 by system_audit
```

That second example isn't just cleaner—it's verifiable, explainable, and accessible.  
It gives both the machine and the human the context they need to make reliable decisions.

---

## Real-World Application: Lessons from Web Development

In web development, we've learned that clarity scales better than cleverness.  
A well-structured site guides users intuitively through complex information.  
A well-structured dataset does the same for AI.

When I rebuild a client's database or CMS, I apply the same principles that make websites user-friendly:
- **Consistency**: Predictable naming and organization
- **Documentation**: Plain-language explanations of what each field does
- **Version control**: A clear record of changes over time

I'm currently working on a health tracking app suite where proper database naming isn't just good practice—it's essential. By ensuring all databases use clear, descriptive naming conventions from the start, repairing any issues becomes dramatically easier. When a bug appears or data needs updating, I don't have to decode cryptic abbreviations or guess what `usr_stat_7` means. Instead, `symptom_severity_score` tells me exactly what I'm looking at and how it should behave. This clarity cuts debugging time significantly and prevents cascading errors.

These practices overlap with modern **data governance** and **human-in-the-loop** systems—approaches that keep people involved in reviewing, adjusting, and improving AI behavior over time.

> The best AI systems borrow empathy from design and discipline from development.

---

## The Outcome: Trustworthy AI, Empowered Users

When businesses design for understanding, they get more than accuracy—they get **trust**.

AI systems built on transparent, explainable, human-centered data strategies:
- Earn confidence from teams who can verify recommendations  
- Catch bias and error earlier, before harm occurs  
- Increase adoption, because users feel safe engaging critically with the system  

Here's the real difference:

**Opaque AI:**  
> "The model says Project A is high priority."  
> (No context, no rationale, no trust.)

**Accessible AI:**  
> "Project A ranked higher due to approaching deadline and available resources. Confidence: 93%."  
> (Transparent, verifiable, actionable.)

Accessible data design transforms AI from a black box into a trusted collaborator.

> Data clarity isn't a technical luxury—it's the foundation of ethical, accessible AI.

---

## Where to Begin

Start small.

Pick one AI tool your business relies on and run a mini audit:

1. Can you identify where its data comes from?  
2. Can you explain how its outputs are calculated?  
3. Can a new team member understand its structure in 30 minutes or less?

If the answer is "no," you've found your first improvement opportunity.

Because if your team can't follow the reasoning, your AI can't explain itself—and unexplainable systems don't earn trust.

At Bluedobie Developing, we believe the best technology serves people, not the other way around. That's why every system we design—websites, dashboards, or AI workflows—starts with clarity and ends with confidence.

[Let's talk](/contact.html) about building data systems your users can understand, trust, and actually enjoy using.

---

## Notes

[^1]: Casey Ross and Ike Swetlitz, "IBM's Watson Supercomputer Recommended 'Unsafe and Incorrect' Cancer Treatments, Internal Documents Show," *STAT*, July 25, 2018, https://www.statnews.com/2018/07/25/ibm-watson-recommended-unsafe-incorrect-treatments/.

[^2]: "Report: IBM Watson Delivered 'Unsafe and Inaccurate' Cancer Recommendations," *MassDevice*, July 25, 2018, https://www.massdevice.com/report-ibm-watson-delivered-unsafe-and-inaccurate-cancer-recommendations/.

[^3]: Ross and Swetlitz, "IBM's Watson Supercomputer."

[^4]: Ross and Swetlitz, "IBM's Watson Supercomputer."

[^5]: "Artificial Intelligence Failure at IBM 'Watson for Oncology,'" The Case Centre, 2022, https://www.thecasecentre.org/products/view?id=182969.

---

## Bibliography

"Artificial Intelligence Failure at IBM 'Watson for Oncology.'" The Case Centre, 2022. https://www.thecasecentre.org/products/view?id=182969.

"Report: IBM Watson Delivered 'Unsafe and Inaccurate' Cancer Recommendations." *MassDevice*, July 25, 2018. https://www.massdevice.com/report-ibm-watson-delivered-unsafe-and-inaccurate-cancer-recommendations/.

Ross, Casey, and Ike Swetlitz. "IBM's Watson Supercomputer Recommended 'Unsafe and Incorrect' Cancer Treatments, Internal Documents Show." *STAT*, July 25, 2018. https://www.statnews.com/2018/07/25/ibm-watson-recommended-unsafe-incorrect-treatments/.

---

*Written by Melanie Brown, Bluedobie Developing — building accessible, human-centered tech across Kentucky, Missouri, Illinois, Indiana, and Tennessee.*

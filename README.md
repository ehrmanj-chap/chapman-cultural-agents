# Chapman Cultural Intelligence Agents

**This is the public-facing cultural intelligence website.** It is intended for visitors to explore Giulia's Italian cultural and business expertise and submit feedback.

For the **internal developer/evaluation lab for Giulia and Mei**, use [giulia-tester](https://github.com/ehrmanj-chap/giulia-tester). For the **AI Garage beginner student lessons**, use [Agentics Labs & Lectures](https://github.com/ehrmanj-chap/agentics_labs_lectures). These are three different projects.

## I just want to use the site

Use the public website link supplied by the AI Garage or Schmid Center team. The live public address should be confirmed by a maintainer before being added here. You do **not** need to install programming software or use GitHub to talk to the public agents.

## What lives where?

| Item | What it controls |
| --- | --- |
| [`index.html`](index.html) | **Current public website**: layout, text, links, embedded chat windows and feedback form |
| [`giulia-ai-transparency-notice.pdf`](giulia-ai-transparency-notice.pdf) | Transparency notice shown inside the website |
| [`site-icon.svg`](site-icon.svg) | Site favicon |
| `giulia_public_testing_updated.html` and `index_with_conversation_tip_near_dots_v2.html` | Older/alternate HTML snapshots. **Do not edit these expecting the main website to change.** |
| [`relevance-logging/`](relevance-logging/) | Supporting logging material; have a technical maintainer review before changing |

**Important:** This page embeds **Relevance AI** agents. Their personalities, source libraries, functionality, billing and access must be managed in the relevant **Relevance AI workspace**, not in this HTML repository or the separate Qwen-based `giulia-tester`. The feedback form sends submissions through **Formspree**. GitHub access by itself does not grant access to either service.

## For Kelsie and future student maintainers (no terminal needed)

### Change an ordinary line of site text

1. Sign in to GitHub with your **own account** and make sure you have repository **Write** or higher access.
2. Open [`index.html`](index.html) and select the pencil **Edit** control.
3. Change only the text you understand. Keep the surrounding HTML tags and embedded agent/form URLs intact.
4. Under **Commit changes**, choose **Create a new branch and start a pull request**.
5. Ask another maintainer to review the change. After approval, merge, then check the actual public site on desktop and phone.

For the quickest orientation, **`index.html` is the only main public webpage here**. Do not delete alternate versions or alter the feedback/transparency setup to tidy the file list.

### Change what Giulia knows or says

Open the project's **Relevance AI workspace** with an authorized account. Confirm the correct agent before editing prompts, curated sources or permissions. Run a real sample chat after changes. Do not paste secret API keys or student data into GitHub.

### Check feedback submissions

The form in `index.html` uses **Formspree**. Ask the current form owner to grant the club or faculty advisor access to the Formspree dashboard and confirm who receives feedback notifications. Editing this repository does not grant Formspree inbox access.

## Ownership and continuity

A robust handoff should have:
- **Kelsie:** administrator-level access to this GitHub repository and necessary editor/owner access in Relevance AI and Formspree.
- **Faculty advisor / designated backup:** a second accountable GitHub administrator and service backup, rather than relying on one student's account.
- **Research library:** the existing authorized Google Drive owners/editors; do not re-upload or publicize the research corpus just to transfer the website.
- **Everyone:** individual logins, no shared passwords, no raw tokens in code, issues, screenshots, email, or handoff documents.

For GitHub access, a repository administrator opens **Settings → Collaborators → Add people** and invites the student's GitHub account. On a personal-account repository, collaborator invitations may not offer fine-grained co-owner roles; for durable multiple-administrator access, a Chapman/club GitHub **organization** is the cleaner long-term destination. Confirm permissions before any migration.

## Before changing a live integration

- Verify the public website still displays both Giulia embeds.
- Verify questions actually receive answers (a visible iframe alone is not enough).
- Submit a *fictional* feedback example and check delivery **only with the authorized form owner**, avoiding sensitive information.
- Confirm the transparency/privacy notice reflects what the live embedded services actually collect.
- Keep the public Relevance AI frontend distinct from the experimental [internal Giulia/Mei lab](https://github.com/ehrmanj-chap/giulia-tester).

**This document is a maintainer map, not a claim that GitHub, Relevance AI or Formspree permissions have already been granted.**

# Toxic Confessions — Trackable Launch Links

Use the exact link assigned to each placement. The Toxic Confessions page stores `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`, then pushes funnel events to `window.dataLayer`.

The Podline recorder also instructs confessors to enter `alias / source / phone + YES (optional callback)` so source and callback intent stay attached to the actual submission.

## Instagram

- Bio: `https://toxicconfessions.co/?utm_source=instagram&utm_medium=bio&utm_campaign=tc_launch&utm_content=profile`
- Story link sticker: `https://toxicconfessions.co/?utm_source=instagram&utm_medium=story&utm_campaign=tc_launch&utm_content=confession_office_hours`
- Launch Reel: `https://toxicconfessions.co/?utm_source=instagram&utm_medium=reel&utm_campaign=tc_launch&utm_content=launch_reel`

## TikTok

- Bio: `https://toxicconfessions.co/?utm_source=tiktok&utm_medium=bio&utm_campaign=tc_launch&utm_content=profile`
- Launch video: `https://toxicconfessions.co/?utm_source=tiktok&utm_medium=video&utm_campaign=tc_launch&utm_content=launch_video`

## Facebook

- Page bio/button: `https://toxicconfessions.co/?utm_source=facebook&utm_medium=bio&utm_campaign=tc_launch&utm_content=page`
- Pinned comment: `https://toxicconfessions.co/?utm_source=facebook&utm_medium=pinned_comment&utm_campaign=tc_launch&utm_content=confession_clip`

## YouTube

- Description: `https://toxicconfessions.co/?utm_source=youtube&utm_medium=description&utm_campaign=tc_launch&utm_content=episode_cta`
- Pinned comment: `https://toxicconfessions.co/?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=tc_launch&utm_content=episode_cta`
- Community post: `https://toxicconfessions.co/?utm_source=youtube&utm_medium=community&utm_campaign=tc_launch&utm_content=confession_prompt`

## Class Notes email

- Main button: `https://toxicconfessions.co/?utm_source=email&utm_medium=class_notes&utm_campaign=tc_launch&utm_content=main_button`

## OBK Start

- Toxic Confessions card: `https://toxicconfessions.co/?utm_source=obkstart&utm_medium=landing_page&utm_campaign=obk_start&utm_content=toxic_confession`

## Spoken/direct CTA

Use: `toxicconfessions.co/?source=podcast`

## Funnel events emitted by the page

- `tc_landing_view`
- `tc_primary_cta_click`
- `tc_consent_ready`
- `tc_recorder_open`
- `tc_recorder_fallback_click`
- `tc_submission_complete` (via the Podline success redirect)

A GA4/GTM destination still needs to be connected before `dataLayer` events become an aggregate dashboard. Until then, Podline retains total conversion counts and the submission detail format retains source/callback intent with each confession.

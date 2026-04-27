# StudentHub

StudentHub is a global student marketplace and innovation ecosystem where students can:

- publish skill-based services
- post and validate ideas
- form teams and collaborate
- build portfolios and trust signals
- move ideas into launch-ready projects

## Live Site

- Public site: [https://gamme123.github.io/students-skill-market-place](https://gamme123.github.io/students-skill-market-place)
- Explore: [https://gamme123.github.io/students-skill-market-place/explore](https://gamme123.github.io/students-skill-market-place/explore)
- Idea Hub: [https://gamme123.github.io/students-skill-market-place/ideas](https://gamme123.github.io/students-skill-market-place/ideas)
- Collaboration: [https://gamme123.github.io/students-skill-market-place/collaboration](https://gamme123.github.io/students-skill-market-place/collaboration)
- Profile: [https://gamme123.github.io/students-skill-market-place/profile](https://gamme123.github.io/students-skill-market-place/profile)

## Product Overview

StudentHub combines:

- a marketplace for student services and project delivery
- an idea incubator for startup, research, and product concepts
- a collaboration layer for roles, workspaces, tasks, and milestones
- a portfolio and trust layer for identity, credibility, and discovery

## Core Features

### 1. Marketplace

- browse student services by category
- publish services from the profile page
- pricing, delivery days, tags, and category-based discovery
- broader fallback catalog for a fuller marketplace experience

### 2. Idea Hub

- post ideas with title, description, category, difficulty, stage, and visibility
- vote on ideas
- comment on ideas
- request to join with a selected role
- follow ideas and categories
- opportunity feed based on followed interests

### 3. Collaboration

- create workspaces from ideas
- join workspaces by role
- send workspace messages
- create sprint tasks
- manage milestone ownership
- convert a workspace into a launch-ready project
- workspace health, contribution tracking, and simulation signals

### 4. Profile and Identity

- user profile with trust score
- portfolio readiness score
- verification checklist
- Skill DNA layer
- services and idea contribution summaries

### 5. Global Layer

- language preferences including English, Swahili, French, and Afan Oromo
- viewer modes for Student, Recruiter, and Investor
- currency preferences for USD, KES, and EUR
- global competition and hackathon signals

## Technical Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Supabase
- GitHub Pages

## Supabase Setup

This project now points to the new Supabase project:

- Project ID: `prxabnsjupiyhtzevann`
- Project URL: `https://prxabnsjupiyhtzevann.supabase.co`

The app uses:

- `profiles`
- `services`
- `reviews`
- `messages`
- `ideas`
- `idea_votes`
- `idea_join_requests`
- `idea_comments`
- `idea_workspaces`
- `idea_workspace_members`
- `idea_workspace_tasks`
- `idea_workspace_milestones`
- `idea_workspace_messages`

## Auth Notes

- sign up supports Gmail, university email, Outlook, and other valid email providers
- missing profiles are auto-created more defensively on sign-in and session restore
- email verification redirects now respect the GitHub Pages base path

## Deployment Notes

- this is a GitHub Pages project site, so all links must include `/students-skill-market-place/`
- correct root link:
  - `https://gamme123.github.io/students-skill-market-place`
- incorrect root link:
  - `https://gamme123.github.io`

## Recommended Social Media Link

Use this as the main public link:

[https://gamme123.github.io/students-skill-market-place](https://gamme123.github.io/students-skill-market-place)

## Short Public Description

StudentHub is a global student marketplace and innovation platform where students can showcase skills, sell services, post ideas, build teams, and turn concepts into real projects.

## Current Status

This build is now set up as a working MVP with:

- live Supabase-backed auth
- live service publishing
- live idea posting and interaction
- live collaboration workspace tables
- GitHub Pages deployment

Some areas can still be refined further, but the platform is now in a strong public demo state.

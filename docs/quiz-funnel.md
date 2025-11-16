# Quiz Funnel — Design & Tracking (EN)

This document defines the quiz funnel design, recommended question types, analytics events, and implementation checklist.

## Funnel Flow
1. Entry: landing or referral -> quiz start
2. Onboarding: 1-2 warm-up questions
3. Core questions: 6-12 steps with branching
4. Micro-conversion: ask for email / save progress mid-funnel
5. Completion: show tailored recommendation and CTA (signup)

## Question Types
- single_choice
- multi_choice
- numeric_input
- range_slider
- text_short
- image_choice

## Engagement
- Progress bar (English copy)
- Encourage microcopy: "You're doing great — just a few more questions"
- Smooth transitions (fade/slide)
- Save progress locally and to backend for logged users

## Lead Capture
- Endpoint: `POST /quiz/capture-email` (anonymous friendly)
- DTO: `CaptureQuizEmailDto` with `{ email, clientId?, step?, type?, metadata? }`
- Persistence: `QuizLead` table via `QuizLeadService.captureLead`
- Behaviour: dedupe on `(email, clientId)`, attach userId when available, return `{ ok, leadId, savedAt }`

## Analytics Events (English names)
- quiz.started -> { quizId, sessionId, entryPoint }
- quiz.step_viewed -> { quizId, stepIndex }
- quiz.answer_selected -> { quizId, stepIndex, questionId, answerId / value }
- quiz.progress_saved -> { quizId, sessionId, progressPercent }
- quiz.completed -> { quizId, sessionId, durationMs }
- ab_test.variant_assigned -> { experimentKey, variant }

## Implementation Checklist
- Backend: `apps/backend/src/modules/quiz` (models, controllers, service)
- Shared types: `packages/shared/src/types/quiz.ts`
- Web: `apps/web/src/features/quiz` (QuizRunner, Question components, analytics hooks)
- Tests: unit + e2e happy path



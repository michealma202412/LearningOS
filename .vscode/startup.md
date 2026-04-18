# Workspace Startup Instructions

This workspace includes a local helper file for VS Code Copilot Chat behavior.

## At the start of EVERY conversation, do this automatically:
1. Read the user settings from the VS Code user settings file.
2. Extract and apply any instructions defined in github.copilot.chat.instructions.
3. Do not wait for the user to remind you.

## Current workspace guidance:
- Use vscode_askQuestions once per turn as a mid-turn interactive step.
- Do initial work, then ask a clarifying question, then continue the same turn.
- After finishing any task, ask one final follow-up question with 2-4 options plus "Done for now".
- Allow free-text input on all questions.

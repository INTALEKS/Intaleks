---
inclusion: always
---

# Documentation and Summary Files

## Critical Rule: No Automatic Documentation Files

**DO NOT create markdown (.md) files to document your work unless explicitly requested by the user.**

This includes:

- Summary files
- Fix documentation
- Change logs
- Work reports
- Implementation guides
- README updates (unless requested)

## Why?

Creating unsolicited documentation files is:

- Wasteful of time and resources
- Noisy and clutters the workspace
- Pointless when the user just wants the work done
- Annoying to users who have to clean them up

## What to Do Instead

When you complete work:

1. Provide a brief verbal summary in your response (2-3 sentences max)
2. Only mention the key changes made
3. Let the user ask for documentation if they need it

## Exceptions

You MAY create .md files when:

- The user explicitly asks for documentation
- The user requests a README, guide, or summary file
- It's part of the project structure (e.g., API docs, user-facing docs)
- The user says "document this" or similar

## Examples

❌ **Bad**: "I've fixed the issues. Here's a comprehensive FIXES.md file..." ✅ **Good**: "Fixed all linting issues and TypeScript errors in the valuation multiples feature. Added validation schemas and applied the database migration."

❌ **Bad**: Creating IMPLEMENTATION_GUIDE.md after building a feature ✅ **Good**: Just build the feature and briefly mention what was done

Remember: Users want results, not paperwork.

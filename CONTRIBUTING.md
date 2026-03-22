# Contributing to npm-stat-graph

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to **npm-stat-graph**. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 🐛 Reporting Bugs

If you find a bug, please open an issue and include:
- A clear, descriptive title.
- Steps to reproduce the bug.
- A description of the expected vs actual behavior.
- Your environment (browser, OS, etc.).

## ✨ Proposing Feature Requests

Feature requests are always welcome! When proposing, please describe the problem you're trying to solve and how the feature would solve it.

## 💻 Local Development Setup

1. Fork the repository and clone it locally.
2. Install dependencies: `pnpm install`.
3. Start the dev server: `pnpm dev`.
4. Ensure the codebase passes linting before submitting: `pnpm lint`.

## 🛠 Coding Standard

We aim for a clean, consistent codebase.
- **TypeScript**: All new code should be fully typed.
- **Functional Components**: Use standard React functional components with hooks.
- **ESLint**: Respect the existing `@tony.ganchev/eslint-plugin-header` requirements. Every file should include the standard license header.

## 📤 Pull Request Process

1. Create a new branch for your feature or fix.
2. Ensure all code builds and lints correctly (`npm run build && npm run lint`).
3. Submit a Pull Request with a clear description of the change.
4. Once reviewed and approved, it will be merged into the main branch.

---

Thank you for contributing to the open-source community! 🚀

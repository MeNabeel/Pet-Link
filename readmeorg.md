# 🐾 PetLink Team Contribution Guidelines

Welcome to the **PetLink Development Team**! To maintain code quality, ensure stability, and streamline collaboration, please follow the guidelines defined below.

---

## 🚫 Push Restriction Policy
* **DO NOT push directly to the `main` or `master` branches.** Direct pushes to these branches are restricted.
* All development work must be done in dedicated branches and merged via **Pull Requests (PRs)**.

---

## 🌿 Branch Naming Conventions
Always create a branch from the latest `main` branch before starting work. Use descriptive prefixes:

| Branch Type | Prefix Scheme | Example |
|-------------|---------------|---------|
| **Features** | `feature/` | `feature/user-marketplace` |
| **Bugfixes** | `bugfix/` | `bugfix/login-crash-fix` |
| **Hotfixes** | `hotfix/` | `hotfix/session-expiry-patch` |
| **Chore / Config** | `chore/` | `chore/ci-caching` |

```bash
# Example: Creating a feature branch
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

---

## 🚀 Pull Request (PR) & CI/CD Workflow
Every Pull Request targeting `main` automatically triggers the **PetLink CI Pipeline** checks in [.github/workflows/ci.yml](file:///.github/workflows/ci.yml).

### Required Checks before Merging
1. **Linting Check (`npm run lint`)**: Enforces clean styling and syntax checks across backend, web, and mobile app codebases.
2. **Testing Suite (`npm run test`)**: Executes unit test suites.
3. **Build Compilation (`npm run build`)**: Validates that production builds compile without build-time exceptions.

### Local Quality Check Checklist
Before pushing your branch and opening a PR, always run these checks locally to prevent CI pipeline failures:

* **Backend checks**:
  ```bash
  cd server/backend
  npm run lint
  npm run test
  ```
* **Web Client checks**:
  ```bash
  cd client/web
  npm run lint
  npm run test
  npm run build
  ```
* **Mobile Client checks**:
  ```bash
  cd client/app
  npm run lint
  npm run test
  npm run build
  ```

---

## 💡 Best Practices & Coding Rules
1. **No Placeholders**: Never write dummy mock fields or empty functions in production components.
2. **Never Use Emojis**: Do not use emojis in UI layouts or commit messages. Use clean, vector SVG/Lucide React icons.
3. **Descriptive Commit Messages**: Commits should read like descriptions (e.g. `feat: implement user registration validation`, `fix: resolve crash on web font declaration`).
4. **Environment Variables**: Never commit private passwords or database keys to the repository. Define them in local `.env` files and use GitHub secrets for CI pipelines.

---

### Need Help?
Contact Scrum Master **Nabeel Ijaz** or create an issue in the workspace tracker.

*Thank you for keeping PetLink's codebase clean and reliable!*

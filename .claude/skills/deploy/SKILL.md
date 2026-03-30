---
name: deploy
description: Deploy Simplify Charts to production
---

Deploy the application:

1. Ensure all changes are committed
2. Run the build to verify no errors: `pnpm build`
3. Push to main branch
4. The CI/CD pipeline will handle deployment to AWS ECS

Prerequisites:
- AWS credentials configured
- Docker running (for local testing)
- All tests passing

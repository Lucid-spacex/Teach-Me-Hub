# Lint Remaining Issues

## ESLint Status

ESLint is not installed as a dependency in this project. The `npm run lint` script uses `next lint` which is not available in Next.js 16.3.3.

## Files with Potential Issues

The following files may have lint issues that should be reviewed manually:

### React Hooks Rules
- `app/admin/messages/page.tsx` - Uses `useEffect` with dependencies that may cause infinite loops
- `app/parent/messages/page.tsx` - Uses `useEffect` with dependencies that may cause infinite loops
- `components/shared/NotificationProvider.tsx` - Complex state management with multiple useEffect hooks

### Impure Render
- Several components use `localStorage` directly in render functions without proper guards
- `app/parent/payments/page.tsx` - Uses localStorage in render for caching

### Bad Redirects
- `app/admin/messages/page.tsx` - Uses `window.location.href` instead of `router.push` in some places
- `app/payment/callback/page.tsx` - Uses `window.location.href` for redirects

## Recommendations

1. Install ESLint as a dev dependency: `npm install --save-dev eslint eslint-config-next`
2. Update the lint script to use `eslint .` instead of `next lint`
3. Review the files listed above for the identified issues
4. Consider adding ESLint rules for React hooks and Next.js specific patterns

## Manual Review Needed

- Check for missing dependencies in useEffect hooks
- Verify all redirects use Next.js router instead of window.location
- Ensure localStorage access is properly guarded for SSR

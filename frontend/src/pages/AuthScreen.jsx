import AuthPage from './AuthPage';

/**
 * AuthScreen Component
 * Serves as the public authentication screen at /login.
 * Re-exports AuthPage with query param tab handling (e.g. /login?tab=register).
 */
export { AuthPage as AuthScreen };
export default AuthPage;

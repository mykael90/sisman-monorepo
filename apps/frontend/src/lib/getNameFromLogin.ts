// Helper function to get first and last name
const getNameFromLogin = (login?: string | null): string => {
  if (!login) {
    return 'User name'; // Default or fallback name
  }
  const names = login.trim().split('.');
  if (names.length <= 1) {
    return login.toUpperCase(); // Return the full name if only one name exists
  }
  // Return the first and second name from login
  return `${names[0]} ${names[1]}`.toUpperCase();
};
export default getNameFromLogin;

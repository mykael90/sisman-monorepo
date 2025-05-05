// Helper function to get first and last name
const getFirstAndLastName = (fullName?: string | null): string => {
  if (!fullName) {
    return 'User name'; // Default or fallback name
  }
  const names = fullName.trim().split(' ');
  if (names.length <= 1) {
    return fullName; // Return the full name if only one name exists
  }
  // Return the first and last name
  return `${names[0]} ${names[names.length - 1]}`;
};
export default getFirstAndLastName;

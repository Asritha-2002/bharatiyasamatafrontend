export const getInitials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// Turns any axios/network error into a clear, specific message + icon
export function resolveErrorDetails(err) {
  if (!err.response) {
    if (err.code === 'ECONNABORTED') {
      return {
        title: 'Request timed out',
        message: 'The server is taking too long to respond. Please check your connection and try again.',
        icon: 'clock'
      };
    }
    return {
      title: 'Network error',
      message: "We couldn't reach the server. Please check your internet connection and try again.",
      icon: 'wifi'
    };
  }

  const status = err.response.status;

  if (status === 401 || status === 403) {
    return { title: 'Session expired', message: 'Please log in again to continue.', icon: 'lock' };
  }
  if (status === 404) {
    return {
      title: 'Not found',
      message: "We couldn't find your dashboard data. Please try again or contact support if this continues.",
      icon: 'search'
    };
  }
  if (status >= 500) {
    return { title: 'Server error', message: 'Something went wrong on our end. Please try again in a moment.', icon: 'server' };
  }

  return {
    title: 'Something went wrong',
    message: err.response.data?.error || 'Could not load your dashboard. Please try again.',
    icon: 'alert'
  };
}

export const ROLE_STYLES = {
  VOLUNTEER: 'bg-gray-100 text-gray-600 border-gray-200',
  RO: 'bg-blue-50 text-blue-700 border-blue-200',
  SO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200'
};
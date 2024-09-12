export const trackGAEvent = ({ action, category, label, value, user, organization }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    user: user,
    organization: organization,
  });
};

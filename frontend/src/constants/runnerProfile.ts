/**
 * Runner Profile Constants
 * Tag options and validation constants for runner profiles
 */

export const TAG_OPTIONS = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'moving', label: 'Moving' },
  { value: 'handyman', label: 'Handyman' },
  { value: 'petcare', label: 'Pet Care' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'techsupport', label: 'Tech Support' },
  { value: 'errands', label: 'Errands' },
  { value: 'other', label: 'Other' },
];

export const RUNNER_PROFILE_VALIDATION = {
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
  MIN_SERVICE_RADIUS: 1,
  MAX_SERVICE_RADIUS: 100,
  MIN_HOURLY_RATE: 0,
  MAX_HOURLY_RATE: 10000,
  MIN_TAGS: 1,
};

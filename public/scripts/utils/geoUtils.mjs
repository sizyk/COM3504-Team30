/**
 * Gets the unicode string for a country flag emoji from its two-letter code
 * (from https://dev.to/jorik/country-code-to-flag-emoji-a21)
 * @param countryCode {string} the country code to generate a flag for
 * @returns {string} the country's flag as an emoji
 */
export function getFlagEmoji(countryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/**
 * Wrapper for nominatim API: reverse-geocodes a coordinate
 * @param lat {number|string} the latitude to reverse geocode
 * @param lng {number|string} the longitude to reverse geocode
 * @returns {Promise<{displayName: any, countryCode: any}>} a promise that,
 *    when resolved, returns a JSON object containing a place's display name, and its country
 */
export async function reverseGeocode(lat, lng) {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lng}&zoom=16&format=jsonv2`);
  const resJson = await res.json();

  return {
    displayName: resJson['display_name'].split(',').slice(0, 3).join(','), /* eslint-disable-line dot-notation */
    countryCode: resJson['address']['country_code'], /* eslint-disable-line dot-notation */
  };
}

const API_BASE = "https://de1.api.radio-browser.info/json";

/**
 * Fetches radio stations for a specific country code.
 * @param {string} countryCode - The two-letter ISO country code.
 * @returns {Promise<Array>} - A promise that resolves to an array of station objects.
 */
export const fetchStationsByCountry = async (countryCode) => {
    try {
        const response = await fetch(`${API_BASE}/stations/bycountrycodeexact/${countryCode.toLowerCase()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch stations for ${countryCode}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching country data:", error);
        return [];
    }
};

/**
 * Fetches the top-voted stations worldwide for the initial landing page.
 * @param {number} limit - Number of stations to fetch.
 * @returns {Promise<Array>}
 */
export const fetchTopStations = async (limit = 100) => {
    try {
        const response = await fetch(`${API_BASE}/stations/topvote/${limit}`);
        if (!response.ok) throw new Error("Failed to fetch top stations");
        return await response.json();
    } catch (error) {
        console.error("Error fetching top stations:", error);
        return [];
    }
};

/**
 * Gets the full list of available countries from the live API.
 * @returns {Promise<Array>} - Promise resolving to array of objects with code and name.
 */
export const fetchAvailableCountries = async () => {
    try {
        const response = await fetch(`${API_BASE}/countries`);
        if (!response.ok) throw new Error("Failed to fetch available countries");
        const data = await response.json();

        return data
            .filter(c => c.iso_3166_1) // Ensure it has a country code
            .map(c => ({
                code: c.iso_3166_1.toLowerCase(),
                name: c.name,
                count: c.stationcount
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error fetching countries:", error);
        return [];
    }
};

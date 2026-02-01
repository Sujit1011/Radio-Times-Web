/**
 * Metadata Fetcher Utility
 * Attempts to retrieve real-time song information from Shoutcast/Icecast servers
 */

const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Sanitizes and cleans metadata strings to prevent XSS and UI overflow.
 * @param {string} text - The raw metadata string.
 * @returns {string} - Cleaned string.
 */
const cleanMetadata = (text) => {
    if (!text) return '';
    // Strip HTML tags and control characters
    let cleaned = text.replace(/<[^>]*>?/gm, '').replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    // Trim and limit length
    cleaned = cleaned.trim().substring(0, 100);
    return cleaned;
};

/**
 * Fetch Shoutcast 7.html metadata
 */
const fetchShoutcastV1 = async (baseUrl) => {
    try {
        const response = await fetch(`${CORS_PROXY}${baseUrl}/7.html`);
        if (!response.ok) return null;
        const text = await response.text();
        console.log(text);
        // 7.html format: 1,1,100,100,1,128,Artist - Title
        const match = text.match(/.*,.*,.*,.*,.*,.*,(.*)/);
        return match ? cleanMetadata(match[1]) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Fetch Icecast status-json.xsl metadata
 */
const fetchIcecastJson = async (baseUrl) => {
    try {
        const response = await fetch(`${CORS_PROXY}${baseUrl}/status-json.xsl`);
        if (!response.ok) return null;
        const data = await response.json();

        console.log(data);

        // Icecast JSON structure varies, try to find "title" in source list
        if (data && data.icestats && data.icestats.source) {
            const sources = Array.isArray(data.icestats.source)
                ? data.icestats.source
                : [data.icestats.source];

            // Find a source with a title
            for (const source of sources) {
                if (source.title) return cleanMetadata(source.title);
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};

/**
 * Fetch Shoutcast V2 stats XML/JSON
 */
const fetchShoutcastV2 = async (baseUrl) => {
    try {
        const response = await fetch(`${CORS_PROXY}${baseUrl}/stats?json=1`);
        if (!response.ok) return null;
        const data = await response.json();

        // Shoutcast V2 can have different nested structures
        if (data && data.songtitle) return cleanMetadata(data.songtitle);
        if (data && data.streams && data.streams[0] && data.streams[0].songtitle) {
            return cleanMetadata(data.streams[0].songtitle);
        }
        return null;
    } catch (e) {
        return null;
    }
};

/**
 * Fallback for older Icecast or custom status pages
 */
const fetchIcecastRaw = async (baseUrl) => {
    try {
        const response = await fetch(`${CORS_PROXY}${baseUrl}/status.xsl`);
        if (!response.ok) return null;
        const text = await response.text();
        // Very crude attempt to find "Current Song:" in HTML if JSON fails
        const match = text.match(/Current Song:<\/td><td class="streamdata">(.*?)<\/td>/i);
        return match ? cleanMetadata(match[1]) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Intelligent helper to extract the server base URL from a stream URL.
 * Shoutcast/Icecast metadata is usually at the root or one level up from the stream.
 */
const getBaseUrl = (streamUrl) => {
    try {
        const url = new URL(streamUrl);
        // Remove trailing slash if exists
        let base = `${url.protocol}//${url.host}`;

        // If the path is just / or /;, or /stream, return the host root
        if (url.pathname === '/' || url.pathname === '/;' || url.pathname.toLowerCase().includes('stream')) {
            return base;
        }

        // For paths like /9020/stream, try to keep the /9020/ part as it might be a mount point
        const segments = url.pathname.split('/').filter(s => s && s !== ';');
        if (segments.length > 1) {
            return `${base}/${segments[0]}`;
        }

        return base;
    } catch (e) {
        return streamUrl.split('?')[0].replace(/\/$/, '');
    }
};

/**
 * Main function to attempt metadata discovery
 */
export const fetchLiveMetadata = async (streamUrl) => {
    if (!streamUrl) return null;

    const base = getBaseUrl(streamUrl);

    // Create combinations of strategies
    const strategies = [
        fetchShoutcastV1(base),
        fetchShoutcastV2(base),
        fetchIcecastJson(base),
        fetchIcecastRaw(base),
        // Fallback: Try the raw stream URL but with metadata paths (unlikely but safe)
        fetchShoutcastV1(streamUrl.split('?')[0]),
        fetchIcecastJson(streamUrl.split('?')[0]),
        fetchIcecastRaw(streamUrl.split('?')[0])
    ];

    try {
        // Return the first valid result that actually has content
        const results = await Promise.allSettled(strategies);
        const valid = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);

        return valid[0] || null;
    } catch (e) {
        console.error("Metadata discovery crashed:", e);
        return null;
    }
};

const puppeteer = require("puppeteer");
const axios = require("axios");

/**
 * Performs a TikTok search and returns the search results along with the necessary cookies.
 *
 * @param {Object} options - The search options.
 * @param {string} options.keyword - The keyword to search for on TikTok.
 * @param {number} [options.pages=1] - The number of pages of search results to fetch. Each page typically contains 12 results.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *  - `cookies` {string}: The cookies used during the TikTok search, including the `ttwid` cookie.
 *  - `items` {Array}: An array of search result items. Each item represents a piece of content found for the specified keyword.
 *
 * @example
 * const { fetchTikTokSearch } = require('your-package-name');
 *
 * (async () => {
 *   try {
 *     const { cookies, items } = await fetchTikTokSearch({
 *       keyword: 'funny videos',
 *       pages: 2
 *     });
 *
 *     console.log('Cookies:', cookies);
 *     console.log('Items:', items);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * })();
 *
 *  Example output:
 *  Cookies: ttwid=your_ttwid_cookie; other_cookie=other_value;
 *  Items: [{ item: { video: { url: 'https://...' }, ... }, ... }, ...]
 */
async function fetchTikTokSearch({ keyword, pages = 1 }) {
  try {
    const { cookieString } = await getTtwidCookie();

    let searchResults = await fetchTikTokSearch1({
      keyword,

      cookieString,
    });
    let allResults = [];

    if (searchResults && searchResults.length > 0) {
      let searchId = searchResults[0].common.doc_id_str;
      allResults.push(...searchResults);

      for (let i = 1; i < pages; i++) {
        let offset = (i + 1) * 12;
        let moreResults = await fetchTikTokSearch2({
          keyword,
          offset,
          searchId,

          cookieString,
        });
        if (moreResults) {
          allResults.push(...moreResults);
        }
      }

      return { cookies: cookieString, items: allResults };
    } else {
      return { cookies: cookieString, items: [] };
    }
  } catch (error) {
    console.error("Error during TikTok search:", error);
    return { cookies: null, items: [] };
  }
}

// Internal function to fetch the first set of results
async function fetchTikTokSearch1({ keyword, cookieString }) {
  const urlString = `https://www.tiktok.com/api/search/general/full/?from_page=search&keyword=${keyword}&`;

  try {
    const res = await axios.get(urlString, {
      headers: { Cookie: cookieString },
    });
    return res.data.data;
  } catch (err) {
    console.error(err);
  }
}

// Internal function to fetch subsequent sets of results
async function fetchTikTokSearch2({ keyword, offset, searchId, cookieString }) {
  const urlString = `https://www.tiktok.com/api/search/general/full/?from_page=search&keyword=${keyword}&offset=${offset}&search_id=${searchId}&`;

  try {
    const res = await axios.get(urlString, {
      headers: { Cookie: cookieString },
    });
    return res.data.data;
  } catch (err) {
    console.error(err);
  }
}
// Utility function for adding a delay
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

// Function to get the 'ttwid' cookie from TikTok
async function getTtwidCookie() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Navigate to TikTok homepage to set cookies
  await page.goto("https://www.tiktok.com", {
    waitUntil: "networkidle2",
  });

  // Add a delay to allow the page to fully load and cookies to be set
  await delay(5000);

  // Get the cookies, including 'ttwid'
  const cookies = await page.cookies();
  const ttwidCookie = cookies.find((cookie) => cookie.name === "ttwid");
  const cookieString = cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  await browser.close();

  if (ttwidCookie) {
    return { ttwid: ttwidCookie.value, cookieString };
  } else {
    throw new Error("ttwid cookie not found");
  }
}
module.exports = { fetchTikTokSearch };

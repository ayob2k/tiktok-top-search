const puppeteer = require("puppeteer");

// Utility function for adding a delay
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

// Function to get the 'ttwid' cookie from TikTok
async function getTtwidCookie() {
  const browser = await puppeteer.launch({
    headless: true, // You can set this to false to see the browser in action
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Navigate to TikTok homepage to set cookies
  await page.goto("https://www.tiktok.com", {
    waitUntil: "networkidle2",
  });

  // Add a delay to allow the page to fully load and cookies to be set
  await delay(2000); // 2-second delay

  // Get the ttwid cookie
  const cookies = await page.cookies();
  const ttwidCookie = cookies.find((cookie) => cookie.name === "ttwid");

  await browser.close();

  if (ttwidCookie) {
    return ttwidCookie.value;
  } else {
    throw new Error("ttwid cookie not found");
  }
}

// Function to perform TikTok search
async function fetchTikTokSearch({ keyword, pages = 1 }) {
  try {
    const ttwid = await getTtwidCookie();

    let searchResults = await fetchTikTokSearch1({ keyword, ttwid });
    if (searchResults && searchResults.length > 0) {
      let searchId = searchResults[0].common.doc_id_str;
      let finalArr = [];
      for (let i = 1; i < pages; i++) {
        let offset = (i + 1) * 12;
        let myArr = await fetchTikTokSearch2({
          keyword,
          offset,
          searchId,
          ttwid,
        });
        if (myArr) {
          finalArr.push(...myArr);
        }
      }
      return finalArr;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error during TikTok search:", error);
    return [];
  }
}

// Internal function to fetch the first set of results
async function fetchTikTokSearch1({ keyword, ttwid }) {
  const cookieString = `ttwid=${ttwid};`;
  const urlString = `https://www.tiktok.com/api/search/general/full/?from_page=search&keyword=${keyword}&`;

  try {
    const res = await fetch(urlString, {
      method: "GET",
      headers: {
        Cookie: cookieString,
      },
    });
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error(err);
  }
}

// Internal function to fetch subsequent sets of results
async function fetchTikTokSearch2({ keyword, offset, searchId, ttwid }) {
  const cookieString = `ttwid=${ttwid};`;
  const urlString = `https://www.tiktok.com/api/search/general/full/?from_page=search&keyword=${keyword}&offset=${offset}&search_id=${searchId}&`;

  try {
    const res = await fetch(urlString, {
      method: "GET",
      headers: {
        Cookie: cookieString,
      },
    });
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error(err);
  }
}

module.exports = { fetchTikTokSearch };

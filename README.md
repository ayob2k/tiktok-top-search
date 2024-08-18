# TikTok Search Api

## How to Install

```
npm install tiktok-top-search
```

## How to Use

```
import { fetchTikTokSearch } from 'tiktok-top-search'

const results = await fetchTikTokSearch(keyword, pageCount)
```

## Arguments

- **keyword (String)**: This is the keyword you would like to search for (uses TikTok search)
- **pageCount (Number)**: number of pages you would like to get
  - each page is ~12 videos, so pageCount of 10 would give ~120 results

## Results

Here is a sample of the results. The results are an array of video objects with the most important parts being the item.id (video id) and the author object where you can find the author uniqueId among other things

```
 cookies: "...",
 items :[{
    type: 1,
    item: {
      id: '7202140515909782790',
      desc: 'Retraite 3days 🤍🙌🏾#fypシ #christiantiktok #God #retraitespirituelle ',
      createTime: 1676879023,
      video: [Object],
      author: [Object],
      music: [Object],
      challenges: [Array],
      stats: [Object],
      duetInfo: [Object],
      originalItem: false,
      officalItem: false,
      textExtra: [Array],
      secret: false,
      forFriend: false,
      digged: false,
      itemCommentStatus: 0,
      showNotPass: false,
      vl1: false,
      itemMute: false,
      authorStats: [Object],
      privateItem: false,
      duetEnabled: true,
      stitchEnabled: true,
      shareEnabled: true,
      stickersOnItem: [Array],
      isAd: false,
      collected: false
    },
    common: { doc_id_str: '7202140515909782790' }
  },
  ...
 ]
```

You can use cookies to download videos based on video playAdr

import {
  fetchDefinition,
  fetchKeywords,
  APP_URL,
} from './graphqlAPI.js';
import {
  newID,
  formatDefinition
} from './utils.js';

const lookupWithEvoke = selection => {
  const term = selection.selectionText;
  fetchDefinition(term).then(res => {
    const message = res.data.lookup.length ? 
      (res.data.lookup.map(def => formatDefinition(def)).join('\n\n')) : `No entry found for ${term}.`
    const opt = {
      type: 'basic',
      title: 'EVOKE Lookup',
      message,
      iconUrl:'./favicon.ico',
      priority: 1,
      buttons: [
        {title: "Add to Evoke"}, {title: "Manage"}
      ]
    };
    
    const notificationId = newID()
    chrome.notifications.create(notificationId, opt, function(id) { console.log("Last error:", chrome.runtime.lastError); });

    chrome.notifications.onButtonClicked.addListener((nId, bIndex) => {
      if (notificationId == nId) {
        if (bIndex == 0) {
          // send to Evoke
        } else {
          // manage in Evoke
          window.open(`${APP_URL}/entries`, "_blank")
        }
      }
    })
  })
}

chrome.contextMenus.create({
  title: "EVOKE",
  contexts:["selection"],
  onclick: lookupWithEvoke
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.fetchReady == true) {
      sendResponse({fetching: true});

      chrome.storage.local.remove('keywords', function() {
        console.log('Keywords cleared.');
      });

      fetchKeywords().then(res => {
        const keywordMap = {}
        let tooltipText
        for (const keyword of res.data.keywords) {
          if (keyword.keyword_type == 'Definition') {
            tooltipText = `/${keyword.keyword}/ is contained in your ${keyword.related} collection.`
          } else {
            const kType = keyword.keyword_type
            tooltipText = `/${keyword.keyword}/ is a${kType == 'Antonym' ? 'n' : ''} ${kType.toLowerCase()} of ${keyword.related}`
          }
          keyword.tooltipText = tooltipText

          if (keywordMap[keyword.keyword]) {
            keywordMap[keyword.keyword].push(keyword)
          } else {
            keywordMap[keyword.keyword] = [keyword]
          }
        }
        
        chrome.storage.local.set({ keywords: keywordMap }, function() {
          console.log('Keywords saved.') 
        });
      })
    }
  });
import {
  fetchDefinition,
  fetchKeywords,
  createManyDefinitions,
  APP_URL,
} from './graphqlAPI.js';
import {
  formatDefinition,
  chromeNotification,
  parseKeywordResponse
} from './utils.js';

// notification based lookup; will fetch definitions then display a Chrome notification with options
const lookupWithEvoke = selection => {
  const term = selection.selectionText;
  fetchDefinition(term).then(res => {
    const definitions = res.data.lookup
    const message = definitions.length ? 
      (definitions.map(def => formatDefinition(def)).join('\n\n')) : `No entry found for ${term}.`

    const options = {
      message,
      buttons: [
        {title: "Add to Evoke"}, {title: "Manage"}
      ]
    };
    
    const notificationID = chromeNotification(options)

    chrome.notifications.onButtonClicked.addListener((nID, buttonIndex) => {
      if (notificationID == nID) {
        if (buttonIndex == 0) {
          // add to Evoke
          createManyDefinitions(definitions).then(
            () => fetchKeywords().then(res => {
              updateStorageKeywords(res)
              const message = `${definitions.length} definitions successfully added to Evoke.`
              const options = {
                message,
              };
              chromeNotification(options)
            })
          )
        } else {
          // manage in Evoke
          window.open(`${APP_URL}/entries`, "_blank")
        }
      }
    })
  })
}

// trigger modal in loading state, fetch definitions, update modal
const triggerModal = selection => {
  const term = selection.selectionText;

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "evokeModal", state: "loading"});
  });

  fetchDefinition(term).then(res => {
    const definitions = res.data.lookup
    const message = definitions.length ? 
      (definitions.map(def => formatDefinition(def)).join('<br/><br/>')) : `No entry found for ${term}.`
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "evokeModal", state: "complete", message});
    });
  })
};

// fold the response into the local storage
const updateStorageKeywords = res => {
  const keywords = parseKeywordResponse(res)
  chrome.storage.local.set({ keywords }, function() {
    console.log('Keywords saved.') 
  });
}

/** 
 * Runtime functionality below includes:
 *  - adding event listeners
 *  - adding items to context menu
 */


// update storage keywords when content script sends ready message
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.fetchReady == true) {
      sendResponse({fetching: true});

      chrome.storage.local.remove('keywords', function() {
        console.log('Keywords cleared.');
      });

      fetchKeywords().then(res => updateStorageKeywords(res))
    }
  });

// experimenting with a modal instad of notifications for displaying definitions
chrome.runtime.onInstalled.addListener(() => {
  const id = chrome.contextMenus.create({
    title: "Modal",
    contexts: ["selection"],
    onclick: triggerModal
  });
});

// add notification based lookup to context menu
chrome.contextMenus.create({
  title: "Notification",
  contexts:["selection"],
  onclick: lookupWithEvoke
});
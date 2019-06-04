const onlyUnique = (value, index, self) => { 
  return self.indexOf(value) === index;
}

const InstantSearch = {

  highlight: (container, keywords) => {
    const internalHighlighter = function (options){

      var id = {
          container: "container",
          tokens: "tokens",
          all: "all",
          token: "token",
          className: "className",
          sensitiveSearch: "sensitiveSearch"
      },
      tokens = options[id.tokens],
      allClassName = options[id.all][id.className],
      allSensitiveSearch = options[id.all][id.sensitiveSearch];


      function checkAndReplace(node, tokenArr, classNameAll, sensitiveSearchAll)
      {
          var nodeVal = node.nodeValue, parentNode = node.parentNode,
              i, j, curToken, myToken, myClassName, mySensitiveSearch,
              finalClassName, finalSensitiveSearch,
              foundIndex, begin, matched, end,
              textNode, span, isFirst;

          for (i = 0, j = tokenArr.length; i < j; i++)
          {
              curToken = tokenArr[i];
              myToken = curToken[id.token];
              myClassName = curToken[id.className];
              mySensitiveSearch = curToken[id.sensitiveSearch];

              finalClassName = (classNameAll ? myClassName + " " + classNameAll : myClassName);

              finalSensitiveSearch = (typeof sensitiveSearchAll !== "undefined" ? sensitiveSearchAll : mySensitiveSearch);

              isFirst = true;
              while (true)
              {
                  if (finalSensitiveSearch)
                      foundIndex = nodeVal.indexOf(myToken);
                  else
                      foundIndex = nodeVal.toLowerCase().indexOf(myToken.toLowerCase());

                  if (foundIndex < 0)
                  {
                      if (isFirst)
                          break;

                      if (nodeVal)
                      {
                          textNode = document.createTextNode(nodeVal);
                          parentNode.insertBefore(textNode, node);
                      } // End if (nodeVal)

                      parentNode.removeChild(node);
                      break;
                  } // End if (foundIndex < 0)

                  isFirst = false;


                  begin = nodeVal.substring(0, foundIndex);
                  matched = nodeVal.substr(foundIndex, myToken.length);

                  if (begin)
                  {
                      textNode = document.createTextNode(begin);
                      parentNode.insertBefore(textNode, node);
                  } // End if (begin)

                  span = document.createElement("span");
                  span.className += finalClassName;
                  span.appendChild(document.createTextNode(matched));

                  span.addEventListener("click", () => window.open("http://localhost:3003/entries", "_blank"))

                  const tooltipText = keywords[myToken].map(_keyword => (
                    _keyword.tooltipText
                  )).filter(onlyUnique).join('; ')
                  span.setAttribute('data-evoke', `EVOKE ${tooltipText}`);

                  parentNode.insertBefore(span, node);

                  nodeVal = nodeVal.substring(foundIndex + myToken.length);
              } // Whend

          } // Next i 
      }; // End Function checkAndReplace 

      function iterator(p)
      {
          if (p === null) return;

          var children = Array.prototype.slice.call(p.childNodes), i, cur;

          if (children.length)
          {
              for (i = 0; i < children.length; i++)
              {
                  cur = children[i];
                  if (cur.nodeType === 3)
                  {
                      checkAndReplace(cur, tokens, allClassName, allSensitiveSearch);
                  }
                  else if (cur.nodeType === 1)
                  {
                      iterator(cur);
                  }
              }
          }
      }; // End Function iterator

      iterator(options[id.container]);
    };

    const allTokens = Object.keys(keywords).map(keyword => ({
      token: keyword,
      className: "highlight",
      sensitiveSearch: false
    }))
    
    internalHighlighter({
      container: container,
      all: {
        className: "highlighter"
      },
      tokens: allTokens
    })
  }
}

const TestTextHighlighting = (keywords) => {
    const container = document.body;
    InstantSearch.highlight(container, keywords);
}

window.addEventListener ("load", myMain, false);

function myMain (evt) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.keywords ) {
      const keywords = changes.keywords.newValue
      if (keywords) {
        TestTextHighlighting(keywords)
      }
    }
  });

  // send message to let background know we're ready
  chrome.runtime.sendMessage({fetchReady: true}, function(response) {
    console.log('response received');
  });

  // modal
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if ( request.action == "evokeModal" ) {
        console.log('MODAL:', request)
        let innerHTML;
        switch (request.state) {
          case "loading":
            innerHTML = `<div class="loader-container"><div class="loader"></div></div`
            break;
          case "complete":
            innerHTML = `<div>${request.message}</div>`
            break;
          default:
            return
        }

        background = document.createElement('div');
        background.id = "evoke-modal-background";
        modal = document.createElement('div');
        modal.id = "evoke-modal";
        modal.innerHTML = innerHTML;
        
        document.body.appendChild(background);
        background.appendChild( modal );
        closeScriptureModal = function() {
          const mdl = document.getElementById('evoke-modal-background');
          mdl.parentNode.removeChild( mdl );
        }

        button = document.createElement('button');
        button.onclick=closeScriptureModal;
        button.textContent='Close';
        modal.appendChild(button);
        sendResponse({farewell: "goodbye"});
    }
  })
}





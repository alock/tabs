function logHelper(command, tab, pinnedTabCount) {
  console.log(`command: ${command}
tab-title: ${tab.title}
tab-id: ${tab.id}
pinnned: ${tab.pinned}
pinned-count: ${pinnedTabCount}`);
}

function processCommand(command, tab, pinnedTabCount) {
  //logHelper(command, tab, pinnedTabCount);
  switch (command) {
    case "move-tab-first":
      if (pinnedTabCount > 0 && !tab.pinned) {
        browser.tabs.move(tab.id, { index: pinnedTabCount });
      } else {
        browser.tabs.move(tab.id, { index: 0 });
      }
      break;
    case "move-tab-left":
      if (tab.index > 0) {
        browser.tabs.move(tab.id, { index: tab.index - 1 });
      }
      break;
    case "move-tab-right":
      browser.tabs.move(tab.id, { index: tab.index + 1 });
      break;
    case "move-tab-last":
      if (pinnedTabCount > 0 && tab.pinned) {
        browser.tabs.move(tab.id, { index: pinnedTabCount - 1 });
      } else {
        // hacky to move to last placement hopefully we never have 100+ tabs :facepalm:
        browser.tabs.move(tab.id, { index: 100 });
      }
      break;
    case "pin-tab":
      if (tab.pinned) {
        browser.tabs.update(tab.id, { pinned: false });
      } else {
        browser.tabs.update(tab.id, { pinned: true });
      }
      break;
    case "duplicate-tab":
      browser.tabs.duplicate(tab.id);
      break;
    case "close-tab":
      browser.tabs.remove(tab.id);
      break;
    default:
      console.log(`command "${command}" not supported`);
  }
}

browser.commands.onCommand.addListener((command) => {
  // run tab queries in parrallel
  Promise.allSettled([
    // query for active tab in my current window
    browser.tabs.query({ currentWindow: true, active: true }),
    // query for pinned tabs to help with placement
    browser.tabs.query({ pinned: true }),
  ]).then((tabQueryResults) => {
    let activeTabResult = tabQueryResults[0];
    if (activeTabResult.status != "fulfilled") {
      console.log(activeTabResult.reason);
    }
    let pinnedTabsResult = tabQueryResults[1];
    if (pinnedTabsResult.status != "fulfilled") {
      console.log(pinnedTabsResult.reason);
    }
    processCommand(
      command,
      // resulting activeTab should be an array of 1
      activeTabResult.value[0],
      pinnedTabsResult.value.length
    );
  });
});

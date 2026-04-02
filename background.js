async function sendToggleMessage(tabId) {
  if (!tabId) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tabId, { type: "toggle-reader-mode" });
  } catch (error) {
    console.warn("Nao foi possivel alternar o modo de leitura neste separador.", error);
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  await sendToggleMessage(tab.id);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-reader-mode") {
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  await sendToggleMessage(tab?.id);
});

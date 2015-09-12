"use strict";

document.addEventListener("DOMContentLoaded", () => {
	chrome.runtime.onInstalled.addListener(details => {
		if (details.reason == "install")
			initDefaults();
	});
});

function initDefaults()
{
	let itemsText = document.getElementById("defaultItemsText").textContent;
	// https://code.google.com/p/v8/issues/detail?id=811
	let tmp = parseItemsText(itemsText);
	let items = tmp[0], errors = tmp[1];
	for (let e of errors)
		console.warn(e);
	chrome.storage.sync.set({
		items: items,
	   	itemsText: itemsText,
	   	defaultItemsText: itemsText
	});
}

"use strict";

document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.sync.get(["itemsText", "defaultItemsText"],
			o => init(o.itemsText, o.defaultItemsText));
});

function init(itemsText, defaultItemsText)
{
	let userText = document.getElementById("itemsText");
	let defaultText = document.getElementById("defaultItemsText");
	let saveButton = document.getElementById("save");
	let messages = document.getElementById("messages");

	userText.addEventListener("keyup", () => growTextArea(userText));
	userText.value = itemsText;
	growTextArea(userText);

	defaultText.value = defaultItemsText;
	growTextArea(defaultText);

	saveButton.addEventListener("click", () => {
		while (messages.firstChild)
			messages.firstChild.remove();

		let tmp = parseItemsText(userText.value);
		let items = tmp[0], errors = tmp[1];

		for (let e of errors) {
			let el = document.createElement("div");
			el.innerHTML = "ERROR: " + e;
			el.classList.add("bad");
			messages.appendChild(el);
		}

		chrome.storage.sync.set({
			items: items,
			itemsText: userText.value
		}, () => {
			let el = document.createElement("span");
			el.textContent = "Saved " + items.length + " items";
			el.classList.add("good");
			messages.appendChild(el);
		});
	});
}

function growTextArea(area) {
	if (area.scrollHeight > area.clientHeight)
		area.style.height = (area.scrollHeight + 1) + "px";
}

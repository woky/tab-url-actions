"use strict";

document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.sync.get("items", o => init(o.items));
});

function init(items)
{
	let itemList = document.getElementById("items");
	let searchField = document.getElementById("search");

	items.forEach(i => {
		let el = document.createElement("div");
		el.setAttribute("tabindex", "2");
		el.textContent = i.name;
		el.dataset.name = i.name;
		el.addEventListener("keydown", ev => {
			switch (ev.code) {
				case "ArrowDown":
				case "KeyJ":
					(ev.target.nextElementSibling ||
					 itemList.firstElementChild).focus();
					break;
				case "ArrowUp":
				case "KeyK":
					(ev.target.previousElementSibling ||
					 itemList.lastElementChild).focus();
					break;
				case "Enter":
					let where = ev.getModifierState("Shift") ? "b" : i.where;
					performAction(i.url, where);
					break;
				case "Escape":
					searchField.focus();
					break;
				default:
					return;
			}
			ev.preventDefault();
		});
		el.addEventListener("click", ev => {
			let where = ev.button == 1 ? "b" : i.where;
			performAction(i.url, where);
		});
		itemList.appendChild(el);
	});

	let firstMatched;

	function matchItems(query) {
		let qlc = query.toLowerCase();
		let elems = itemList.children;
		firstMatched = null;
		for (let i = 0; i < elems.length; i++) {
			let elem = elems.item(i);
			let matched = stringMatches(elem.dataset.name, query);
			elem.dataset.matched = matched;
			if (matched && firstMatched == null)
				firstMatched = elem;
		}
	}

	searchField.addEventListener("input", ev => matchItems(ev.target.value));

	searchField.addEventListener("keydown", ev => {
		if (ev.code === "Enter") {
			if (firstMatched != null)
				firstMatched.focus();
			ev.preventDefault();
		}
	});

	matchItems("");
}

// TODO approximate string matching
function stringMatches(haystack, needle)
{
	return haystack.toLowerCase().indexOf(needle.toLowerCase()) != -1;
}

function performAction(urlTemplate, where)
{
	let queryInfo = {
		active: true,
		currentWindow: true
	};
	chrome.tabs.query(queryInfo, tabs => {
		let url = new URL(tabs[0].url);
		let newUrl = urlTemplate
			.replace("%u", url)
			.replace("%h", url.hostname)
			.replace("%o", url.origin);

		switch (where) {
			case "c":
				chrome.tabs.update({url: newUrl});
				window.close();
				break;
			case "n":
				chrome.tabs.create({
					url: newUrl,
					index: tabs[0].index + 1
				});
				window.close();
				break;
			case "b":
				chrome.tabs.create({
					url: newUrl,
					index: tabs[0].index + 1,
					active: false
				});
				break;
		}
	});
}

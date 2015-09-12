"use strict";

function parseItemsText(text)
{
	let lines = text.split(/\r?\n/);
	let items = [];
	let errors = [];
	let isBlankLine = l => /^\s*(?:\/\/.*)?$/.test(l);

	for (let i = 0; i < lines.length; i++) {
		let name = lines[i];
		if (isBlankLine(name))
			continue;
		i++;
		if (i == lines.length) {
			errors.push("Missing URL for the name <i>" + name + "</i>");
			break;
		}
		let tmp = lines[i];
		if (isBlankLine(tmp)) {
			errors.push("Missing URL for the name <i>" + name + "</i>");
			continue;
		}
		let matches = tmp.match(/^(?:([cn])\s)?\s*(\S+)\s*$/);
		if (matches == null) {
			errors.push("Wrong format of the URL line for the name <i>" + name + "</i>");
			continue;
		}
		let url = matches[2];
		let where = matches[1] || "n";

		items.push({name: name, url: url, where: where});
	}

	return [items, errors];
}

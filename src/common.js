'use strict'

export async function loadLocalTextFile(relPath)
{
	let url   = chrome.runtime.getURL('defconfig.txt')
	let reply = await fetch(url)
	let text  = await reply.text()
	return text
}

export async function getDefaultItemsText()
{
	return loadLocalTextFile('defconfig.txt')
}

export function parseItemsText(text)
{
	let items = []
	let errors = []

	let isBlankLine = line => /^\s*(?:\/\/.*)?$/.test(line)
	let lines = text.split(/\r?\n/)

	for (let i = 0; i < lines.length; i++) {
		let name = lines[i]
		if (isBlankLine(name))
			continue
		i++
		if (i == lines.length) {
			errors.push('Missing URL for the name <i>' + name + '</i>')
			break
		}
		let line = lines[i]
		if (isBlankLine(line)) {
			errors.push('Missing URL for the name <i>' + name + '</i>')
			continue
		}
		let matches = line.match(/^(?:([cnb])\s)?\s*(\S+)\s*$/)
		if (matches == null) {
			errors.push('Wrong format of the URL line for the name <i>' + name + '</i>')
			continue
		}
		let url = matches[2]
		let where = matches[1] || 'n'

		items.push({name: name, url: url, where: where})
	}

	return [items, errors]
}

export async function setItems(itemsText, items=null)
{
	if (!items) {
		let errors
		[errors, items] = parseItemsText(itemsText)
		errors.forEach(console.warn)
	}
	return chrome.storage.sync.set({ items: items, itemsText: itemsText })
}

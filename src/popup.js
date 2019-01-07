'use strict'

document.addEventListener('DOMContentLoaded',
	() => chrome.storage.sync.get('items', config => init(config.items))
)

function init(items)
{
	let itemList = document.getElementById('items')
	let searchField = document.getElementById('search')

	items.forEach((itm, idx) => {
		let el = document.createElement('div')
		el.setAttribute('tabindex', '2')
		el.textContent = itm.name
		el.dataset.name = itm.name
		el.addEventListener('keydown', ev => {
			switch (ev.code) {
				case 'ArrowDown':
				case 'KeyJ':
					for (let i = 1; i < items.length; i++) {
						let j = (idx + i) % items.length
						let next = itemList.children.item(j)
						if (next.dataset.matched === 'true') {
							next.focus()
							break
						}
					}
					break
				case 'ArrowUp':
				case 'KeyK':
					for (let i = 1; i < items.length; i++) {
						let j = (idx - i + items.length) % items.length
						let prev = itemList.children.item(j)
						if (prev.dataset.matched === 'true') {
							prev.focus()
							break
						}
					}
					break
				case 'Enter':
					let where = ev.getModifierState('Shift') ? 'B' : itm.where
					performAction(itm.url, where)
					break
				case 'Escape':
					searchField.focus()
					break
				case 'Backspace':
					searchField.focus()
					return
				default:
					return
			}
			ev.preventDefault()
		})
		el.addEventListener('click', ev => {
			let where = ev.button == 1 ? 'b' : itm.where
			performAction(itm.url, where)
		})
		itemList.appendChild(el)
	})

	let firstMatched

	function matchItems(query) {
		let qlc = query.toLowerCase()
		let elems = itemList.children
		firstMatched = null
		for (let i = 0; i < elems.length; i++) {
			let elem = elems.item(i)
			let matched = stringMatches(elem.dataset.name, query)
			elem.dataset.matched = matched
			if (matched && firstMatched == null)
				firstMatched = elem
		}
	}

	searchField.addEventListener('input', ev => matchItems(ev.target.value))

	searchField.addEventListener('keydown', ev => {
		if (ev.code === 'Enter' || ev.code === 'ArrowDown') {
			if (firstMatched != null)
				firstMatched.focus()
			ev.preventDefault()
		}
	})

	matchItems('')
}

function stringMatches(haystack, needle)
{
	return haystack.toLowerCase().indexOf(needle.toLowerCase()) != -1
}

function performAction(urlTemplate, where)
{
	let queryInfo = {
		active: true,
		currentWindow: true
	}
	chrome.tabs.query(queryInfo, tabs => {
		if (!tabs.length) {
			console.warn('No active tabs?')
			return
		}

		let url = new URL(tabs[0].url)
		let newUrl = urlTemplate
			.replace('%u', encodeURIComponent(url))
			.replace('%h', url.hostname)
			.replace('%o', url.origin)
			.replace('%t', encodeURIComponent(tabs[0].title))

		switch (where.toLowerCase()) {
		case 'c':
			chrome.tabs.update({url: newUrl})
			break
		case 'n':
			chrome.tabs.create({
				url: newUrl,
				index: tabs[0].index + 1,
				openerTabId: tabs[0].id
			})
			break
		case 'b':
			chrome.tabs.create({
				url: newUrl,
				index: tabs[0].index + 1,
				openerTabId: tabs[0].id,
				active: false
			})
			break
		default:
			console.warn(`Unknown target '${where}'`)
			return
		}
	
		if (where == where.toLowerCase())
			window.close()
	})
}

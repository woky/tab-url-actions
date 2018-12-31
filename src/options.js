'use strict'

import {parseItemsText, setItems} from './common.js'

let userText
let saveButton
let messages

document.addEventListener('DOMContentLoaded',
	() => chrome.storage.sync.get('itemsText', ret => init(ret.itemsText))
)

function init(itemsText)
{
	userText   = document.getElementById('itemsText')
	saveButton = document.getElementById('save')
	messages   = document.getElementById('messages')

	userText.addEventListener('keyup', () => growTextArea(userText))
	userText.value = itemsText
	growTextArea(userText)

	saveButton.addEventListener('click', trySave)
}

function addMessage(msg, bad=false)
{
	let el = document.createElement('div')
	el.textContent = msg
	el.classList.add(bad ? 'bad' : 'good')
	messages.appendChild(el)
}

function clearMessages()
{
	while (messages.firstChild)
		messages.firstChild.remove()
}

async function trySave()
{
	clearMessages()
	let [items, errors] = parseItemsText(userText.value)
	if (errors.length) {
		for (let err of errors)
			addMessage('ERROR: ' + err, bad=true)
	} else {
		await setItems(userText.value, items)
		addMessage('Saved ' + items.length + ' items')
	}
}

function growTextArea(area)
{
	if (area.scrollHeight > area.clientHeight)
		area.style.height = (area.scrollHeight + 1) + 'px'
}

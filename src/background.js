'use strict'
import {setItems, getDefaultItemsText} from './common.js'

chrome.runtime.onInstalled.addListener(
	async details => {
		if (details.reason == 'install')
			await setItems(await getDefaultItemsText())
	}
)

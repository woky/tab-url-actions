'use strict';
import {setDefaultItems} from './common.js'

let DEBUG = true

chrome.runtime.onInstalled.addListener(
	async details => {
		if (DEBUG || details.reason == 'install')
			await setItems(await getDefaultItemsText())
	}
)

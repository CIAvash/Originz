const addonPage = require('addon-page');
const data = require('self').data;
const pageMod = require('page-mod');
const contextMenu = require('context-menu');
const tabs = require('tabs');
const { Hotkey } = require('hotkeys');
let prefs = require('simple-prefs');
let Request = require('request').Request;

// Storing current hotkey(s). Will be used in setHotkey()
let currentPref = { viewSrcHotkey: prefs.prefs['viewSourceHotkey'] };

// 'origins' will hold sources list, add-on URL, prefs, languages and current source URL
let origins = {};
origins.addonURL = data.url('index.html');
origins.prefs = { wrapLongLines: prefs.prefs['wrapLongLines'], beautify: prefs.prefs['beautify'] };

// Creating Origins context menu
originsMenu = contextMenu.Menu({
    label: 'Originz',
    image: data.url('img/icon16.png'),
    context: contextMenu.PageContext(),
    contentScriptFile: [data.url('js/source-finder.js'), data.url('js/context-menu.js')],
    items: [],
    onMessage: function(pageData) {
	switch(pageData.msgType) {
	case 'Sources':
            // Destroy old items
	    if (this.items.length > 0) {
                // Storing items' length, beacuse it will change when an item gets destroyed
		let itemCount = this.items.length;
		for (let i=0; i<itemCount; i++)
		    this.items[0].destroy();
	    }
            // Creating new items
	    let subSourceItems = new Array;
	    for (let i=0; i<pageData.sources.length; i++) {
                let img;
                if (pageData.sources[i].type === 'HTML')
                    img = 'html';
                else if (pageData.sources[i].type === 'Stylesheet')
                    img = 'css';
                else if (pageData.sources[i].type === 'Script')
                    img = 'javascript';

		subSourceItems[i] = contextMenu.Item({
		    label: pageData.sources[i].name,
                    image: data.url('img/' + img + '16.png'),
		    data: pageData.sources[i].url
		});
		this.addItem(subSourceItems[i]);
	    }
	    break;
	case 'Source URL':
            viewSource(pageData.url, pageData.srcList, pageData.language);
	    break;
	}
    }
});

// pageMod will be attached to add-on's page(index.html)
pageMod.PageMod({
    include: origins.addonURL,
    contentScriptFile: [data.url('js/jquery.min.js'),
                        data.url('fancybox/jquery.fancybox.pack.js'),
                        data.url('js/jquery.ddslick.min.js'),
                        data.url('js/alertify.min.js'),
                        data.url('js/beautify.js'),
                        data.url('js/beautify-html.js'),
                        data.url('js/beautify-css.js'),
                        data.url('js/keymaster.min.js'),
                        data.url('js/content-script.js')
                       ],
    contentStyleFile: data.url('css/style.css'),
    onAttach: function(worker) {
        // Send the data
        worker.port.emit('data', origins);
        // On 'request', get(request) the source
        worker.port.on('request', function(srcUrl) {
            Request({
                url: srcUrl,
                onComplete: function(response) {
                    // Send the response's text and http headers back
                    worker.port.emit('response', { text: response.text, headers: response.headers });
                }
            }).get();
        });
        // On 'new request', reset the data and reload the add-on's page
        worker.port.on('new request', function(data) {
            origins = data;
            worker.tab.reload();
        });
        // On 'prefs', set new preferences
        worker.port.on('prefs', function(pref) {
            prefs.prefs['wrapLongLines'] = pref['wrapLongLines'];
            prefs.prefs['beautify'] = pref['beautify']
        });
    }
});

function viewSource(srcUrl, srcList, language) {
    origins.url = srcUrl;
    origins.list = srcList;
    origins.language = language;
    tabs.open(origins.addonURL);
}

// List of hotkeys
let hotkeyList = ['viewSourceHotkey'];

// Function for setting hotkeys
function setHotkey(prefName) {
    let pref = prefs.prefs[prefName];
    let hotkey;
    if (pref.length === 2) {
        if (pref[0] === currentPref[prefName]) {
            hotkey = pref[1];
        } else if (pref[1] === currentPref[prefName]) {
            hotkey = pref[0];
        } else {
            hotkey = currentPref[prefName];
        }
    } else if (pref.length === 1) {
        hotkey = pref;
    } else {
        hotkey = currentPref[prefName];
    }
    if (hotkey) {
        if (/[a-zA-Z0-9]/.test(hotkey))
            for (let i=0; i<hotkeyList.length; i++)
                if (prefName !== hotkeyList[i])
                    if (hotkey === prefs.prefs[hotkeyList[i]])
                        hotkey = currentPref[prefName];
        else
            hotkey = currentPref[prefName];
    }
    prefs.prefs[prefName] = hotkey;
    currentPref[prefName] = hotkey;
    if(prefName === 'viewSourceHotkey') {
        if(viewSourceHotkey) viewSourceHotkey.destroy();
        if(hotkey) viewSrcHotkey(hotkey);
    }
}

// Function for creating the 'view source' hotkey
function viewSrcHotkey(hotkey) {
    viewSourceHotkey = Hotkey({
        combo: 'accel-shift-' + hotkey,
        onPress: function() {
            let hotkeyWorker = tabs.activeTab.attach({
                contentScriptFile: [data.url('js/source-finder.js'), data.url('js/hotkey-script.js')],
                onMessage: function(pageData) {
                    viewSource(pageData.srcList[0].url, pageData.srcList, pageData.language);
                    this.destroy();
                }
            });
            hotkeyWorker.postMessage();
        }
    });
}

function setPref(prefName) {
    origins.prefs[prefName] = prefs.prefs[prefName];
}

// Initializing hotkey
if (prefs.prefs['viewSourceHotkey']) {
    var viewSourceHotkey;
    setHotkey('viewSourceHotkey');
}

// Adding prefs listeners
prefs.on('wrapLongLines', setPref);
prefs.on('beautify', setPref);
prefs.on('viewSourceHotkey', setHotkey);
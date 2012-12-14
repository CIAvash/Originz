self.on("context", function(node) {
    if (document.URL === 'resource://jid1-1rwfet7lgmysbq-at-jetpack/originz/data/index.html')
        return false;
    pageData = findSources();
    if(pageData.srcList.length > 0) {
	self.postMessage({
            sources: pageData.srcList,
            msgType: 'Sources'
        });
        return true;
    }
});

self.on("click", function(node, data) {
    self.postMessage({
        url: data,
        srcList: pageData.srcList,
        language: pageData.language,
        msgType: 'Source URL'
    });
});
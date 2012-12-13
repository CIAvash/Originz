self.on('message', function() {
    let pageData = findSources();
    if (pageData.srcList.length > 0)
        self.postMessage(pageData);
});
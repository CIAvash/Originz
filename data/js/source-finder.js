const srcNamePatt = /.+\/([^\/]+)\/?$/;

function findSources() {
    let srcList = new Array;
    let language = {};
    if (document.contentType === 'text/html') {
        srcList[0] = {
            url: document.URL,
            type: 'HTML',
            name: document.title +
                (srcNamePatt.test(document.URL) ?
                 (' [' + srcNamePatt.exec(document.URL)[1] + ']') :
                 document.URL)
        }
        language[document.URL] = 'markup';
        let links = document.getElementsByTagName("link");
        let scriptTags = document.getElementsByTagName("script");
        for (let i=0; i<links.length; i++)
	    if (links[i].rel === "stylesheet") {
                srcList.push({
                    url: links[i].href,
                    type: 'Stylesheet',
                    name: srcNamePatt.exec(links[i].href)[1]
                });
                language[links[i].href] = 'css';
            }
        for (let i=0; i<scriptTags.length; i++)
	    if (scriptTags[i].src) {
	        srcList.push({
                    url: scriptTags[i].src,
                    type: 'Script',
                    name: srcNamePatt.exec(scriptTags[i].src)[1]
                });
                language[scriptTags[i].src] = 'javascript';
            }
    }
    else if (document.contentType === 'text/css') {
        srcList[0] = {
            url: document.URL,
            type: 'Stylesheet',
            name: srcNamePatt.exec(document.URL)[1]
        };
        language[document.URL] = 'css';
    }
    else if ((document.contentType === 'text/plain' && /.+\.js$/.test(document.URL)) ||
             document.contentType === 'application/javascript' ||
             document.contentType === 'application/x-javascript' ||
             document.contentType === 'text/javascript') {
        srcList[0] = {
            url: document.URL,
            type: 'Script',
            name: srcNamePatt.exec(document.URL)[1]
        };
        language[document.URL] = 'javascript';
    }
    return { srcList: srcList, language: language };
}
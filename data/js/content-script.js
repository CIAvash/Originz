let sourceCode = $('#source');
let dashboard = $('#dashboard');
let srcList = $('#src-list');
let wrapCheckbox = $('#wrap-checkbox');
let beautifyCheckbox = $('#beautify-checkbox');
let srcDetails = $('#src-details');
let totalLines;
let hline;                      // Highlighted line
let origins;

// Getting page and add-on data
self.port.on('data', function(data) {
    origins = data;

    $('title').text('Origins - ' + origins.url);

    self.port.emit('request', origins.url);
});

// Getting response
self.port.on('response', function(response) {
    // Adding language class to #source
    sourceCode.addClass('language-' + origins.language[origins.url]);

    let code;
    if (origins.prefs['beautify']) {
        beautifyCheckbox.attr('checked', '');
        if (origins.language[origins.url] === 'markup')
            code = style_html(response.text);
        else if (origins.language[origins.url] === 'css')
            code = css_beautify(response.text);
        else if (origins.language[origins.url] === 'javascript')
            code = js_beautify(response.text);
    }
    else
        code = response.text;

    // Add code to #source
    sourceCode.text(code);

    // Generating html code for showing http headers
    let headers = '';
    for (let header in response.headers)
        headers += '<div><strong>' + escapeHTML(header) + '</strong>: ' + escapeHTML(response.headers[header]) + '</div>';
    $('#src-info').html(headers);

    // Telling document to highlight the code
    document.defaultView.postMessage('highlight', origins.addonURL);
});

// Doing the things needed to be done after the code is highlighted
document.defaultView.addEventListener('message', function(e) {
    if (e.data === 'highlighted') {
        // Binding mousemove for showing and hiding dashboard
        let mouseIn = false;
        let mouseOn = false;
        $(document).mousemove(function(e) {
            if (e.clientY <= 5) {
                if(!mouseIn) {
                    mouseIn = true;
                    dashboard.css({
                        'top': '0',
                        'left': $(window).width()/2 - dashboard.width()/2
                    });
                }
            }
            else {
                if(mouseIn && !mouseOn) {
                    mouseIn = false;
                    $('#src-list').ddslick('close');
                    dashboard.css('top', '-140px');
                }
            }
        });

        dashboard.hover(
            function() {
                mouseOn = true;
                if (!mouseIn) {
                    mouseIn = true;
                    $(this).css('top', '0');
                }
            },
            function() {
                mouseOn = false;
            }
        );

        $(window).resize(function() {
            $('.dd-options').css('max-height', $(this).height() - 100);
            if(mouseIn)
                dashboard.css({
                    'top': '0',
                    'left': $(this).width()/2 - dashboard.width()/2
                });
        });

        // Generating the source list
        let sources = '';
        for (let i=0; i<origins.list.length; i++) {
            // Image name, based on language
            let img;
            if (origins.list[i].type === 'HTML')
                img = 'html';
            else if (origins.list[i].type === 'Stylesheet')
                img = 'css';
            else if (origins.list[i].type === 'Script')
                img = 'javascript';

            sources += '<option value="' + escapeHTML(origins.list[i].url) + '"' +
                           ' data-imagesrc="img/' + escapeHTML(img) + '.png"' +
                           ' data-description="' + escapeHTML(origins.list[i].url) + '" ' +
                           ((origins.list[i].url === origins.url) ? 'selected' : '') +
                           '>' +
                           escapeHTML(origins.list[i].name) + '</option>';
        }
        srcList.append(sources);

        // Generating the 'Other Sources' context menu
        let srcItems = '';
        for (let i=0; i<origins.list.length; i++) {
            if (origins.list[i].url === origins.url)
                continue;
            // Image name, based on language
            let img;
            if (origins.list[i].type === 'HTML')
                img = 'html';
            else if (origins.list[i].type === 'Stylesheet')
                img = 'css';
            else if (origins.list[i].type === 'Script')
                img = 'javascript';

            srcItems += '<menuitem label="' + escapeHTML(origins.list[i].name) + '"' +
                ' icon="img/' + escapeHTML(img) + '16.png"' +
                ' data-url="' + escapeHTML(origins.list[i].url) + '" ' +
                '>' +
                '</menuitem>';
        }
        if (srcItems) {
            $('#src-list').after('<menu type="context" id="src-menu">' +
                                 '<menu label="Other Sources" icon="img/icon16.png">' +
                                 srcItems +
                                 '</menu></menu>'
                                );
            $('#src-menu menu menuitem').click(function() {
                origins.url = $(this).attr('data-url');
                requestSource();
            });
        }

        // Initialize ddslick
        srcList.ddslick({
            width: 350,
            onSelected: function(data){
                if (data.selectedData.value !== origins.url) {
                    origins.url = data.selectedData.value;
                    requestSource();
                }
            }
        });

        $('.dd-options').css('max-height', $(window).height() - 100);

        srcDetails.append('<a id="src-url" href="' + escapeHTML(origins.url) + '" target="_blank">' +
                          escapeHTML(origins.url) +
                          '</a>'
                         );

        // Initialize fancybox
        $('.fancybox').fancybox();

        beautifyCheckbox.change(function () {
            if ($(this).attr('checked'))
                origins.prefs['beautify'] = true;
            else
                origins.prefs['beautify'] = false;
            self.port.emit('prefs', origins.prefs);
            requestSource();
        });

        wrapCheckbox.change(function () {
            if ($(this).attr('checked')) {
                origins.prefs['wrapLongLines'] = true;
                sourceCode.addClass('wrap-lines');
            } else {
                origins.prefs['wrapLongLines'] = false;
                sourceCode.removeClass('wrap-lines');
            }
            self.port.emit('prefs', origins.prefs);
        });

        if (origins.prefs['wrapLongLines']) {
            sourceCode.addClass('wrap-lines');
            wrapCheckbox.attr('checked', '');
        }

        $('body').css('background-color', sourceCode.parent().css('background-color'));
        
        totalLines = $('.line').length;
        srcDetails.append('<div id="total-lines">Lines: ' + escapeHTML(totalLines.toString()) + '</div>');
        
        sourceCode.append('<div id="highlight-line"></div>');
        hline = $('#highlight-line');

        // Defining keyboard shortcuts
        key('g', goToLine);
        key('i', function() { $.fancybox($('.fancybox')); });
        key('w', function() { wrapCheckbox.click(); });
        key('b', function() { beautifyCheckbox.click(); });
        key('l', function() { alertify.log('Total Lines: ' + totalLines); });
    }
}, false);

function requestSource() {
    $('body').hide();
    setTimeout(function() { self.port.emit('new request', origins); }, 50);
}

function goToLine() {
    alertify.prompt('Enter line number', function(e, input) {
        if (e) {
            let lineNumber = input;
            if (/\d+/.test(lineNumber) && lineNumber > 0 && lineNumber <= totalLines) {
                let line = $('.line[data-line="'+lineNumber+'"]');
                let nextLine = $('.line[data-line="'+(++lineNumber)+'"]');
                if (line) {
                    $(document).scrollLeft(0).scrollTop(line.position().top + 1);
                    hline.css({
                        'height': nextLine.position() ? nextLine.position().top - line.position().top : line.height(),
                        'top': line.position().top,
                        'background-color': '#FFC300'
                    });
                    setTimeout(function() {
                        hline.css('background-color', 'transparent');
                    }, 2500);
                }
            }
        }
    });
}

function escapeHTML(str) str.replace(/[&"<>]/g, function (m) escapeHTML.replacements[m]);
escapeHTML.replacements = { "&": "&amp;", '"': "&quot", "<": "&lt;", ">": "&gt;" };
[Originz](https://addons.mozilla.org/en-US/firefox/addon/originz/)
==================================================================

Description
-----------

Originz is a Firefox add-on for viewing page sources, including HTML, style sheets and scripts. It uses [Prism](http://prismjs.com/) syntax highlighter and has options for beautifying(unminifying) source code and wrapping long lines.

When you right-click on a page, you can see a list of sources in the Originz menu. Each item(source) has an icon indicating its type. By clicking on a source, you can view it in a new tab.

There is a dashboard which will be visible whenever you move your mouse cursor to the top of the page.

Using the dashboard, you can:

* See a list of sources and select a source
* Wrap long lines
* Beautify(unminify) the code
* View source info(HTTP headers returned from server)
* See and use the source URL
* See total lines

Things you can do with keyboard:

* `Ctrl+Shift+g` - View page source
* `w` - Wrap long lines
* `b` - Beautify code
* `i` - View source info
* `l` - See total lines
* `g` - Go to line

You can also see the list of sources in context menu. For viewing a source, just right-click and select a source from `Other Sources` menu. This can be particularly useful if you want to select another source using keyboard.

From the Preferences/Options, you can enable/disable `Wrap Long Lines` and `Beautify` and change the shortcut key(for viewing page source).

Notes
-----

* Highlighting large codes and inserting them to page can be slow. But since async in Prism is enabled and Web Workers are used, highlighting the code won't block the UI, but inserting it will.
* Beautifying large codes can be slow and block the UI or even make the browser unresponsive. In this case you may want to wait, continue loading script if you are asked to stop it, or stop it.

Libraries and icons used in this project
----------------------------------------

Libraries:

* [jQuery](http://jquery.com/)
* [Prism](http://prismjs.com/)
* [JS Beautifier](https://github.com/einars/js-beautify)
* [Alertify](https://github.com/fabien-d/alertify.js)
* [Keymaster](https://github.com/madrobby/keymaster)
* [ddSlick](http://designwithpc.com/Plugins/ddSlick)
* [fancyBox](https://github.com/fancyapps/fancyBox)

Icons:

* Earth icon from [Human-O2 iconset](https://schollidesign.deviantart.com/art/Human-O2-Iconset-105344123) by [schollidesign](https://schollidesign.deviantart.com/)
* HTML, CSS, JS icons from [Web Developer iconset](http://www.iconarchive.com/show/developer-icons-by-graphics-vibe.html) by [GraphicsVibe](http://www.iconarchive.com/artist/graphics-vibe.html)
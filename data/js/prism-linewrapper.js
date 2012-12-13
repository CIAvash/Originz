(function(){

    if(!window.Prism) {
        return;
    }

    Prism.hooks.add('between-highlight', function(env) {
        var lines = env.highlightedCode.split(/\r?\n/);
        for (var i=0; i<lines.length; i++)
            lines[i] = '<span class="line" data-line="' + (i+1) + '"></span>' + lines[i];
        env.highlightedCode = lines.join('\n');
    });

})();
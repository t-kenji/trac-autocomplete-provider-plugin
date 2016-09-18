jQuery(document).ready(function ($) {

    $.getScript('autocomplete/js/autocomplete_dist.js', function () {
        strategies = [];
        getStrategies().forEach(function (strategy) {
            strategies.push({
                id: strategy.id,
                match: strategy.match,
                search: function (term, callback) {
                    callback($.map(strategy.candidates, function (word) {
                        return word.indexOf(term) === 0 ? word : null;
                    }));
                },
                template: strategy.template,
                replace: strategy.replace,
                index: strategy.index
            });
        });

        $('.wikitext').textcomplete(strategies, {
            listPosition: function (pos) {
                this.$el.css({
                    top: pos.top - parseInt($('body').css('margin-top'), 10),
                    left: pos.left
                });
                return this;
            }
        });
    });
});

jQuery(document).ready(function ($) {

    strategies = [];
    strategy_data.forEach(function (strategy) {
        strategies.push({
            id: strategy.id,
            match: new RegExp(strategy.match),
            search: function (term, callback) {
                callback($.map(strategy.candidates, function (word) {
                    return word.indexOf(term) !== -1 ? word : null;
                }));
            },
            template: new Function('value', strategy.template),
            replace: new Function('value', strategy.replace),
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

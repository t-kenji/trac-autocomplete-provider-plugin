$(() => {
    strategies = [];
    wikicomplete_strategies.forEach((strategy) => {
        strategies.push({
            id: strategy.id,
            match: new RegExp(strategy.match),
            search (term, callback) {
                callback($.map(strategy.source, (word) => {
                    if (typeof(word) === 'string') {
                        return word.indexOf(term) !== -1 ? {'value': word} : null;
                    } else {
                        return word.value.indexOf(term) !== -1 ? word : null;
                    }
                }));
            },
            template: new Function('item', strategy.template),
            replace: new Function('item', strategy.replace),
            index: strategy.index,
        });
    });

    $('.wikitext').textcomplete(strategies, {
        listPosition (pos) {
            this.$el.css({
                top: pos.top - parseInt($('body').css('margin-top'), 10),
                left: pos.left
            });
            return this;
        },
        maxCount: 999,
        debounce: 200,
    });
});

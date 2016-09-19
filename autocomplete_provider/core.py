# -*- coding: utf-8 -*-

import os
import re
from genshi.builder import tag

from trac.core import *
from trac.web.api import IRequestFilter
from trac.web.chrome import ITemplateProvider, \
                            add_script, add_script_data, add_stylesheet

from api import IStrategyAdapter

class AutocompleteProvider(Component):
    """
    Allows for autocomplete in textarea  from https://github.com/yuku-t/jquery-textcomplete
    """
    implements(IRequestFilter, ITemplateProvider)

    JS_DIR = 'autocomplete/js'
    CSS_DIR = 'autocomplete/css'

    adapters = ExtensionPoint(IStrategyAdapter)

    def __init__(self):
        self.strategies = []

        for adapter in self.adapters:
            strategy = adapter.add_strategy()
            if strategy:
                self.strategies.append(strategy)

    # ITemplateProvider methods

    def get_htdocs_dirs(self):
        from pkg_resources import resource_filename

        return [('autocomplete', resource_filename(__name__, 'htdocs'))]

    def get_templates_dirs(self):
        return []

    # IRequestFilter methods
    
    def pre_process_request(self, req, handler):
        return handler

    def post_process_request(self, req, template, data, content_type):
        if template is not None and template in ('ticket.html', 'bs_ticket.html',
                                                 'wiki_edit.html', 'bs_wiki_edit.html'):
            add_stylesheet(req, self.CSS_DIR + '/autocomplete.css')
            add_script(req, self.JS_DIR + '/jquery.textcomplete.min.js')
            add_script(req, self.JS_DIR + '/autocomplete.js')
            add_script_data(req, { 'strategy_data': self.strategies })
        return template, data, content_type

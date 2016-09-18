# -*- coding: utf-8 -*-

import os
import re
from genshi.builder import tag

from trac.core import *
from trac.web.api import IRequestFilter, IRequestHandler
from trac.web.chrome import ITemplateProvider, \
                            add_script, add_stylesheet

from api import IStrategyAdapter

class AutocompleteProvider(Component):
    """
    Allows for autocomplete in textarea  from https://github.com/yuku-t/jquery-textcomplete
    """
    implements(IRequestFilter,
               IRequestHandler,
               ITemplateProvider)

    JS_DIR = 'autocomplete/js'
    CSS_DIR = 'autocomplete/css'

    adapters = ExtensionPoint(IStrategyAdapter)

    """
    strategies = [
        {
            'id': 'mension',
            'match': '/\B@(\w*)$/',
            'candidates': [
                'ktakahashi',
                'ttomimoto',
                'mhirobe',
                'hnishitai'
            ],
            'template': 'function(mension) { return mension; }',
            'replace': 'function(mension) { return "@" + mension + " "; }',
            'index': 1
        }
    ]
    """

    def __init__(self):
        self.strategies = []

        for adapter in self.adapters:
            strategy = adapter.add_strategy()
            if strategy:
                self.strategies.append(strategy)

    # IRequestHandler methods

    def match_request(self, req):
        match = re.match(r'^/[\w\-/]+/autocomplete/js/autocomplete_dist\.js$', req.path_info)
        return match

    def process_request(self, req):
        script = 'function getStrategies() { return ['
        for i in self.strategies:
            script += '{{ id: "{id}", match: {match}, candidates: {candidates}, template: {template}, replace: {replace}, index: {index} }},'.format(**i)
        script += ']; }'
        
        req.send(script, 'text/javascript')

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
        if template is not None and template in ('ticket.html'):
            add_stylesheet(req, self.CSS_DIR + '/autocomplete.css')
            add_script(req, self.JS_DIR + '/jquery.textcomplete.min.js')
            add_script(req, self.JS_DIR + '/autocomplete.js')
        return template, data, content_type

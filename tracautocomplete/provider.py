# -*- coding: utf-8 -*-

import os
import re

from trac.core import *
from trac.web.api import IRequestFilter
from trac.web.chrome import (
    ITemplateProvider,
    add_script, add_script_data, add_stylesheet
)

from api import IWikiAutocompleteProvider


class WikiAutocompleteProvider(Component):
    """
    Allows autocompletion on textarea by https://github.com/yuku/textcomplete
    """

    implements(IRequestFilter, ITemplateProvider)

    JS_DIR = 'autocomplete/js'
    CSS_DIR = 'autocomplete/css'

    providers = ExtensionPoint(IWikiAutocompleteProvider)

    def __init__(self):
        self.strategies = []

        for provider in self.providers:
            self.strategies.append(provider.add_strategy())

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
        path_with_query = '?'.join([e for e in (req.path_info, req.query_string) if e != ''])
        matcher = [
            'newticket',
            'ticket/[\d]+',
            'wiki/[\w%/+-]*\?action=edit',
            'blog/',
        ]
        m = re.match(r'^/(?:{})'.format('|'.join(matcher)),
                     path_with_query)
        if m is not None:
            add_stylesheet(req, self.CSS_DIR + '/wikicomplete.css')
            add_script(req, self.JS_DIR + '/jquery.textcomplete.min.js')
            add_script(req, self.JS_DIR + '/wikicomplete.js')
            add_script_data(req, {'wikicomplete_strategies': self.strategies})
        return template, data, content_type

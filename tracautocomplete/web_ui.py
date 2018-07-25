# -*- coding: utf-8 -*-

import re

from trac.core import *
from trac.web.api import IRequestFilter
from trac.web.chrome import (
    Chrome,
    add_script, add_script_data, add_stylesheet
)


class ComplementUsers(Component):
    """
    Allow autocomplete on input of users
    """

    implements(IRequestFilter)

    JS_DIR = 'autocomplete/js'
    CSS_DIR = 'autocomplete/css'

    def __init__(self):
        try:
            from avatar.backend import AvatarBackend
            self.avatar_backend = AvatarBackend(self.env, self.config)
        except:
            self.avatar_backend = None

    # IRequestFilter methods

    def pre_process_request(self, req, handler):
        return handler

    def post_process_request(self, req, template, data, content_type):
        if template in ('timeline.html',
                        'query.html',
                        'ticket.html',
                        'fullblog_view.html', 'fullblog_edit.html',
                        'hours_timeline.html',):
            users = [{'value': name, 'label': nickname, 'email': email} \
                     for name, nickname, email in self.env.get_known_users()]

            from avatar.web_ui import AvatarProvider
            if self.env.is_component_enabled(AvatarProvider) and self.avatar_backend:
                self.avatar_backend.clear_auth_data()
                for user in users:
                    self.avatar_backend.collect_author(user['value'])
                self.avatar_backend.lookup_author_data()
                for user in users:
                    user['icon'] = self.avatar_backend.generate_avatar(user['value'], 'icon', '30').render()

            Chrome(self.env).add_jquery_ui(req)
            add_stylesheet(req, self.CSS_DIR + '/complementusers.css')
            add_script(req, self.JS_DIR + '/complementusers.js')
            add_script_data(req, {'complementusers': users})

        return template, data, content_type

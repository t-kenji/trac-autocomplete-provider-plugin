# -*- coding: utf-8 -*-

from trac.core import *

class IWikiAutocompleteProvider(Interface):
    """
    """
    def add_strategy():
        """
        Setup autocomplete strategy
        """

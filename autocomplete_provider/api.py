# -*- coding: utf-8 -*-

from trac.core import *

class IStrategyAdapter(Interface):
    def add_strategy():
        """Setup strategy"""

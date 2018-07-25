from setuptools import find_packages, setup

version='0.3'

setup(
    name='TracAutocompletePlugin',
    url='https://github.com/t-kenji/trac-autocomplete-plugin',
    long_description='This plugin extends autocompletion of users, keywords and more.',
    author='t-kenji',
    author_email='protect.2501@gmail.com',
    version=version,
    license = 'BSD', # the same as Trac

    install_requires = ['Trac >= 1.2'],
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    include_package_data=True,
    entry_points = {
        'trac.plugins': [
            'autocomplete.provider = tracautocomplete.provider',
            'autocomplete.web_ui = tracautocomplete.web_ui',
        ]
    }
)

from setuptools import find_packages, setup

version='0.2'

setup(
    name='TracAutocompleteProviderPlugin',
    url='https://github.com/t-kenji/trac-autocomplete-provider-plugin',
    long_description='Autocomplete in textarea for trac implementing https://github.com/yuku-t/jquery-textcomplete',
    author='t-kenji',
    author_email='protect.2501@gmail.com',
    version=version,
    license = 'BSD', # the same as Trac

    install_requires = ['Trac >= 1.0'],
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    include_package_data=True,
    entry_points = {
        'trac.plugins': [
            'autocomplete_provider = autocomplete_provider'
        ]
    }
)

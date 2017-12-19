Creating a custom demonstrator
------------------------------

This should be relatively straightforward, see the dovre.html or trondheim.html files in ``/demonstrators`` for syntax.

Using grunt, the task can be simplified a bit:

1. Edit ``/build.config.js``, add a block similar to the one for dovre in the ``demonstrators`` array. Make sure the ``id`` property is unique.
2. Add two files to ``/demonstratorer_content/``: 
   1. ``{{ID}}.js``: This holds the javascript code
   2. ``{{ID}}.txt``: This holds the desription
3. Edit the javascript file
4. Run ``grunt demos`` to build the html-file


Adding a URL-generated demonstrator
-----------------------------------
Edit ``/build.config.js``, add a new entry in the demonstrators-array, similar to 'oslo' (ie: id, name, description and a _relative_ url)


Adding a parameter-based demonstrator
-------------------------------------
Edit ``/build.config.js``, add a new entry in the demonstrators-array, similar to 'keiserstien'.
The params-dictionary can either be handwritten (see api_doc.md) or copied from the generator page. 


 
Adding a new dataset
--------------------

Datasets can either be added to the generator page, or directly to the code. The syntax is similar, see ``common/js/datasets.js`` for examples on how to add datasets to the generator page, and ``demonstratorer_content/dovre.js`` for an example of specialized datasets.

There are several options that can be added to a dataset, see the ``api_doc.md`` file for a list of parameters.



Adding a new template for a dataset
-----------------------------------
The templates used are underscore.js templates, but any templates should work.

To add a new dataset-template, add a new file to ``/templates/datasets``, name it ``{{templatename}}.tmpl``. Edit ``/build.config.js``, and add ``{{templatename}}`` to the ``demoDatasetTemplates`` array.

The template can then be loaded in javascript, using ``KR.Util.getDatasetTemplate({{templatename}})``.


Add new dataset from cartodb
----------------------------
See https://github.com/knreise/demonstratorer/wiki/add-new-dataset-from-cartodb
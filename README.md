Player list
===========
The player list displays the players name and picture with the device size determining the number of columns. Resizing the page will alter the appearance of the list.


Viewing a player
================
When clicked the view button for a player displays a dialog and clicking anywhere on the screen will close it.


Editing a player
================
When clicked the edit button for a player displays a dialog similiar in appearance to the view dialog. This has been done to maintain a consitent look.

The name and point fields can be edited and are validated with error messages appearing at the bottom of the dialog content area.

The save button is disabled while there are any errors. Unlike the view dialog this dialog can only be closed by clicking Save, Cancel or x on the dialog.


Saving a player
===============
A message and icon is displayed at the bottom of the screen while a players details are saved.


Paging & loading more players
=============================
Instead of paging being used as a loading mechanism for players an automated load takes place when the user scrolls to the bottom of the page. There is also a button displayed 
at the base of the page while there are still players that can be loaded. If it is clicked more players will be loaded.

When loaded a sort and filter is automatically applied to the data.

A message and icon is displayed at the bottom of the screen while loading takes place.

Sorting
=======
Two fields are available for sorting: name & total points. This could be easily changed as the key names are passed to the CLICKTOOLS.Sort sort routine


Filtering
=========
Filtering is applied immediately that a value is entered (after a pause of 0.4 seconds) and is ONLY to the currenly loaded players.

Only the display_name is filtered.


Logging
=======
Console messages appear for most actions that take place:
Loading data
Viewing a player
Editing a player
Saving a player
Filtering
Sorting


Frameworks
==========
Knockout & Bootstrap have been used as the frameworks to build the application. Using Bootstrap has ereduced the amount of CCS work required to build & style the page as well as handle responsiveness


Cross-browser testing
=====================
Unit testing has been performed on Firefox 48, Microsoft Edge & Chrome 53.


Files
=====

The main appplication files are:

Index.html - Running this will display the page app.
js/PlayersList.js - Contains the Knockout viewmodel code.
css/PlayersList.css - Contains Styling.


Issues
======
There was an issue with Firefox being unable to return certain of the images initially but this no longer apears to be an issue. From memory i think a 303 code was being returned which seemed to indicate that they had been moved.


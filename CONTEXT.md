# Context

## Terminal workspace

The terminal workspace is the app model that ties together the command terminal, route pane, editor, folders, and openable files.

It owns the catalogue of workspace views and files. The terminal uses it to resolve commands like `ls`, `cat`, `open`, and `source`. The route pane uses it to show web views for folders like `about`, `work`, and `contact`. The editor uses it to open highlighted content and source files.

## Route pane

The route pane is the mini browser beside the terminal. It renders web views for terminal workspace folders.

## Editor

The editor is the read-only file view beside the terminal. It opens file ids from the terminal workspace catalogue.

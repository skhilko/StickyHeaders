# StickyHeaders
A JS library which enables sticky section headers in a scrollable list view.

## Browser Compatibility
 - IE 10+
 - Firefox 35+
 - Chrome 36+
 - Opera 27+

## API
StickyHeaders has a single instance option to pass during initialization.

### Instance Options
- `headerSelector` (string) _required_ - a selector targeting header elements within the list

## Usage
Using StickyHeaders is really simple. It has a pure JavaScript API, plus an optional jQuery plugin.

### Vanilla JS
Include the widget on the page.
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="dist/scripts/stickyheaders.min.js"></script>
    <link rel="stylesheet" href="dist/styles/stickyheaders.min.css">
  </head>
</html>
```
Initialize the widget on the list element.
```javascript
var list = new StickyHeaders(document.getElementById('movies'), {
  headerSelector: '.movies-genre'
});
```

### jQuery
Include the widget on the page.
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="dist/scripts/stickyheaders.jquery.min.js"></script>
    <link rel="stylesheet" href="dist/styles/stickyheaders.min.css">
  </head>
</html>
```
Initialize the widget on the list element.
```javascript
$('movies').stickyHeaders({
  headerSelector: '.movies-genre'
});
```

##Build
StickyHeaders uses `npm`, `bower` and `gulp`.  

Initialize the dependencies:
```shell
npm install
bower install
```

Build the project:
```shell
gulp
```
The results will appear in the `dist` directory.

# Configurations in `uncompiled`

## Basic Settings

`uncompiled` stores its primary configurations in the `config.json` file. By default, it should look something like this:

```json
{
  "title": "uncompiled",
  "menu": [
    {
      "text": "uncompiled",
      "url": "https://aaboyles.github.io/uncompiled",
      "style": "font-family: monospace"
    },
    {
      "text": "Github",
      "url": "https://github.com/aaboyles/uncompiled"
    }
  ]
}
```

Pretty simple, ya? Here's how it works.

### `title`

The `"title"` attribute is the name of your site. It will be used to set the title tag of the page.

### `baseURL`

The `"baseURL"` attribute is the base URL for your site. If you're serving from Github Pages, it will probably be something like "https://<yourGithubUsername>.github.io/<yourSiteName>/". This is used predominantly to fill in where `uncompiled` expects link information but doesn't find any.

### `menu`

The `"menu"` attribute is an array of either Objects or Strings (or a mix of the two). Each element in the array will appear in the menu above all pages in your `uncompiled` site. If the element is just a string, it will just be a string in the menu.

If an element is an object, it is assumed to have `"text"` and `"url"` attributes, which are used to set the text that appears and the URL that clicking on it should lead to, respectively. (If you don't set a `url`, it defaults to [`baseURL`](#baseURL)). If there's a `"style"` attribute present, it will also set the style of that menu element to whatever that attribute is (presumably a valid CSS string, but there's no guardrails here).

## Advanced

If you'd like to make more advanced modifications to the system, you'll need to get your hands a little dirtier.

### Styling

You can add any styling instructions you want to [`style.css`](https://github.com/AABoyles/uncompiled/blob/main/style.css), but just be sure you want them applied to every page on the site.

### Logic

You can extend `uncompiled` with additional markdown functionality by adding additional [showdown extensions](https://github.com/showdownjs/showdown/wiki#list-of-known-extensions). To do this, you'll need to add the relevant script tag to [index.html](https://github.com/AABoyles/uncompiled/blob/main/index.html), probably after showdown but before `index.js`. Then edit the [index.js](https://github.com/AABoyles/uncompiled/blob/main/index.js) file to include the extension in the showdown configurations. Look for `new showdown.Converter({`, followed by an attribute called `"extensions"` which is an array of functions.

## Help!

If you want to do something fancy but are having trouble, [file an issue](https://github.com/AABoyles/uncompiled/issues/new/choose) to let us know.
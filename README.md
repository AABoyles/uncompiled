# `uncompiled`

<p class="subtitle">A Markdown Non-Compiled Non-Blog</p>

## What's this?

A platform for writing static content in markdown, reading it in [Tufte-approved HTML](https://edwardtufte.github.io/tufte-css/), and publishing without ever needing to open a terminal (or leave github, for that matter).

## Quick Start

1. [Use the uncompiled repo as a template for your new repo.](https://github.com/AABoyles/uncompiled/generate)
2. Write your content in [`README.md`](https://github.com/AABoyles/uncompiled/blob/main/README.md) (or any markdown file in any subdirectory you prefer).
3. Configure your site using [config.json](https://github.com/AABoyles/uncompiled/blob/main/config.json) file.
4. [Publish using Github Pages](https://pages.github.com/).

## Features

All the usual features of markdown, made possible by [Showdown](http://showdownjs.com/), plus a few other goodies.

### Tables

Simple tables can be rendered, like so:

| Do Tables Work? |
| --------------- |
| Yup!            |

It's just a regular markdown table.

```md
| Do Tables Work? |
| --------------- |
| Yup!            |
```

### Syntax Highlighting

Syntax Highlighting is made possible by [highlight.js](https://highlightjs.org/)

```javascript
console.log('Hello, World!');
```

In markdown, it's an ordinary [code fence](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks):

~~~md
```javascript
console.log('Hello, World!');
```
~~~

### $\LaTeX$

$\LaTeX$ is supported, via the excellent [KaTeX](https://katex.org/). For example, Here's Bayes Theorem:

$$\Pr(A|B)=\frac{\Pr(B|A)\Pr(A)}{\Pr(B|A)\Pr(A)+\Pr(B|\neg A)\Pr(\neg A)}$$

And the markdown to represent it:

```md
$$\Pr(A|B)=\frac{\Pr(B|A)\Pr(A)}{\Pr(B|A)\Pr(A)+\Pr(B|\neg A)\Pr(\neg A)}$$
```

Note the double dollar-signs. This denotes that the expression should be displayed on its own line. If you want to produce inline $\LaTeX$, use single dollar signs instead.

### Side- and Margin notes

By default, `uncompiled` generates HTML for use with [Tufte CSS](https://edwardtufte.github.io/tufte-css/). One prominent feature of this is almost[I had to write some code to make it easy. <a href="https://github.com/AABoyles/uncompiled/blob/main/index.js">See here, if interested.</a>](sidenote)-out-of-the-box support for side- and margin- notes.

The way to accomplish this is by a minor abuse of the markdown link syntax.[Hattip to <a href="https://vieiro.github.io/xmark/">Xmark, from which this syntax was cribbed.</a>](sidenote) Just create a link for which the text is the content of the sidenote, and the link is simply `sidenote`, like so:

```md
[And Here's the sidenote!](sidenote)
```

If you want to have a side note without a number, [...like this](marginnote) the syntax is the same except you link to `marginnote` instead:

```md
[And Here's the marginnote!](marginnote)
```

Note: if you intend to place links in your side- and margin- notes,

1. You'll need to write the links in HTML (because nested markdown links are a mess to parse).
2. The link will need to extend from wherever it begins in the note to the end of the note (because nested markdown links are a mess to parse).

### Embedded Graphs

[Uh, there are some options.](?q=pages/EmbeddingGraphs.md)

## OK, I'm sold. How do I use it?

### Write a post

Make a regular Markdown document. I like to put them in [the `pages/` directory](https://github.com/AABoyles/uncompiled/tree/main/pages), but you can put them wherever. Just put the relative path in the address when linking to it.

### Configurations

All the global configurations are stored in [`config.json`](https://github.com/AABoyles/uncompiled/blob/main/config.json). We also have [a bit more documentation](https://aaboyles.github.io/uncompiled?q=pages/config.md).

### Addresses

Addressing is managed through the `q` (for "query", but [shorter](https://qntm.org/urls)) HTTP GET parameter. If you don't provide one, it attempts to load `README.md` (i.e. the document you're presently reading.) An explicit link to this document looks like this:

```
https://aaboyles.github.io/uncompiled?q=README.md
```

`q` is a relative path, so you can put content in [another page](https://aaboyles.github.io/uncompiled?q=pages/AnotherPage.md) and then reference it:

```
https://aaboyles.github.io/uncompiled?q=pages/AnotherPage.md
```

### Styling

`uncompiled` uses [Tufte CSS](https://edwardtufte.github.io/tufte-css/) as its base style library, with a few minor overrides. If you'd like to further customize the styling, just edit the [style.css](https://github.com/AABoyles/uncompiled/blob/main/style.css) file to suit your preferences.

## Questions one might ask

### So, why no compiling?

I love the idea of moving as much computation as possible into the browser. Why do this horrible thing, you ask? Because browsers are *awesome*. Javascript has become outrageously fast and powerful, and *everyone is allowed to run it*. I often work in computing environments where I cannot install things, or even download and run unapproved executables. So do millions of other people. But we can all load webpages!

Even for those who can run executables, working in the terminal can be a challenging prospect if you're not already pretty experienced. That's what static blog compilers require. But if we just use javascript libraries to mediate the task of transforming the thing we want to write into the thing we want to see, then the only competencies the user needs are 1) using browsers and 2) writing markdown. (`git` is also very helpful for hosting.)

Uncompiled is a tool in this genre. No compiling, just write your markdown content and see it as HTML.

### So, why not a blog?

What's the difference between a blog and a more general website? I claim the fundamental difference is that blogs are platforms for dated content--whereas websites are the generalization of this that don't require that timestamping. This partly enables cool features like [syndication](https://en.wikipedia.org/wiki/RSS).

We don't compile [(see above)](#sowhynocompiling), so we don't really know what's available the way blog-aware static site generators do. Other more conventional blog platforms (like Wordpress) stores and queries data from a server runtime, but we're restricted to just what can be accomplished with a file server (like Github pages provides) so we can't get an index of the pages at the time of pageload.

The bottom line is, there's no automated way to create the kinds of features we expect from blogs given the constraints I'm trying to respect. So, not really a blog.

### So what's the catch?

It doesn't work especially well with search indexing, so don't count on Google to drive a bunch of traffic to your site. The reason is that the resource that the user sees (crisply-formatted and styled HTML) doesn't exist for the web crawler--all that HTML is generated on-the-fly by the reader's browser. So this is not recommended if you want people to be able to find your content via searching. Works fine for link-sharing (e.g. email, social media) though.

# uncompiled

A Markdown Non-Compiled Non-Blog

## Wat?

### So, why no compiling?

I love the idea of moving as much computation as possible into the browser. Why do this horrible thing, you ask? Because browsers are *awesome*. Javascript has become outrageously fast and powerful, and *everyone is allowed to run it*. I often work in computing environments where I cannot install things, or even download and run unapproved executables. So do millions of other people. But we can all load webpages!

Uncompiled is a tool in this genre. If you'd like to use a tool like Hugo, Hexo, or Gatsby, 

### So, why not a blog?

What's the difference between a blog and a more general website? I claim the fundamental difference is that blogs are platforms for dated content--whereas websites are the generalization of this that don't require that timestamping. This partly enables cool features like [syndication](https://en.wikipedia.org/wiki/RSS).

We don't compile [(see above)](#sowhynocompiling), so

We can't count on a server runtime (like Wordpress requires), so we can't get an index of the pages at the time of pageload.

## Features

Markdown, Obvi. Made possible by [Showdown](http://showdownjs.com/). Specifically:

### Tables

| Do Tables Work? |
| --------------- |
| Yup!            |

### Syntax Highlighting

```javascript
console.log('Hello, World!');
```

### LaTeX

...is supported, via [KaTeX](https://katex.org/). For example, Here's Bayes Theorem:

$$\Pr(A|B)=\frac{\Pr(B|A)\Pr(A)}{\Pr(B|A)\Pr(A)+\Pr(B|\neg A)\Pr(\neg A)}$$

(Note that this is only for off-line math. Inline LaTeX doesn't work--for now.)

## OK, I'm sold. How do I use it?

### Write a post

Make a regular Markdown document. I like to put them in [the `posts/` directory](), but you can put them wherever. Just put the relative path in the address when linking to it.

### Addressess

Addressing is managed through the `post` GET parameter. If you don't provide one, it attempts to load `README.md` (i.e. the document you're presently reading.)

* Here's the explicit link to this document: https://aaboyles.github.io/uncompiled?post=README.md
* Here's a link to a different document: https://aaboyles.github.io/uncompiled?post=posts/AnotherPost.md

### Styling

Just edit the [style.css]() file to suit your preferences.

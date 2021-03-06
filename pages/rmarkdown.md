# `uncompiled` and R

## Introduction

It is possible to generate markdown for `uncompiled` directly from R using `knitr`[For an example of the output, see <a href="http://aaboyles.github.io/q=pages/forecast-degradation.md">Forecast Degradation Functions</a>](sidenote), but there are a few gotchas to be aware of.

## Getting Set Up

If you'd like to use Rmarkdown to generate markdown for use with `uncompiled`, you're probably going to want to open your `uncompiled` directory as an RStudio project. (Whether you clone it or open an already-cloned directory makes no difference). RStudio will do two convenient things for us: First, it will open an R session with the working directory of the project directory; Second, it will make it easy to create new Rmarkdown files in the project. However, we can't quite use these Rmarkdown template files out-of-the-box...

## Managing Titles

Rmarkdown typically includes a block of yaml containing some metadata (document title, author, format, and format-specific configuration). `uncompiled` doesn't have any way of interacting with this data, so it's best for such documents if you remove the yaml block and stick with the more regular conventions of Markdown documents (e.g. start with a `# <title>`)

## Embedding $LaTeX$

Rmarkdown is generally $LaTeX$-friendly, but the way it manages escaping is a little bit different than `uncompiled`. If it appears that `uncompiled` is not parsing the $LaTeX$ properly, try escaping any underscores. There may be other characters that require additional escaping--if you discover any, [please let us know](https://github.com/AABoyles/uncompiled/issues/new/choose).

## Embedding Images

The pipeline from Rmarkdown to a website typically goes something like this:

```
[Rstudio] --Rmarkdown--> [knitr] --markdown--> [pandoc] --html--> [website]
```

The Rmarkdown gets "knit" into regular markdown, along with markdown links to generated file versions of the static plots produced in the document. Then pandoc converts the images to base64 strings and embeds those in compiled the HTML `src` attributes of `img`. To embed graphs generated from R, we can leverage the ["fig.process" chunk option of knitr](https://yihui.org/knitr/options/#plots). Pass it the following function:

```r
base64stringify <- function(path){
  paste("data:image/png;base64", knitr::image_uri(path))
}
```

This manages the task of transforming the png output graphs into their base64 string representations (a task normally performed later in the rmarkdown compile pipeline by pandoc). To use this across all graphs generated by R in the document, you can add the following setting to your top-most code block:

```r
knitr::opts_chunk$set(fig.process=base64stringify)
```

So I basically always include a top code block that looks something like this:

~~~r
```{r setup}
base64stringify <- function(path){
  paste0("data:image/png;base64 ", knitr::image_uri(path))
}
knitr::opts_chunk$set(fig.process=base64stringify)
```
~~~

Once R does this, knitr has gained a superpower for which it usually just leans on `pandoc`: it automatically embeds the raw data content of a plot directly in the text of a markdown file. Now we just need to (ahem) compile the plots.

## Compiling

Apologies if this shocks you! Yes, `uncompiled` is designed to be used without ever *requiring* compiling, but Rmarkdown is a very different beast. The R Code can't be practicably run in the browser along with the markdown engine, so we need to do a compilation step to create the assets coming from R.

If you attempt to knit the rmarkdown document using the handy knitr button in Rstudio, it's going to go through the whole pipeline shown above. Normally this is awesome and we get a nifty HTML document at the end. However, this time we only want the markdown which is an intermediate step of the regular workflow. We can fiddle with the settings to prevent R from deleting the markdown file when it's done creating it, but that still ends up creating the HTML document *which is absolutely useless to us*.

Fortunately, the process, as far as we need it, happens all in R, which means we can just use plain R code to make it happen. All we need to do is pass the path to the Rmarkdown file to `knitr::knit`, like...

```r
knitr::knit('path/to/my.Rmd')
```

Assuming you've followed this guide, Knitr will do the magic with the images and spit out a plain 'ol valid markdown file that you can commit to your `uncompiled` repo. For a live example of this whole thing, see [Forecast Degradation Functions](http://aaboyles.github.io/q=pages/forecast-degradation.md) and its [source Rmarkdown file](https://github.com/AABoyles/aaboyles.github.io/blob/main/pages/forecast-degradation.Rmd).
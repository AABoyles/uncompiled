# Using `uncompiled` from Github

## Introduction

One of the lesser design goals of `uncompiled` was to create a static-website system that could readily and easily be used entirely from Github. The broad principles are outlined in [the Quick Start directions](https://aaboyles.github.io/uncompiled/), but here's a more in-depth discussion.

## Step 0: Have/Set up a Github Account

If you don't have a github account, `uncompiled` may not be for you. If you just want to set up a webstie, try Wordpress.com or Squarespace.

I should also note that Gitlab and Bitbucket also support online markdown editing-and-committing, so if you can publish from those platforms there's no reason you need to stay married to Github for using `uncompiled` in this way.

## Step 1: Clone `uncompiled`

Github introduced "template" repositories awhile back. The idea was that you can use a template to manage all the boilerplate to build a type a project, and then use it to quick-start development on projects of that type. Using a template is sort-of like cloning a regular repository, except it gives you all the files and none of the git history so you get to start fresh. `uncompiled` leverages this pattern.

[Click here to generate a new repo using `uncompiled` as a template.](https://github.com/AABoyles/uncompiled/generate)

The rest of the process is virtually identical to starting a new repository. Once you have your repository, you have two important changes to make, which can be addressed in either order.

## Step 2: Edit `config.json`

You must [configure your site](https://aaboyles.github.io/uncompiled/?q=pages/config.md) by editing the [config.json](https://github.com/AABoyles/uncompiled/blob/main/config.json) file.

## Also Step 2: Write a Markdown File

Write your content in [`README.md`](https://github.com/AABoyles/uncompiled/blob/main/README.md) (or any markdown file in any subdirectory you prefer).

## Step 4: Publish with Github Pages

Finally, you're ready to [Publish using Github Pages](https://pages.github.com/). In the repo page on github, click on the "Settings" Tab and scroll down to "Github Pages". Set the "Source" dropdown to the `main` branch. And that's it! The Github machine will begin grinding away, setting up the infrastructure to serve up your site. It should be ready within a minute or two. Click the link it gives you to see your new Github-hosted, never-left-your-browser `uncompiled` site.

## Steps 5-infinity: Write.

Just because you got it up doesn't mean you're done! Go write more brilliant ideas! Every time you commit, Github will automatically rebuild your site, so all you need to do is create the pages.
#!/bin/bash

MAIN=main
PAGES=gh-pages

set -e

function checkout {
    git checkout $PAGES
    git merge main --no-edit
    echo "Merging $PAGES..."
}

function build {
    npm run build
}

function deploy {
    git add dist -f 
    git commit -m "Deployment commit"
    git subtree push --prefix dist origin $PAGES
    echo "Deploying to $PAGES"
}

function recover {
    git checkout $MAIN
    git status
}

checkout
build
deploy
recover
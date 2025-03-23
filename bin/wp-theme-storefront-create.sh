#!/bin/sh
if [ $# -ne 2 ]; then
    echo "Usage: $0 name slug"
    exit 1
fi

THEME_NAME=$1
THEME_SLUG=$2

THEME=${PWD}/${THEME_SLUG}
ASSETS=${PWD}/${THEME_SLUG}/assets

GIT_BRANCH_NAME=main

#
# SASS
#
mkdir -p ${ASSETS}/sass/frontend/
mv ${THEME}/sass ${ASSETS}/sass/frontend/_s
#
# https://github.com/iworks/storefront-child-theme/archive/refs/heads/${GIT_BRANCH_NAME}.zip
#
wget https://github.com/iworks/storefront-child-theme/archive/refs/heads/${GIT_BRANCH_NAME}.zip

unzip -o ${GIT_BRANCH_NAME}.zip
cp -r storefront-child-theme-${GIT_BRANCH_NAME}/* ${THEME}
cp -r storefront-child-theme-${GIT_BRANCH_NAME}/.gitignore ${THEME}
#
# clean up
#
rm -rf ${GIT_BRANCH_NAME}.zip
rm -rf storefront-child-theme-${GIT_BRANCH_NAME}
rm -rf ${THEME_SLUG}.zip
mv ${THEME_SLUG}/bin/.eslintrc ${THEME_SLUG}/
rm -rf ${THEME_SLUG}/bin

cd ${THEME}

perl -pi -e "s/THEME_SLUG/${THEME_SLUG}/g" $(grep -rl THEME_SLUG)
perl -pi -e "s/THEME_NAME/${THEME_NAME}/g" $(grep -rl THEME_NAME)

STYLE=assets/sass/frontend/style.scss

perl -pi -e 's/^Theme Name.+$/Theme Name: THEME_NAME/' ${STYLE}
perl -pi -e 's/^Theme URI.+$/Theme URI: THEME_URI/' ${STYLE}
perl -pi -e 's/^Author:.+$/Author: THEME_AUTHOR_NAME/' ${STYLE}
perl -pi -e 's/^Author URI:.+$/Author URI: THEME_AUTHOR_URI/' ${STYLE}
perl -pi -e 's/^Description:.+$/Description: THEME_DESCRIPTION/' ${STYLE}
perl -pi -e 's/^Version:.+$/Version: THEME_VERSION.BUILDTIMESTAMP/' ${STYLE}
perl -pi -e 's/^Tested up to:.+$/Tested up to: THEME_TESTED_WORDPRESS/' ${STYLE}
perl -pi -e 's/^Requires PHP:.+$/Requires: THEME_REQUIRES_PHP/' ${STYLE}
perl -pi -e 's/^Text Domain:.+$/Text Domain: THEME_NAME/' ${STYLE}
perl -pi -e 's/^Tags:.+$/Tags: THEME_TAGS/' ${STYLE}
#perl -pi -e 's/^.+$/: THEME_/' ${STYLE}


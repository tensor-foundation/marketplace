# delete old
rm -rf ../tcomp-sdk/src
rm ../tcomp-sdk/package.json
rm ../tcomp-sdk/yarn.lock
rm ../tcomp-sdk/tsconfig.json

# add new
cp -r ./src ../tcomp-sdk/src
cp package.json ../tcomp-sdk/package.json
cp yarn.lock ../tcomp-sdk/yarn.lock
cp tsconfig.json ../tcomp-sdk/tsconfig.json

# fix the new package json
sed -i '' -e 's/tcomp-ts/tcomp-sdk/g' ../tcomp-sdk/yarn.lock
sed -i '' -e 's/tcomp-ts/tcomp-sdk/g' ../tcomp-sdk/package.json
sed -i '' -e 's/@tensor-hq\/tcomp-sdk/@tensor-oss\/tcomp-sdk/g' ../tcomp-sdk/package.json
sed -i '' -e 's/tcomp.git/tcomp-sdk.git/g' ../tcomp-sdk/package.json
sed -i '' -e 's/https:\/\/npm.pkg.github.com/https:\/\/registry.npmjs.org/g' ../tcomp-sdk/package.json
sed -i '' -e 's/pubpush/npmpublish/g' ../tcomp-sdk/package.json
sed -i '' -e 's/yarn npm publish && yarn push/npm publish --access public/g' ../tcomp-sdk/package.json

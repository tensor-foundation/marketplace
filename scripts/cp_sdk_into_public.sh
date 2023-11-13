dest=../tcomp-sdk

# delete old
rm -rf ${dest}/src
rm ${dest}/package.json
rm ${dest}/yarn.lock
rm ${dest}/tsconfig.json

# add new
cp -r ./src ${dest}/src
cp package.json ${dest}/package.json
cp yarn.lock ${dest}/yarn.lock
cp tsconfig.json ${dest}/tsconfig.json

# fix the new package json
sed -i '' -e 's/tcomp-ts/tcomp-sdk/g' ${dest}/yarn.lock
sed -i '' -e 's/tcomp-ts/tcomp-sdk/g' ${dest}/package.json
sed -i '' -e 's/tensorswap-ts/tensorswap-sdk/g' ${dest}/yarn.lock
sed -i '' -e 's/tensorswap-ts/tensorswap-sdk/g' ${dest}/package.json
sed -i '' -e 's/@tensor-hq\/tcomp-sdk/@tensor-oss\/tcomp-sdk/g' ${dest}/package.json
sed -i '' -e 's/@tensor-hq\/tensorswap-sdk/@tensor-oss\/tensorswap-sdk/g' ${dest}/package.json
sed -i '' -e 's/tcomp.git/tcomp-sdk.git/g' ${dest}/package.json
sed -i '' -e 's/https:\/\/npm.pkg.github.com/https:\/\/registry.npmjs.org/g' ${dest}/package.json
sed -i '' -e 's/pubpush/publish:public/g' ${dest}/package.json
sed -i '' -e 's/yarn npm publish && yarn push/npm publish --access public --registry https:\/\/registry.npmjs.org/g' ${dest}/package.json
sed -i '' -e 's/ && yarn tsc --p tsconfig.tests.json//g' ${dest}/package.json

# fix @tensor-hq imports -> @tensor-oss
find ${dest}/src -type f -name "*.ts" -exec sed -i '' -e 's/@tensor-hq\/tensorswap-ts/@tensor-oss\/tensorswap-sdk/g' {} +

pushd ${dest}
yarn
popd

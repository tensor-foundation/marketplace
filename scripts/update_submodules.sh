#https://stackoverflow.com/questions/5828324/update-git-submodule-to-latest-commit-on-origin

push deps/metaplex-mpl
git pull origin master
popd

pushd deps/solana-spl
git pull origin master
popd

pushd deps/tensorswap
git pull origin main
popd

cd ../..
git add .
git commit -m "update submodules to latest"

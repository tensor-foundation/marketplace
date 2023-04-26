#https://stackoverflow.com/questions/5828324/update-git-submodule-to-latest-commit-on-origin

cd deps/metaplex-mpl
git pull origin master

cd ../solana-spl
git pull origin master

cd ../..
git add .
git commit -m "update submodules to latest"

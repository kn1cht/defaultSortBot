# defaultSortBot
add DEFAULTSORT automatically to mediawiki articles.

## Usage

```bash
git clone https://github.com/kn1cht/defaultSortBot.git
cd defaultSortBot
npm install
cp config/default.yaml.example config/default.yaml
vi config/default.yaml
```

## default.yaml

Set your config in default.yaml before run defaultSortBot.

- server: your mediawiki server domain.
- path: relative path for the directory contains `api.php`.
- username: username for mediawiki bot account.
- password: password for mediawiki bot account.


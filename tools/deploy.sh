#/bin/bash

#DO NOT RUN THIS FILE DIRECTLY. USE 'grunt deploy --env=dev --reloadschema=true'

#Update the database values below for your app.

# ----------- ENVIRONMENT / PATH -----------
if [ "$1" == "local" ]; then
  WEBROOT=""
  servers=()
  env=local
  DB_USERNAME="grow-template"
  DB_PASSWORD="gr0w"
  DB_DATABASE="grow-template"
elif [ "$1" == "dev" ]; then
  WEBROOT="/var/www/dev/iheartnorfolk"
  servers=(dev.iheartnorfolk.com)
  env=dev
  DB_USERNAME="grow-template"
  DB_PASSWORD="gr0w"
  DB_DATABASE="grow-template"
elif [ "$1" == "staging" ]; then
  WEBROOT="/var/www/staging/iheartnorfolk"
  servers=(dev.iheartnorfolk.com)
  env=staging
  DB_USERNAME="grow-template"
  DB_PASSWORD="gr0w"
  DB_DATABASE="grow-template"
elif [ "$1" == "prod" ]; then
  #add in the location of your production server path here and remove the echo / exit
  echo "please fill in a production server location and webroot"
  exit
  env=prod
  DB_USERNAME="grow-template"
  DB_PASSWORD="gr0w"
  DB_DATABASE="grow-template"
else
  echo "Please specify an environment ('local', 'dev', 'staging' or 'prod')"
  exit
fi

reload_schema="$2";

echo "env: $env"
echo "WEBROOT: $WEBROOT"
echo "reload_schema: $reload_schema"

if [ "$env" != "local" ]; then
  echo "Creating environment specific .htaccess"

  cp -r ../data ../build/data

  cat ../src/.htaccess-$env-permissions ../src/.htaccess > /tmp/temp-$$ ; mv /tmp/temp-$$ ../build/.htaccess

  echo "Tarring up project..."

  rm -f app.tar

  cd ../build/ && tar -czf ../app.tar * .htaccess && cd ..
fi

# ----------- DEPLOY TO CORRECT SERVER / PATH AND APPLY CORRECT HTACCESS ENVIRONMENT --------------

if [ "$env" == "local" ]; then
  if [ "$reload_schema" == "true" ]; then
    echo "reloading local database"
    mysql -u$DB_USERNAME -p$DB_PASSWORD $DB_DATABASE < ../data/schema.sql
  fi
else
  for server in ${servers[@]}
    do
      echo "Deploying to: $server"
      cat app.tar | ssh $server "echo 'Untarring...';mkdir -p $WEBROOT;tar -xzf - -C $WEBROOT;echo 'Configuring .htaccess to use $env environment...';sed -i 's/ENVIRONMENT.*/ENVIRONMENT $env/;s/RewriteBase.*/RewriteBase \//' $WEBROOT/.htaccess
      if [ "$env" == "development" ] || [ "$env" == "preview" ]; then
        cat $WEBROOT/.htaccess-dev-permissions $WEBROOT/.htaccess > /tmp/temp-$$ ; mv /tmp/temp-$$ $WEBROOT/.htaccess
      fi
      if [ "$reload_schema" == "true" ]; then
        echo "reloading database"
        mysql -u$DB_USERNAME -p$DB_PASSWORD $DB_DATABASE < $WEBROOT/data/schema.sql
      fi
      rm -r $WEBROOT/data
      "
  done
fi

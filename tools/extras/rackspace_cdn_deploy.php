<?

	//This is a sample file for deploying assets to the rackspace CDN.
	//You can fill in the values below and integrate it into the deploy bash script to
	//have it automatically upload to the CDN when deploying to staging or prod.
	
	//FILL IN THESE VALUES
	$staging_container = 'Container_Staging';
	$prod_container = 'Container_Prod';
	$username = 'username';
	$api_key = 'apikey';
	$region = 'IAD';
	
	
	$env = null;
	if(!isset($argv[1])) {
		echo "must pass environment: 'staging' or 'prod'";
		exit();
	} else {
		$env = $argv[1];
		if($env != 'staging' && $env != 'prod') {
			 echo "invalid environment specified. use 'staging' or 'prod'";
			 exit();
		}
	}

	//Download this library as a dependency
	require_once dirname(__FILE__) . '/../src/application/libraries/php-opencloud-master/lib/php-opencloud.php';
	
	print("Connecting to Rackspace CDN...\n");
	
	$endpoint = 'https://identity.api.rackspacecloud.com/v2.0/';
	$credentials = array(
					'username' => $username,
					'apiKey' => $api_key
	);
	
	$rackspace = new \OpenCloud\Rackspace($endpoint, $credentials);
	$objstore = $rackspace->ObjectStore('cloudFiles', $region);
	
	if($env == 'staging') {
		$container = $objstore->Container($staging_container);
	} else if($env == 'prod') {
		$container = $objstore->Container($prod_container);
	}
	
	print("Uploading files to CDN\n");
	
	getDirectory($env, $container, dirname(__FILE__) . '/../build/assets');
	
	function getDirectory($env, $container, $path = '.', $level = 0) {
		$ignore = array('scss', 'cgi-bin','.','..');
		$dh = @opendir($path);
		while(false !== ($file = readdir($dh))) {
			if(! in_array($file, $ignore)) {
				if(is_dir("$path/$file")) {
					getDirectory($env, $container, "$path/$file", ($level + 1));
				} else {
					$filename = preg_replace("/(.*\/)?assets/", "assets", "$path/$file");
					$obj = $container->DataObject();
					echo "$path/$file]\n";
					
					//uncomment and fill in values if you need to add access control headers for cross domain requests
					/*
					//only change the headers on fonts and contents.json
					if(strpos($path, 'assets/fonts') !== FALSE || strpos($file, 'contents.json') !== FALSE) {
						if($env == 'staging') {
							$obj->extra_headers['Access-Control-Allow-Origin'] = 'http://stratos-preview.rdioexclusives.com';
						} else if($env = 'production') {
							$obj->extra_headers['Access-Control-Allow-Origin'] = 'http://stratos.rdioexclusives.com';
						}
					}
					*/
					
					$obj->Create(array('name'=>$filename, 'content_type'=>mime_content_type("$path/$file")), "$path/$file");
			        $publicURL_img =  $obj->PublicURL();
				}
			}
		}
		
		closedir($dh);
	}
	
	print("Asset upload complete\n");
	

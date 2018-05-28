# Wordpress Map Locator

### Getting Started

There are two methods for getting started with this repo.

#### Familiar with Git?
Checkout this repo, zip the files, on your wordpress admin dashboard go to :


git clone git@github.com:bellodaniel/WordpressMapLocator.git
zip WordpressMapLocator
```
On your wordpress admin dashboard
> Plugins
> add new
> upload
> upload, install and activate the plugin 
```

#### Not Familiar with Git?
Download the .zip file and:

```
> Plugins
> add new
> upload
> upload, install and activate the plugin
```


After chosing the right way for you( I would suggest the second, as it simplier), use the shordcode [map_locator] in each post/page you would like to use it.

To update the keywords for searching, you need to do assets > js > map_location.js and update the keywords.
In case the key doesn't work, you would need to update it.
For doing that, you need to generate your own key, in https://developers.google.com/ -- you need to first generate places Api key and after that javascript Map Api key(they should be the same)
After generating the key, replace it to shero_map_locator.php(at the script tag at the very bottom of it) and to map_location.js file.

After doing this, using the shordcode, must work basically everywhere you will need to.
 


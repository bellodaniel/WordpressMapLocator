<?php
/**
 * @package MapLocator
 * Plugin Name: Physical Map Locator
 * Plugin URI: https://www.sherocommerce.com/
 * Description: A custom map locator built for example.
 * Version: 1.0
 * Author: Daniel Bello
 * Author URI: https://www.sherocommerce.com/
 **/
// WP Shortcode to display map on any page or post -> [map_locator]
// Function to call the custom js and css files
// register jquery and style on initialization
    add_action('init', 'register_script');
    function register_script() {
	    wp_register_script( 'custom_scripts', plugins_url('/assets/js/PhysicianLocator.js', __FILE__));
	    wp_register_script( 'custom_location', plugins_url('/assets/js/map_location.js', __FILE__));
	    wp_register_script( 'custom_jquery', plugins_url('/assets/js/jquery.min.js', __FILE__), array('jquery'));

	    wp_register_style( 'new_style', plugins_url('/assets/css/style.css', __FILE__), false, 'all');
	    wp_register_style( 'ie_style', plugins_url('/assets/css/ie.css', __FILE__), false, 'all');
    }
// use the registered jquery and style above
    add_action('wp_enqueue_scripts', 'enqueue_style');
    function enqueue_style(){
	    wp_enqueue_script('custom_scripts');
	    wp_enqueue_script('custom_jquery');
	    wp_enqueue_script('custom_location');

	    wp_enqueue_style( 'new_style' );
	    wp_enqueue_style( 'ie_style' );
    }
?>

<?php function map_physican_locator() { ?>

    <div class="locator">
		<div class="section places-controls">
			<div class="area">
				<input id="search-place" class="controls" type="text"
				       placeholder="Enter Zip Code">
				<span class="error"></span>
			</div>
			<div class="col">
				<div class="select-box">
					<select name="radius" id="radius">
						<option value="5">5 miles</option>
						<option value="10">10 miles</option>
						<option value="20">20 miles</option>
					</select>
				</div>
			</div>
		</div>

		<div class="section places-map">
			<div class="area">
				<div id="map"></div>
			</div>
			<div class="col">
				<div id="places"></div>
			</div>
		</div>
	</div>

    <?php
}
add_shortcode('map_locator', 'map_physican_locator');
?>


<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCj8FiIpntED5oxbdR0Nct72m2ys-i6qRE&libraries=places"></script>
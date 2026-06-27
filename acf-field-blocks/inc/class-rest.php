<?php
/**
 * REST handlers.
 *
 * @package ACFFieldBlocks
 */

namespace ACFFieldBlocks;

use ACFFieldBlocks\Fields;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Rest
 */
class Rest {

	/**
	 * Instance
	 * 
	 * @var ACFFieldBlocks/Rest
	 */
	private static $instance;

	/**
	 * API Namespace
	 * 
	 * @var string
	 */
	public $namespace = 'acf-field-blocks';

	/**
	 * API Version
	 * 
	 * @var string
	 */
	public $version = 'v1';

	/**
	 * Initiator
	 * 
	 * @return Rest()
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register API routes
	 */
	public function register_routes() {
		$namespace = $this->namespace . '/' . $this->version;

		register_rest_route(
			$namespace,
			'/fieldgroups',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_all_field_groups' ),
				'args'                => array(),
				'permission_callback' => function() {
					return current_user_can('publish_posts');
				}
			)
		);

		register_rest_route(
			$namespace,
			'/fields',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_all_fields' ),
				'args'                => array(),
				'permission_callback' => function() {
					return current_user_can('publish_posts');
				}
			)
		);

		register_rest_route(
			$namespace,
			'/values',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_all_values' ),
				'args'                => array(),
				'permission_callback' => function() {
					return current_user_can('publish_posts');
				}
			)
		);
	}

	/**
	 * Get all registered ACF field groups and its fields
	 *
	 * @since  1.0.0
	 * 
	 * @param  \WP_REST_Request $request Request params.
	 * @return array                     List of field groups and its fields.
	 */
	public function get_all_field_groups( \WP_REST_Request $request ) {
		$field_groups = acf_get_field_groups();
		$json         = array();

		if ( empty( $field_groups ) ) {
			return $json;
		}

		foreach ( $field_groups as $field_group ) {
			$post_type = acf_determine_internal_post_type( $field_group['key'] );
			$post      = acf_get_internal_post_type( $field_group['key'], $post_type );

			if ( empty( $post ) ) {
				continue;
			}

			if ( 'acf-field-group' === $post_type ) {
				$post['fields'] = acf_get_fields( $post );
			}

			$post   = acf_prepare_internal_post_type_for_export( $post, $post_type );
			$post['object_types'] = $this->get_object_types( $post );
			$json[] = $post;
		}

		return apply_filters( "acf_field_blocks_rest_field_groups", $json );
	}

	/**
	 * Get the object type of a field group.
	 *
	 * @since  1.0.0
	 * 
	 * @param  array $field_group Field group object.
	 * @return array              Object types.
	 */
	private function get_object_types( $field_group ) {
		$objects = array();
		if ( $field_group['location'] ) {
			foreach ( $field_group['location'] as $i => $rules ) {

				// Determine object types for each rule.
				foreach ( $rules as $j => $rule ) {

					// Get location type and subtype for the current rule.
					$location                = acf_get_location_rule( $rule['param'] );
					$location_object_type    = '';
					$location_object_subtype = '';
					if ( $location ) {
						$location_object_type    = $location->get_object_type( $rule );
						$location_object_subtype = $location->get_object_subtype( $rule );
					}
					$rules[ $j ]['object_type']    = $location_object_type;
					$rules[ $j ]['object_subtype'] = $location_object_subtype;
				}

				// Now that each $rule conains object type data...
				$object_types = array_column( $rules, 'object_type' );
				$object_types = array_filter( $object_types );
				$object_types = array_values( $object_types );
				if ( $object_types ) {
					$object_type = $object_types[0];
				} else {
					continue;
				}

				$object_subtypes = array_column( $rules, 'object_subtype' );
				$object_subtypes = array_filter( $object_subtypes );
				$object_subtypes = array_values( $object_subtypes );
				$object_subtypes = array_map( 'acf_array', $object_subtypes );
				if ( count( $object_subtypes ) > 1 ) {
					$object_subtypes = call_user_func_array( 'array_intersect', $object_subtypes );
					$object_subtypes = array_values( $object_subtypes );
				} elseif ( $object_subtypes ) {
					$object_subtypes = $object_subtypes[0];
				} else {
					$object_subtypes = array( '' );
				}

				// Append to objects.
				foreach ( $object_subtypes as $object_subtype ) {
					$object = acf_get_object_type( $object_type, $object_subtype );

					// fix all terms.
					if ( false === $object ) {
						$object = new \stdClass();
						$object->type    = $object_type;
						$object->subtype = $object_subtype;
						$object->name    = "$object_type/$object_subtype";
						$object->label   = '';
						$object->icon    = '';
					}

					if ( $object ) {
						$objects[ $object->name ] = $object;
					}
				}
			}
		}

		// Reset keys.
		$objects = array_values( $objects );

		return $objects;
	}

	/**
	 * Get all registered ACF fields
	 *
	 * @since  1.0.0
	 * 
	 * @param  \WP_REST_Request $request Request params.
	 * @return array                     List of fields that contains.
	 */
	public function get_all_fields( \WP_REST_Request $request ) {
		$field_groups = acf_get_field_groups();
		$json         = array();

		if ( empty( $field_groups ) ) {
			return $json;
		}

		foreach ( $field_groups as $field_group ) {
			$post_type = acf_determine_internal_post_type( $field_group['key'] );
			$post      = acf_get_internal_post_type( $field_group['key'], $post_type );

			if ( empty( $post ) ) {
				continue;
			}

			if ( 'acf-field-group' === $post_type ) {
				$fields = apply_filters( 'acf_field_blocks_raw_fields', acf_get_fields( $post ), $field_group );

				foreach ( $fields as $field ) {
					if ( empty( $field['key'] ) ) {
						continue;
					}

					$json[ $field['key'] ] = [
						'type'          => $field['type'],
						'label'         => $field['label'],
						'return_format' => $field['return_format'] ?? '',
						'full_label'    => isset( $field['full_label'] ) ? $field['full_label'] : $field['label'],
						'multiple'      => Fields::has_multiple_values( $field ),
					];

					if ( 'taxonomy' === $field['type'] ) {
						$json[ $field['key'] ]['taxonomy'] = $field['taxonomy'];
					}

					if ( 'post_object' === $field['type'] || 'relationship' === $field['type'] ) {
						$json[ $field['key'] ]['post_type'] = $field['post_type'];
					}

					if ( 'textarea' === $field['type'] ) {
						$json[ $field['key'] ]['return_format'] = $field['new_lines'];
					}

					if ( isset( $field['choices'] ) && is_array( $field['choices'] ) ) {
						$json[ $field['key'] ]['choices'] = $field['choices'];
					}
				}
			}
		}

		return apply_filters( 'acf_field_blocks_rest_fields', $json, $field_groups );
	}

	/**
	 * Get all ACF values of an object.
	 *
	 * @since  1.0.0
	 * 
	 * @param  \WP_REST_Request $request Request params.
	 * @return array                     List of values.
	 */
	public function get_all_values( \WP_REST_Request $request ) {
		if ( ! $request->has_param('id') ) {
			return [];
		}

		$post_id = $request->get_param('id');

		if ( empty( $post_id ) ) {
			return [];
		}

		// The id can point at any object, so check object-level access before reading.
		if ( ! $this->current_user_can_read_object( $post_id ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You are not allowed to read the field values of this object.', 'acf-field-blocks' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		$fields = get_field_objects( $post_id, false, true, false );
		$values = array();

		if ( ! $fields ) {
			return [];
		}

		$fields = apply_filters( 'acf_field_blocks_raw_field_values', $fields );
		foreach ( $fields as $field ) {
			$values[ $field['key'] ] = Fields::get_formatted_value( $field['value'], $field );
		}

		return apply_filters( 'acf_field_blocks_rest_values', $values );
	}

	/**
	 * Check whether the current user may read the ACF values of the given object id.
	 *
	 * @since  1.6.3
	 *
	 * @param  int|string $post_id ACF object id.
	 * @return bool                True if the current user may read the object.
	 */
	private function current_user_can_read_object( $post_id ) {
		// Decode the id the same way ACF does, so the check matches what gets read.
		if ( function_exists( 'acf_decode_post_id' ) ) {
			$decoded = acf_decode_post_id( $post_id );
			$type    = $decoded['type'];
			$id      = $decoded['id'];
		} elseif ( is_numeric( $post_id ) ) {
			$type = 'post';
			$id   = $post_id;
		} else {
			return false;
		}

		switch ( $type ) {
			case 'post':
				$id = (int) $id;
				return $id && current_user_can( 'read_post', $id );

			case 'user':
				// Allow your own profile; otherwise require edit access to the user.
				$id = (int) $id;
				return $id && ( get_current_user_id() === $id || current_user_can( 'edit_user', $id ) );

			case 'comment':
				$id      = (int) $id;
				$comment = $id ? get_comment( $id ) : null;
				return $comment && ( current_user_can( 'moderate_comments' )
					|| current_user_can( 'read_post', (int) $comment->comment_post_ID ) );

			case 'term':
				// Terms are public taxonomy data; just confirm it exists.
				$id = (int) $id;
				return $id > 0 && term_exists( $id ) !== null;

			case 'option':
			case 'block':
				// Shared store, not a per-object resource. Already gated by publish_posts.
				return true;

			default:
				// Unknown/sensitive types (blog, woo_order, ...).
				return current_user_can( 'manage_options' );
		}
	}

}
<?php
/**
 * Loader.
 *
 * @package ACFFieldBlocks
 */

namespace ACFFieldBlocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Main
 */
class Fields {

	/**
	 * Load field based on selected source an key
	 * 
	 * @param  array  $attr  Block attributes.
	 * @param  object $block Block
	 * @return array         ACF field object.
	 */
	public static function load_field( $attr, $block ) {
		$source = false;
		$parent = false;

		if ( 'option' === $attr['fieldSource'] ) {
			$source = 'option';
		} elseif ( 'current_term' === $attr['fieldSource'] ) {
			if ( isset( $block->context['termId'] ) && $block->context['taxonomy'] ) {
				$source = $block->context['taxonomy'] . '_' . $block->context['termId'];
			} elseif ( isset( $block->context['acf-field-blocks/term'] ) ) { // backwards compatibility.
				$source = $block->context['acf-field-blocks/term']->taxonomy . '_' . $block->context['acf-field-blocks/term']->term_id;
			} elseif ( is_category() ) {
				$source = 'category_' . get_queried_object()->term_id;
			} elseif ( is_tag() ) {
				$source = 'post_tag_' . get_queried_object()->term_id;
			} elseif ( is_tax() ) {
				$source = get_queried_object()->taxonomy . '_' . get_queried_object()->term_id;
			}
		} elseif ( 'current_user' === $attr['fieldSource'] ) {
			if ( isset( $block->context['acf-field-blocks/user'] ) ) {
				$source = 'user_' . $block->context['acf-field-blocks/user']->ID;
			} elseif ( is_author() ) {
				$source = 'user_' . get_query_var( 'author' );
			}
		} elseif ( 0 === stripos( $attr['fieldSource'], 'specific|post|' ) ) {
			$id     = intval( $attr['fieldSourceValue'] ?? 0 );
			$source = $id > 0 ? $id : false;
		} elseif ( 0 === stripos( $attr['fieldSource'], 'specific|term|' ) ) {
			$parts    = explode( '|', $attr['fieldSource'] );
			$taxonomy = $parts[2] ?? '';
			$id       = intval( $attr['fieldSourceValue'] ?? 0 );
			$source   = ( $taxonomy && $id > 0 ) ? $taxonomy . '_' . $id : false;
		} elseif ( 'specific|user' === $attr['fieldSource'] ) {
			$id     = intval( $attr['fieldSourceValue'] ?? 0 );
			$source = $id > 0 ? 'user_' . $id : false;
		} elseif ( 'url_param' === $attr['fieldSource'] ) {
			$source = self::resolve_url_param_source(
				$attr['fieldSourceValue'] ?? '',
				$attr['fieldSourceMeta'] ?? array()
			);
		} elseif ( 0 === stripos( $attr['fieldSource'], 'repeater|' ) ) {
			$ancestors = explode( "/", str_replace( 'repeater|', '', $attr['fieldSource'] ) );
			$parent    = $ancestors[ count( $ancestors ) - 1 ];
			if ( isset( $block->context['acf-field-blocks/repeaters'] ) && isset( $block->context['acf-field-blocks/repeaters'][ $ancestors[0] ] ) ) {
				$source = $block->context['acf-field-blocks/repeaters'][ $ancestors[0] ]['source'];
			}
		}

		if ( false !== stripos( $attr['fieldKey'], ':' ) ) {
			
			$field_keys   = explode( ':', $attr['fieldKey'] );
			$parent_field = get_field_object( $field_keys[ 0 ], $source, false, true );
			$field        = get_field_object( $field_keys[ count( $field_keys ) - 1 ], $source, false, true );
			$field['value'] = self::get_nested_value( $parent_field['value'], array_values( array_slice( $field_keys, 1 ) ) );
		} else {
			$field = get_field_object( $attr['fieldKey'], $source, false, true );
		}

		// field is not found on ACF.
		if ( false === $field ) {
			return false;
		}

		// get the value from the repeater if the field is repeater's sub field.
		if ( $parent && isset( $block->context['acf-field-blocks/repeaters'] ) && isset( $block->context['acf-field-blocks/repeaters'][ $parent ] ) ) {
			if ( false !== stripos( $attr['fieldKey'], ':' ) ) {
				// if the field is inside a group.
				$field_keys     = explode( ':', $attr['fieldKey'] );
				$field['value'] = self::get_nested_value( $block->context['acf-field-blocks/repeaters'][ $parent ]['value'], $field_keys );
			} elseif ( isset( $block->context['acf-field-blocks/repeaters'][ $parent ]['value'][ $attr['fieldKey'] ] ) ) {
				$field['value'] = $block->context['acf-field-blocks/repeaters'][ $parent ]['value'][ $attr['fieldKey'] ];
			}
		}

		$field['source'] = $source;

		return $field;
	}

	/**
	 * Resolve a URL-param-based ACF field source identifier.
	 *
	 * Reads $_GET[ $param_name ] and validates the value according to the
	 * supplied match rule. When $meta['rule'] is empty (auto-detect), accepts
	 * any of the ACF source identifier shapes:
	 *   - "{post_id}"            numeric post ID
	 *   - "{taxonomy}_{term_id}" term identifier (e.g. category_5)
	 *   - "user_{user_id}"       user identifier
	 *
	 * Otherwise dispatches to a specific lookup driven by $meta['rule']:
	 *   - "post_id"    / "post_slug"   ($meta['subtype'] = post type)
	 *   - "user_id"    / "user_login"  / "user_email"
	 *   - "term_id"    / "term_slug"   ($meta['subtype'] = taxonomy)
	 *
	 * @param  string $param_name The URL query parameter name.
	 * @param  array  $meta       Optional match rule metadata: { rule, subtype }.
	 * @return int|string|false   Source identifier suitable for ACF, or false.
	 */
	public static function resolve_url_param_source( $param_name, $meta = array() ) {
		$param_name = sanitize_key( $param_name );
		if ( '' === $param_name || ! isset( $_GET[ $param_name ] ) ) {
			return false;
		}

		$value = sanitize_text_field( wp_unslash( $_GET[ $param_name ] ) );
		if ( '' === $value ) {
			return false;
		}

		$rule    = is_array( $meta ) && isset( $meta['rule'] )    ? (string) $meta['rule']    : '';
		$subtype = is_array( $meta ) && isset( $meta['subtype'] ) ? (string) $meta['subtype'] : '';

		switch ( $rule ) {
			case 'post_id':
				if ( ! preg_match( '/^\d+$/', $value ) ) {
					return false;
				}
				$id = intval( $value );
				if ( $id <= 0 || ! get_post( $id ) ) {
					return false;
				}
				if ( '' !== $subtype && get_post_type( $id ) !== $subtype ) {
					return false;
				}
				return $id;

			case 'post_slug':
				if ( '' === $subtype || ! post_type_exists( $subtype ) ) {
					return false;
				}
				$post = get_page_by_path( $value, OBJECT, $subtype );
				return $post ? (int) $post->ID : false;

			case 'user_id':
				if ( ! preg_match( '/^\d+$/', $value ) ) {
					return false;
				}
				$id = intval( $value );
				return ( $id > 0 && get_userdata( $id ) ) ? 'user_' . $id : false;

			case 'user_login':
				$user = get_user_by( 'login', $value );
				return $user ? 'user_' . (int) $user->ID : false;

			case 'user_email':
				if ( ! is_email( $value ) ) {
					return false;
				}
				$user = get_user_by( 'email', $value );
				return $user ? 'user_' . (int) $user->ID : false;

			case 'term_id':
				if ( '' === $subtype || ! taxonomy_exists( $subtype ) ) {
					return false;
				}
				if ( ! preg_match( '/^\d+$/', $value ) ) {
					return false;
				}
				$term = get_term( intval( $value ), $subtype );
				if ( ! $term || is_wp_error( $term ) ) {
					return false;
				}
				return $subtype . '_' . (int) $term->term_id;

			case 'term_slug':
				if ( '' === $subtype || ! taxonomy_exists( $subtype ) ) {
					return false;
				}
				$term = get_term_by( 'slug', $value, $subtype );
				return $term ? $subtype . '_' . (int) $term->term_id : false;
		}

		// Auto-detect (legacy behavior, used when rule is empty or unrecognized).
		if ( preg_match( '/^user_(\d+)$/', $value, $m ) ) {
			return 'user_' . intval( $m[1] );
		}

		if ( preg_match( '/^([a-z][a-z0-9_]*)_(\d+)$/', $value, $m ) ) {
			$taxonomy = $m[1];
			if ( taxonomy_exists( $taxonomy ) ) {
				return $taxonomy . '_' . intval( $m[2] );
			}
		}

		if ( preg_match( '/^\d+$/', $value ) ) {
			return intval( $value );
		}

		return false;
	}

	/**
	 * Get nested value from array using array of keys.
	 *
	 * @since  1.1.2
	 *
	 * @param  array $array Array to get value from.
	 * @param  array $keys  Array of keys.
	 * @return mixed        Nested value or null if not found.
	 */
	public static function get_nested_value( $array, $keys ) {
		if ( is_array( $keys ) && isset( $array[ $keys[0] ] ) ) {
			if ( 1 < count( $keys ) ) {
				return self::get_nested_value( $array[ $keys[0] ], array_values( array_slice( $keys, 1 ) ) );
			}
			return $array[ $keys[0] ];
		}
		return null;
	}

	/**
	 * Check if the field has multiple returns.
	 *
	 * @since  1.0.0
	 * 
	 * @param  array   $field Field object.
	 * @return boolean        Is has multiple returns.
	 */
	public static function has_multiple_values( $field ) {
		$result = false;
		if ( 'checkbox' === $field['type'] ) {
			$result = true;
		} elseif ( 'relationship' === $field['type'] ) {
			$result = true;
		} elseif ( 'taxonomy' === $field['type'] && ( "checkbox" === $field['field_type'] || "multi_select" === $field['field_type'] ) ) {
			$result = true;
		} elseif ( isset( $field['multiple'] ) ) {
			$result = boolval( $field['multiple'] );
		}
		return apply_filters( 'acf_field_blocks_field_has_multiple_returns', $result );
	}

	/**
	 * Resolve a custom icon URL from ACF Icon Picker custom tab filters.
	 *
	 * @param  string $icon_type  The custom tab name (e.g. 'cards').
	 * @param  string $icon_value The icon key (e.g. 'ace-of-spades').
	 * @return string             The icon URL, or empty string if not found.
	 */
	public static function resolve_custom_icon_url( $icon_type, $icon_value ) {
		$icons = apply_filters( "acf/fields/icon_picker/{$icon_type}/icons", array() );
		if ( empty( $icons ) || ! is_array( $icons ) ) {
			return '';
		}
		foreach ( $icons as $icon ) {
			if ( isset( $icon['key'] ) && $icon['key'] === $icon_value && ! empty( $icon['url'] ) ) {
				return $icon['url'];
			}
		}
		return '';
	}

	/**
	 * Get the formatted value
	 *
	 * @since  1.1.2
	 *
	 * @param  mixed  $raw_value Raw field value
	 * @param  array  $field     Field object
	 * @return mixed             Formatted value of the field.
	 */
	public static function get_formatted_value( $raw_value, $field  ) {
		if ( isset( $field['choices'] ) && ! empty( $raw_value ) ) {
			if ( is_array( $raw_value ) ) {
				return array_map( function( $val ) use ( $field ) {
					return [
						'value' => $val,
						'label' => $field['choices'][ $val ]
					];
				}, $raw_value );
			} else {
				return [
					'value' => $raw_value,
					'label' => $field['choices'][ $raw_value ]
				];
			}
		} elseif ( 'post_object' === $field['type'] || 'relationship' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( 'get_post', $raw_value );
			} elseif ( ! empty( $raw_value ) ) {
				return get_post( $raw_value );
			}
		} elseif ( 'taxonomy' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( 'get_term', $raw_value );
			} elseif ( ! empty( $raw_value ) ) {
				return get_term( $raw_value );
			}
		} elseif ( 'page_link' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( function( $val ) {
					if ( is_numeric( $val ) ) {
						return get_permalink( $val );
					}
					return $val;
				}, $raw_value );
			} elseif ( ! empty( $raw_value ) && is_numeric( $raw_value ) ) {
				return get_permalink( $raw_value );
			}
		} elseif ( in_array( $field['type'], [ 'date_picker','datetime_picker','time_picker' ] ) && ! empty( $raw_value ) ) {
			return gmdate( $field['return_format'], strtotime( $raw_value ) );
		} elseif ( 'user' === $field['type'] ) {
			if ( is_array( $raw_value ) ) {
				return array_map( function( $val ) {
					if ( is_numeric( $val ) ) {
						$user = get_userdata( $val );
						if ( $user ) {
							$return = [
								'ID'            => $user->data->ID,
								'user_email'    => $user->data->user_email,
								'user_url'      => $user->data->user_url,
								'display_name'  => $user->data->display_name,
								'user_nicename' => $user->data->user_nicename,
								'user_login'    => $user->data->user_login
							];
							return $return;
						}
					}
					return $val;
				}, $raw_value );
			} elseif ( ! empty( $raw_value ) && is_numeric( $raw_value ) ) {
				$user = get_userdata( $raw_value );
				if ( $user ) {
					$return = [
						'ID'            => $user->data->ID,
						'user_email'    => $user->data->user_email,
						'user_url'      => $user->data->user_url,
						'display_name'  => $user->data->display_name,
						'user_nicename' => $user->data->user_nicename,
						'user_login'    => $user->data->user_login
					];
					return $return;
				}
			}
		} elseif ( 'icon_picker' === $field['type'] ) {
			if ( is_array( $raw_value )
				&& ! empty( $raw_value['type'] )
				&& ! empty( $raw_value['value'] )
				&& ! in_array( $raw_value['type'], array( 'dashicons', 'media_library', 'url' ), true )
			) {
				$resolved_url = self::resolve_custom_icon_url( $raw_value['type'], $raw_value['value'] );
				if ( ! empty( $resolved_url ) ) {
					$raw_value['url'] = $resolved_url;
				}
			}
			return $raw_value;
		}
		return apply_filters( 'acf_field_blocks_get_formatted_value', $raw_value, $field );
	}

}
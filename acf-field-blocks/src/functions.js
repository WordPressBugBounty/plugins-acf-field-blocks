import { __ } from '@wordpress/i18n';
import {
	useSelect,
	select,
	subscribe,
	dispatch
} from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';

export const useFieldsLoader = (fieldSource, context = false) => {
	let postId = 0;
	let source = "current_post";

	if ( fieldSource.includes('|') ) {
		const [ type, parentField ] = fieldSource.split('|');
		if ( context?.["acf-field-blocks/repeaters"] ) {
			const parentKeys = parentField.split('/');
			let parent = context["acf-field-blocks/repeaters"].find( ancestor => ancestor.key === parentKeys[ parentKeys.length - 1 ] );
			if ( parent?.source ) {
				source = parent?.source;
			}
		}
	} else {
		source = fieldSource;
	}
	
	if ( 'current_post' === source ) {
		if ( Number.isFinite( context?.queryId ) ) {
			postId = context?.postId;
		} else {
			let editId = select('core/editor').getCurrentPostId();
			if ( Number.isFinite( editId ) ) {
				postId = editId;
			}
		}
	} else if ( 'current_term' === source ) {
		if ( context?.termId && context?.taxonomy ) {
			postId = `${context?.taxonomy}_${context?.termId}`;
		} else if ( context?.["acf-field-blocks/term"] ) { // backwards compatibility
			postId = `${context["acf-field-blocks/term"]?.taxonomy}_${context["acf-field-blocks/term"]?.term_id}`;
		}
	} else if ( 'current_user' === source ) {
		if ( context?.["acf-field-blocks/user"] ) {
			postId = `user_${context["acf-field-blocks/user"]?.ID}`;
		}
	} else if ( 'option' === source ) {
		postId = 'option';
	}
	
	// Create refs at the top level to follow Rules of Hooks
	const wasSavingRef = useRef( false );
	const isInvalidatingRef = useRef( false );
	
	// Subscribe to post save events to rerun getValues when postId is a number
	useEffect( () => {
		const currentEditId = select('core/editor').getCurrentPostId();
		if ( Number.isFinite( postId ) && Number.isFinite( currentEditId ) && postId === currentEditId ) {
			const unsubscribe = subscribe( () => {
				// Skip callback if we're currently invalidating to prevent recursion
				if ( isInvalidatingRef.current ) {
					return;
				}
				
				const isSavingPost = select( 'core/editor' ).isSavingPost();
				const isAutosavingPost = select( 'core/editor' ).isAutosavingPost();
				
				// Detect when saving completes (was saving, now not saving, and not autosaving)
				if ( wasSavingRef.current && !isSavingPost && !isAutosavingPost ) {
					isInvalidatingRef.current = true;
					// Use dispatch directly instead of useDispatch
					dispatch( 'acf-field-blocks/data' ).invalidateResolution( 'getValues', [ postId ] );
					// Reset flag after a short delay to allow the invalidation to complete
					setTimeout( () => {
						isInvalidatingRef.current = false;
					}, 100 );
				}
				
				// Track if we're currently saving (not autosaving)
				wasSavingRef.current = isSavingPost && !isAutosavingPost;
			} );
			
			return () => {
				unsubscribe();
			};
		}
	}, [postId] );
	
	return useSelect( select => {
		const {
			getAllFields,
			getValues,
			isResolving
		} = select( 'acf-field-blocks/data' );

		const fields = getAllFields();
		const values = postId ? getValues(postId) : {};

		return {
			getField: (fieldKey) => {
				return fields?.[fieldKey];
			},
			getValue: (fieldKey) => {
				if ( context?.["acf-field-blocks/repeaters"] ) {
					let ancestorValues = values;
					context["acf-field-blocks/repeaters"].map( ancestor => {
						if ( ancestorValues?.[ ancestor.key ] ) {
							ancestorValues = ancestorValues?.[ ancestor.key ]?.[ ancestor.index ];
						} else {
							ancestorValues = values?.[ ancestor.key ]?.[ ancestor.index ];
						}
					} );
					if ( ancestorValues && ancestorValues[fieldKey] ) {
						return ancestorValues[fieldKey];
					}
				}
				return values?.[fieldKey];
			},
			isLoadingFields: isResolving?.( 'getAllFields' ),
			isLoadingValues: isResolving?.( 'getValues', [ postId ] ),
			hasContext: postId
		};
	}, [postId] );
};

export function getFieldOptions( source, filterBy = {} ) {
	let fieldOptions = [];
	const {
		allFieldGroups,
		isLoadingAllFieldGroups
	} = useSelect( select => {
		const {
			getAllFieldGroups,
			isResolving
		} = select( 'acf-field-blocks/data' );
	
		return {
			allFieldGroups: getAllFieldGroups(),
			isLoadingAllFieldGroups: isResolving?.( 'getAllFieldGroups' )
		};
	}, []);

	allFieldGroups.forEach( fieldGroup => {
		let options = [];
		if ( fieldGroup.fields?.length ) {
			if ( 'repeater' === source?.object && source.type ) {
				const keys = source.type.split('/');
				let repeaterField = fieldGroup.fields.find( field => field.key === keys[0] );
				if ( repeaterField ) {
					if ( 1 < keys.length ) {
						for ( let i = 1; i < keys.length; i++ ) {
							repeaterField = repeaterField.sub_fields.find( sub_field => sub_field.key === keys[i] );
						}
					}
					repeaterField.sub_fields.forEach( field => {
						if ( isFieldFiltered( field, filterBy ) ) {
							options.push({
								value: field.key,
								label: field.label
							})
						} 
					} )
				}
			} else if ( isFieldGroupEligible( fieldGroup.object_types, source?.object, source?.type ?? false ) ) {
				fieldGroup.fields.forEach( field => {
					if ( isFieldFiltered( field, filterBy ) ) {
						options.push({
							value: field.key,
							label: field.label
						})
					} 
				} )
			}
		}
		if ( options.length ) {
			fieldOptions.push({
				title: fieldGroup.title,
				fields: options
			})
		}
	} )

	return {
		isNoOptions: 0 === fieldOptions.length,
		fieldOptions: [
			{
				value: '',
				label: __( "Select a field", "acf-field-blocks" ),
				disabled: true
			},
			...fieldOptions
		],
		isLoadingOptions: isLoadingAllFieldGroups
	}
}

export function isFieldGroupEligible( objectTypes, obj, type ) {
	for ( let i = 0; i < objectTypes.length; i++ ) {
		if ( Array.isArray( type ) ) {
			if ( obj === objectTypes[i].type && ( type.length === 0 || type.indexOf( objectTypes[i].subtype ) > -1 || 'all' === objectTypes[i].subtype ) ) {
				return true;
			}
		} else if ( false !== type ) {
			if ( obj === objectTypes[i].type && ( type === objectTypes[i].subtype || 'all' === objectTypes[i].subtype ) ) {
				return true;
			}
		} else {
			if ( obj === objectTypes[i].type ) {
				return true;
			}
		}
	}

	return false;
}

export function isFieldFiltered( field, filterBy = {} ) {
	if ( "group" === field.type ) {
		return false;
	}
	if ( 0 === Object.keys( filterBy ).length ) {
		return true;
	}

	let valid = true;
	for (const [key, value] of Object.entries(filterBy)) {
		if ( 'return' === key ) {
			valid = valid && isFieldHasReturn( field, value );
		} else if ( 'multiple' === key ) {
			if ( value ) {
				valid = valid && isFieldHasMultipleReturn( field );
			} else {
				valid = valid && ! isFieldHasMultipleReturn( field );
			}
		} else if ( 'type' === key ) {
			valid = valid && value.includes( field.type );
		}
	}
	return valid;
}

export function isFieldHasReturn( field, type ) {
	if ( 'text' === type && ! ['image','file','oembed','icon_picker','gallery','google_map','message','accordion','tab','group','repeater','flexible_content','clone'].includes(field.type) ) {
		return true;
	} else if ( 'image' === type && 'image' === field.type ) {
		return true;
	} else if ( 'link' === type && ['email','url','file','link','page_link'].includes(field.type) ) {
		return true;
	} else if ( 'repeater' === type && 'repeater' === field.type ) {
		return true;
	} else if ( 'gallery' === type && 'gallery' === field.type ) {
		return true;
	} else if ( 'post-loop' === type && ["post_object","relationship"].includes(field.type) ) {
		return true;
	} else if ( 'term-loop' === type && 'taxonomy' === field.type ) {
		return true;
	} else if ( 'user-loop' === type && 'user' === field.type ) {
		return true;
	} else if ( 'oembed' === type && 'oembed' === field.type ) {
		return true;
	}
	return false;
}

export function isFieldHasMultipleReturn( field ) {
	if ( 'checkbox' === field.type ) {
		return true;
	} else if ( 'relationship' === field.type ) {
		return true;
	} else if ( 'taxonomy' === field.type && ( "checkbox" === field.field_type || "multi_select" === field.field_type ) ) {
		return true;
	} else if ( field.hasOwnProperty('multiple') ) {
		return field.multiple;
	}
	return false;
}

export function removeAnchorTag( value ) {
	// To do: Refactor this to use rich text's removeFormat instead.
	return value.toString().replace( /<\/?a[^>]*>/g, '' );
}
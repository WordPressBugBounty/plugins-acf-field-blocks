import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';

const cache = new Map();

const fetchOnce = async ( key, path ) => {
	if ( cache.has( key ) ) {
		return cache.get( key );
	}
	try {
		const data = await apiFetch( { path } );
		const label = Array.isArray( data ) && data[ 0 ]?.label ? data[ 0 ].label : '';
		cache.set( key, label );
		return label;
	} catch ( error ) {
		return '';
	}
};

const URL_PARAM_RULE_LABELS = () => ( {
	post_id:    __( 'Match as Post ID', 'acf-field-blocks' ),
	post_slug:  __( 'Match as Post Slug', 'acf-field-blocks' ),
	user_id:    __( 'Match as User ID', 'acf-field-blocks' ),
	user_login: __( 'Match as Username', 'acf-field-blocks' ),
	user_email: __( 'Match as User Email', 'acf-field-blocks' ),
	term_id:    __( 'Match as Term ID', 'acf-field-blocks' ),
	term_slug:  __( 'Match as Term Slug', 'acf-field-blocks' ),
} );

const buildUrlParamDetail = ( value, meta ) => {
	const parts = [];
	if ( value ) {
		parts.push( `?${ value }` );
	}
	const rule    = meta?.rule    || '';
	const subtype = meta?.subtype || '';
	if ( rule ) {
		const labels = URL_PARAM_RULE_LABELS();
		parts.push( labels[ rule ] || rule );
	}
	if ( subtype ) {
		const proData = window.ACFFieldBlocksPro || {};
		if ( rule.startsWith( 'post_' ) ) {
			parts.push( proData.postTypes?.[ subtype ] || subtype );
		} else if ( rule.startsWith( 'term_' ) ) {
			parts.push( proData.taxonomies?.[ subtype ] || subtype );
		}
	}
	return parts.join( ' · ' );
};

export function useSourceDetail( source, value, meta ) {
	const [ detail, setDetail ] = useState( '' );

	useEffect( () => {
		let cancelled = false;

		if ( ! source ) {
			setDetail( '' );
			return;
		}

		if ( 'url_param' === source ) {
			setDetail( buildUrlParamDetail( value, meta ) );
			return;
		}

		if ( ! value ) {
			setDetail( '' );
			return;
		}

		let path = '';
		let cacheKey = '';

		if ( source.startsWith( 'specific|post|' ) ) {
			const pt = source.split( '|' )[ 2 ];
			path = addQueryArgs( '/acf-field-blocks/v1/posts', { post_type: pt, p: value } );
			cacheKey = `post|${ pt }|${ value }`;
		} else if ( source.startsWith( 'specific|term|' ) ) {
			const tx = source.split( '|' )[ 2 ];
			path = addQueryArgs( '/acf-field-blocks/v1/terms', { taxonomy: tx, include: value } );
			cacheKey = `term|${ tx }|${ value }`;
		} else if ( 'specific|user' === source ) {
			path = addQueryArgs( '/acf-field-blocks/v1/users', { include: value } );
			cacheKey = `user|${ value }`;
		} else {
			setDetail( '' );
			return;
		}

		if ( cache.has( cacheKey ) ) {
			setDetail( cache.get( cacheKey ) );
			return;
		}

		setDetail( __( 'Loading…', 'acf-field-blocks' ) );
		fetchOnce( cacheKey, path ).then( label => {
			if ( ! cancelled ) {
				setDetail( label );
			}
		} );

		return () => {
			cancelled = true;
		};
	}, [ source, value, meta?.rule, meta?.subtype ] );

	return detail;
}

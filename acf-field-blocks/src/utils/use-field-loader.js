import { useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

const PREFIX = 'acf-field-blocks/acf-';

export function useFieldLoader( clientId, currentBlockName = null, setAttributes = null ) {
	const { replaceBlock } = useDispatch( 'core/block-editor' );

	return ( blockSlug, extraAttrs = {}, fieldAttrs = {} ) => {
		if ( ! blockSlug ) {
			return;
		}
		const targetName = `${ PREFIX }${ blockSlug }`;

		if ( currentBlockName && currentBlockName === targetName && setAttributes ) {
			setAttributes( { ...fieldAttrs, ...extraAttrs } );
			return;
		}

		const inserted = createBlock( targetName, { ...fieldAttrs, ...extraAttrs } );
		replaceBlock( clientId, inserted );
	};
}

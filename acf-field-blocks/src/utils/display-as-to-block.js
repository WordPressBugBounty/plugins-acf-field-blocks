export function displayAsToBlock( displayAs ) {
	if (
		displayAs.includes( 'gallery' ) ||
		displayAs.includes( 'post' ) ||
		displayAs.includes( 'term' ) ||
		displayAs.includes( 'user' )
	) {
		let [ block, type ] = displayAs.split( '-' );
		if ( 'post' === block ) {
			block = 'post-loop';
		} else if ( 'term' === block ) {
			block = 'term-loop';
		} else if ( 'user' === block ) {
			block = 'user-loop';
		}
		return { blockName: block, extraAttrs: { type } };
	}

	if ( displayAs.includes( 'repeater' ) ) {
		const [ block, type ] = displayAs.split( '-' );
		if ( ! [ 'accordion', 'tabs' ].includes( type ) ) {
			return { blockName: block, extraAttrs: { type } };
		}
		return { blockName: type, extraAttrs: {} };
	}

	return { blockName: displayAs, extraAttrs: {} };
}

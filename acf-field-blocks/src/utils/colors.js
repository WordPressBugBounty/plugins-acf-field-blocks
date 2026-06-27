import {
	useSettings
} from '@wordpress/block-editor';
import {
	useMemo
} from '@wordpress/element';

export const isValueColorPreset = ( value ) => {
	return value?.startsWith( 'var:preset|color|' )
}

export const getColorValueFromPreset = ( value, allColors = false ) => {
	if ( ! allColors ) {
		allColors = getAllColors();
	}
	if ( ! value.startsWith( 'var:preset|color|' ) ) {
		return null;
	}
	const colorObject = allColors.find(
		( { slug } ) => slug === value.substring( 'var:preset|color|'.length )
	);
	return colorObject ? colorObject.color : null;
}

export const getColorPresetValue = ( value, allColors = false ) => {
	if ( ! allColors ) {
		allColors = getAllColors();
	}
	const colorObject = allColors.find(
		( { color } ) => color === value
	);
	return colorObject
		? 'var:preset|color|' + colorObject.slug
		: value;
}

export const getColorValue = ( value, allColors = false ) => {
	if ( ! allColors ) {
		allColors = getAllColors();
	}
	return isValueColorPreset( value ) ? getColorValueFromPreset( value, allColors ) : value;
}

export const getColorPresetCssVar = ( value ) => {
	if ( ! value ) {
		return;
	}

	const slug = value.match( /var:preset\|color\|(.+)/ );

	if ( ! slug ) {
		return value;
	}

	return `var(--wp--preset--color--${ slug[ 1 ] })`;
}

export const getColorCSS = value => {
	return isValueColorPreset( value ) ? getColorPresetCssVar( value ) : value;
}

export const getAllColors = () => {
	const [ userPalette, themePalette, defaultPalette ] = useSettings( 'color.palette.custom', 'color.palette.theme', 'color.palette.default' );
	const allColors = useMemo(
		() => [
			...( userPalette || [] ),
			...( themePalette || [] ),
			...( defaultPalette || [] )
		],
		[ userPalette, themePalette, defaultPalette ]
	);
	return allColors;
}

export const getAllColorOptions = () => {
	const [ userPalette, themePalette, defaultPalette ] = useSettings( 'color.palette.custom', 'color.palette.theme', 'color.palette.default' );
	const allColorsOptions = useMemo(
		() => [
			...( userPalette ? {
				name: 'Custom',
				colors: [
					...( userPalette || [] )
				]
			} : [] ),
			{
				name: 'Theme',
				colors: [
					...( themePalette || [] )
				]
			},
			{
				name: 'Default',
				colors: [
					...( defaultPalette || [] )
				]
			}
		],
		[ userPalette, themePalette, defaultPalette ]
	);
	return allColorsOptions;
}

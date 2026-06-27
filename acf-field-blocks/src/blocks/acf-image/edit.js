/**
 * External depedencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { isBlobURL } from '@wordpress/blob';
import {
	useBlockProps,
	InspectorControls,
	MediaReplaceFlow,
	__experimentalUseBorderProps as useBorderProps
} from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';
import { store as coreStore } from '@wordpress/core-data';
import {
	useSelect,
	useDispatch
} from '@wordpress/data';
import {
	useEffect,
	useState
} from '@wordpress/element';
import {
	BaseControl,
	PanelBody,
	Spinner,
	Placeholder,
	MenuItem,
	SelectControl,
	ToggleControl,
	TextControl
} from '@wordpress/components';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import OverlayControls from './overlay-controls';
import Overlay from './overlay';
import {
	FieldSettings,
	FieldPlaceholder,
	FieldSummary,
	FieldKeyControl,
	DimensionControls
} from '../../components'
import {
	useFieldsLoader
} from '../../functions'

function getMediaSourceUrlBySizeSlug( media, slug ) {
	return (
		media?.media_details?.sizes?.[ slug ]?.source_url || media?.source_url
	);
}

export default function Edit( {
	clientId,
	attributes: {
		fieldKey,
		fieldSource,
		fieldSourceValue,
		fieldSourceMeta,
		width,
		height,
		aspectRatio,
		scale,
		sizeSlug,
		defaultImage,
		linkDestination,
		href,
		linkFieldKey,
		linkTarget,
		rel
	},
	attributes,
	setAttributes,
	isSelected,
	context
} ) {

	const [ fieldValue, setFieldValue ] = useState('');
	const [ fieldLabel, setFieldLabel ] = useState('');
	const [ temporaryURL, setTemporaryURL ] = useState();
	const [ defaultImageTemporaryURL, setDefaultImageTemporaryURL ] = useState();

	const {
		getField,
		getValue,
		isLoadingFields,
		isLoadingValues,
		hasContext
	} = useFieldsLoader( fieldSource, context, fieldSourceValue );

	useEffect( () => {
		if ( fieldKey ) {
			if ( ! isLoadingFields ) {
				const field = getField( fieldKey );
				setFieldLabel( field?.label );
			}
			if ( ! isLoadingValues ) {
				const value = getValue( fieldKey );
				setFieldValue( value );
			}
		}
	}, [ fieldSource, fieldKey, isLoadingFields, isLoadingValues] )

	const {
		media,
		defaultMedia
	} = useSelect( ( select ) => {
		const { getMedia } = select( coreStore );
		return {
			media: fieldValue && getMedia( fieldValue, {
				context: 'view',
			} ),
			defaultMedia: defaultImage && getMedia( defaultImage, {
				context: 'view',
			} ),
		};
	}, [ fieldSource, fieldValue, defaultImage ] );

	const onSelectDefaultImage = ( value ) => {
		if ( value?.id ) {
			setAttributes( { defaultImage : value.id } );
		}

		if ( value?.url && isBlobURL( value.url ) ) {
			setDefaultImageTemporaryURL( value.url );
		}
	};

	const { createErrorNotice } = useDispatch( noticesStore );
	const onUploadDefaultError = ( message ) => {
		createErrorNotice( message, { type: 'snackbar' } );
		setDefaultImageTemporaryURL();
	};

	const mediaUrl = getMediaSourceUrlBySizeSlug( media, sizeSlug );
	const defaultMediaUrl = getMediaSourceUrlBySizeSlug( defaultMedia, sizeSlug );
	
	const blockProps = useBlockProps({
		style: { width, height, aspectRatio },
	});
	const borderProps = useBorderProps( attributes );
	// const shadowProps = getShadowClassesAndStyles( attributes );

	const isLinked = [ 'media', 'attachment', 'custom', 'field' ].includes( linkDestination );
	const disabledClickProps = {
		onClick: ( event ) => event.preventDefault(),
		'aria-disabled': true,
	};

	const imageStyles = {
		...borderProps.style,
		// ...shadowProps.style,
		height: aspectRatio ? '100%' : height,
		width: !! aspectRatio && '100%',
		objectFit: !! ( height || aspectRatio ) && scale,
	};

	const placeholder = ( content ) => {

		if ( hasContext && ( defaultImageTemporaryURL || defaultMediaUrl ) ) {
			return (
				<>
					<img
						className={ borderProps.className }
						src={ defaultImageTemporaryURL || defaultMediaUrl }
						alt={
							defaultMedia && defaultMedia?.alt_text
								? sprintf(
										// translators: %s: The image's alt text.
										__( 'ACF image: %s' ),
										defaultMedia.alt_text
									)
								: sprintf(
									// translators: %s: The image's alt text.
									__( 'ACF image: %s' ),
									fieldLabel
								)
						}
						style={ imageStyles }
					/>
					{ defaultImageTemporaryURL && <Spinner /> }
				</>
			);
		}

		return (
			<Placeholder
				className={ classnames(
					'block-editor-media-placeholder',
					borderProps.className
				) }
				withIllustration
				style={ {
					height: !! aspectRatio && '100%',
					width: !! aspectRatio && '100%',
					...borderProps.style,
					// ...shadowProps.style,
				} }
			>
				{ content }
			</Placeholder>
		);
	};

	// Reset temporary url when media is available.
	useEffect( () => {
		if ( mediaUrl && temporaryURL ) {
			setTemporaryURL();
		}
	}, [ mediaUrl, temporaryURL ] );

	// Reset temporary url when media is available.
	useEffect( () => {
		if ( defaultMediaUrl && defaultImageTemporaryURL ) {
			setDefaultImageTemporaryURL();
		}
	}, [ defaultMediaUrl, defaultImageTemporaryURL ] );

	if ( ! fieldKey ) {
		return (
			<div { ...blockProps }>
				<FieldPlaceholder
					label={ __( 'ACF Image', 'acf-field-blocks' ) }
					isSelected={ isSelected }
				>
					<FieldSettings
						fieldSource={ fieldSource }
						fieldSourceValue={ fieldSourceValue }
						fieldSourceMeta={ fieldSourceMeta }
						fieldKey={ fieldKey }
						onChangeFieldSource={ value => setAttributes( { fieldSource: value } ) }
						onChangeFieldSourceValue={ value => setAttributes( { fieldSourceValue: value } ) }
						onChangeFieldSourceMeta={ value => setAttributes( { fieldSourceMeta: value } ) }
						onChangeFieldKey={ value => setAttributes( { fieldKey: value } ) }
						filterBy={ { return: "image" } }
						context={ context }
						clientId={ clientId }
						fieldHelp={ __( 'Select an image field to load', 'acf-field-blocks' ) }
					/>
				</FieldPlaceholder>
			</div>
		)
	}

	const controls = (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Field Info', 'acf-field-blocks' ) }
					initialOpen={ false }
				>
					<FieldSummary
						fieldSource={ fieldSource }
						fieldSourceValue={ fieldSourceValue }
						fieldSourceMeta={ fieldSourceMeta }
						fieldKey={ fieldKey }
						setAttributes={ setAttributes }
						clientId={ clientId }
						blockName="acf-field-blocks/acf-image"
						context={ context }
					/>
				</PanelBody>
				
				<PanelBody
					title={ __( 'Output Settings', 'acf-field-blocks' ) }
				>
					<BaseControl
						label={ __( 'Default Image', 'acf-field-blocks' ) }
						help={ __( 'Set a default image if the field is empty', 'acf-field-blocks' ) }
						className='acf-field-blocks-default-image'
						__nextHasNoMarginBottom={true}
					>
						{ ( defaultImageTemporaryURL || defaultMediaUrl ) && (
							<div className="acf-field-blocks-default-image__wrapper">
								<img
									src={ defaultImageTemporaryURL || defaultMediaUrl }
									alt={
										defaultMedia && defaultMedia?.alt_text
											? sprintf(
													// translators: %s: The image's alt text.
													__( 'ACF image: %s' ),
													defaultMedia.alt_text
												)
											: sprintf(
												// translators: %s: The image's alt text.
												__( 'ACF image: %s' ),
												fieldLabel
											)
									}
								/>
							</div>
						) }
						<MediaReplaceFlow
							mediaId={ defaultImage }
							mediaURL={ defaultMediaUrl }
							allowedTypes={ [ 'image' ] }
							accept="image/*"
							onSelect={ onSelectDefaultImage }
							onError={ onUploadDefaultError }
							name={ ! defaultMediaUrl ? __( 'Set Default Image', 'acf-field-blocks' ) : __( 'Replace Default Image', 'acf-field-blocks' ) }
						>
							{ defaultMediaUrl && (
								<MenuItem onClick={ () => setAttributes( { defaultImage: 0 } ) } isDestructive>
									{ __( 'Remove Image', 'acf-field-blocks') }
								</MenuItem>
							) }
						</MediaReplaceFlow>
					</BaseControl>
				</PanelBody>

				<PanelBody
					title={ __( 'Link Settings', 'acf-field-blocks' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'On Click', 'acf-field-blocks' ) }
						value={ linkDestination || 'none' }
						options={ [
							{ value: 'none', label: __( 'Do nothing', 'acf-field-blocks' ) },
							{ value: 'lightbox', label: __( 'Open in lightbox', 'acf-field-blocks' ) },
							{ value: 'media', label: __( 'Link to media file', 'acf-field-blocks' ) },
							{ value: 'attachment', label: __( 'Link to attachment page', 'acf-field-blocks' ) },
							{ value: 'custom', label: __( 'Link to custom URL', 'acf-field-blocks' ) },
							{ value: 'field', label: __( 'Link to URL from field', 'acf-field-blocks' ) },
						] }
						onChange={ value => setAttributes( { linkDestination: value } ) }
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
					{ 'custom' === linkDestination && (
						<TextControl
							label={ __( 'Custom URL', 'acf-field-blocks' ) }
							value={ href || '' }
							type="url"
							placeholder="https://"
							onChange={ value => setAttributes( { href: value } ) }
							__nextHasNoMarginBottom={ true }
							__next40pxDefaultSize={ true }
						/>
					) }
					{ 'field' === linkDestination && (
						<FieldKeyControl
							label={ __( 'Link Field', 'acf-field-blocks' ) }
							filterBy={ { return: 'link' } }
							source={ fieldSource }
							sourceMeta={ fieldSourceMeta }
							value={ linkFieldKey }
							onChange={ value => setAttributes( { linkFieldKey: value } ) }
							context={ context }
							help={ __( 'Use a URL from another field as the link.', 'acf-field-blocks' ) }
						/>
					) }
					{ isLinked && (
						<>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Open in new tab', 'acf-field-blocks' ) }
								checked={ '_blank' === linkTarget }
								onChange={ value => setAttributes( { linkTarget: value ? '_blank' : undefined } ) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Mark as nofollow', 'acf-field-blocks' ) }
								checked={ !! rel && rel.includes( 'nofollow' ) }
								onChange={ value => setAttributes( { rel: value ? 'nofollow' : undefined } ) }
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="color">
				<OverlayControls
					attributes={ attributes }
					setAttributes={ setAttributes }
					clientId={ clientId }
				/>
			</InspectorControls>
			<InspectorControls group="dimensions">
				<DimensionControls
					clientId={ clientId }
					attributes={ attributes }
					setAttributes={ setAttributes }
					media={ media }
				/>
			</InspectorControls>
		</>
	);

	let image;
	
	if ( ! fieldValue ) {
		return (
			<>
				{ controls }
				<div { ...blockProps }>
					{ placeholder() }
					<Overlay
						attributes={ attributes }
						setAttributes={ setAttributes }
						clientId={ clientId }
					/>
				</div>
			</>
		);
	}

	image = ! media && ! temporaryURL ? (
		placeholder()
	) : (
		<>
			<img
				className={ borderProps.className }
				src={ temporaryURL || mediaUrl }
				alt={
					media && media?.alt_text
						? sprintf(
								// translators: %s: The image's alt text.
								__( 'ACF image: %s' ),
								media.alt_text
							)
						: sprintf(
							// translators: %s: The image's alt text.
							__( 'ACF image: %s' ),
							fieldLabel
						)
				}
				style={ imageStyles }
			/>
			{ temporaryURL && <Spinner /> }
		</>
	);

	return (
		<>
			{ ! temporaryURL && controls }
			<figure { ...blockProps }>
				{ isLinked ? (
					<a href="#" { ...disabledClickProps }>{ image }</a>
				) : image }
				<Overlay
					attributes={ attributes }
					setAttributes={ setAttributes }
					clientId={ clientId }
				/>
			</figure>
		</>
	);
};
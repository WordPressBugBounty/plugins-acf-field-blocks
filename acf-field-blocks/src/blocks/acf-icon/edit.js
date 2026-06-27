/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	InspectorControls,
	MediaReplaceFlow,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { isBlobURL } from '@wordpress/blob';
import {
	PanelBody,
	RangeControl,
	Placeholder,
	BaseControl,
	MenuItem,
	Spinner,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	FieldSettings,
	FieldPlaceholder,
	FieldSummary,
} from '../../components';
import { useFieldsLoader } from '../../functions';

export default function Edit( {
	clientId,
	attributes: {
		fieldKey,
		fieldSource,
		fieldSourceValue,
		fieldSourceMeta,
		iconSize,
		defaultIcon,
	},
	setAttributes,
	isSelected,
	context,
} ) {
	const [ fieldValue, setFieldValue ] = useState( null );
	const [ defaultIconTemporaryURL, setDefaultIconTemporaryURL ] = useState();

	const {
		getField,
		getValue,
		isLoadingFields,
		isLoadingValues,
		hasContext,
	} = useFieldsLoader( fieldSource, context, fieldSourceValue );

	useEffect( () => {
		if ( fieldKey ) {
			if ( ! isLoadingValues ) {
				const value = getValue( fieldKey );
				setFieldValue( value );
			}
		}
	}, [ fieldSource, fieldKey, isLoadingFields, isLoadingValues ] );

	// Resolve media library attachment URL and default icon
	const { mediaUrl, defaultMedia } = useSelect(
		( select ) => {
			const { getMedia } = select( coreStore );
			let resolvedMediaUrl = null;

			if (
				fieldValue &&
				fieldValue?.type === 'media_library' &&
				fieldValue?.value
			) {
				const media = getMedia( fieldValue.value, {
					context: 'view',
				} );
				resolvedMediaUrl =
					media?.media_details?.sizes?.thumbnail?.source_url ||
					media?.source_url ||
					null;
			}

			return {
				mediaUrl: resolvedMediaUrl,
				defaultMedia: defaultIcon
					? getMedia( defaultIcon, { context: 'view' } )
					: undefined,
			};
		},
		[ fieldValue, defaultIcon ]
	);

	const defaultMediaUrl =
		defaultMedia?.media_details?.sizes?.thumbnail?.source_url ||
		defaultMedia?.source_url;

	// Reset temporary url when media is available.
	useEffect( () => {
		if ( defaultMediaUrl && defaultIconTemporaryURL ) {
			setDefaultIconTemporaryURL();
		}
	}, [ defaultMediaUrl, defaultIconTemporaryURL ] );

	const onSelectDefaultIcon = ( value ) => {
		if ( value?.id ) {
			setAttributes( { defaultIcon: value.id } );
		}
		if ( value?.url && isBlobURL( value.url ) ) {
			setDefaultIconTemporaryURL( value.url );
		}
	};

	const { createErrorNotice } = useDispatch( noticesStore );
	const onUploadDefaultError = ( message ) => {
		createErrorNotice( message, { type: 'snackbar' } );
		setDefaultIconTemporaryURL();
	};

	const blockProps = useBlockProps( {
		style: {
			width: `${ iconSize }px`,
			height: `${ iconSize }px`,
		},
	} );

	if ( ! fieldKey ) {
		return (
			<figure { ...blockProps }>
				<FieldPlaceholder
					label={ __( 'ACF Icon', 'acf-field-blocks' ) }
					isSelected={ isSelected }
				>
					<FieldSettings
						fieldSource={ fieldSource }
						fieldSourceValue={ fieldSourceValue }
						fieldSourceMeta={ fieldSourceMeta }
						fieldKey={ fieldKey }
						onChangeFieldSource={ ( value ) =>
							setAttributes( { fieldSource: value } )
						}
						onChangeFieldSourceValue={ ( value ) =>
							setAttributes( { fieldSourceValue: value } )
						}
						onChangeFieldSourceMeta={ ( value ) =>
							setAttributes( { fieldSourceMeta: value } )
						}
						onChangeFieldKey={ ( value ) =>
							setAttributes( { fieldKey: value } )
						}
						filterBy={ { type: [ 'icon_picker' ] } }
						context={ context }
						clientId={ clientId }
						fieldHelp={ __(
							'Select an icon picker field to load',
							'acf-field-blocks'
						) }
					/>
				</FieldPlaceholder>
			</figure>
		);
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
						blockName="acf-field-blocks/acf-icon"
						context={ context }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Output Settings', 'acf-field-blocks' ) }
				>
					<BaseControl
						label={ __(
							'Default Icon',
							'acf-field-blocks'
						) }
						help={ __(
							'Set a default icon if the field is empty',
							'acf-field-blocks'
						) }
						className="acf-field-blocks-default-icon"
						__nextHasNoMarginBottom={ true }
					>
						{ ( defaultIconTemporaryURL ||
							defaultMediaUrl ) && (
							<div className="acf-field-blocks-default-icon__wrapper">
								<img
									src={
										defaultIconTemporaryURL ||
										defaultMediaUrl
									}
									alt={ __(
										'Default icon preview',
										'acf-field-blocks'
									) }
									style={ {
										width: `${ iconSize }px`,
										height: `${ iconSize }px`,
										objectFit: 'contain',
									} }
								/>
								{ defaultIconTemporaryURL && <Spinner /> }
							</div>
						) }
						<MediaReplaceFlow
							mediaId={ defaultIcon }
							mediaURL={ defaultMediaUrl }
							allowedTypes={ [ 'image' ] }
							accept="image/*"
							onSelect={ onSelectDefaultIcon }
							onError={ onUploadDefaultError }
							name={
								! defaultMediaUrl
									? __(
											'Set Default Icon',
											'acf-field-blocks'
										)
									: __(
											'Replace Default Icon',
											'acf-field-blocks'
										)
							}
						>
							{ defaultMediaUrl && (
								<MenuItem
									onClick={ () =>
										setAttributes( {
											defaultIcon: 0,
										} )
									}
									isDestructive
								>
									{ __(
										'Remove Icon',
										'acf-field-blocks'
									) }
								</MenuItem>
							) }
						</MediaReplaceFlow>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="dimensions">
				<ToolsPanelItem
					hasValue={ () => !! iconSize && iconSize !== 24 }
					label={ __( 'Icon Size', 'acf-field-blocks' ) }
					onDeselect={ () => {
						setAttributes( { iconSize: 24 } );
					} }
					resetAllFilter={ () => ( {
						iconSize: 24,
					} ) }
					isShownByDefault={ true }
					panelId={ clientId }
				>
					<RangeControl
						label={ __( 'Icon Size', 'acf-field-blocks' ) }
						value={ iconSize }
						onChange={ ( value ) =>
							setAttributes( { iconSize: value } )
						}
						min={ 12 }
						max={ 200 }
						step={ 1 }
						__nextHasNoMarginBottom
					/>
				</ToolsPanelItem>
			</InspectorControls>
		</>
	);

	// Show spinner while loading field values.
	if ( isLoadingValues ) {
		return (
			<>
				{ controls }
				<figure { ...blockProps }><span className="afb-icon-wrapper"><Spinner /></span></figure>
			</>
		);
	}

	// Render icon preview
	const renderIcon = () => {
		const hasValue =
			fieldValue && fieldValue?.type && fieldValue?.value;

		if ( ! hasValue ) {
			// Show default icon if set
			if (
				defaultIcon &&
				( defaultIconTemporaryURL || defaultMediaUrl )
			) {
				return (
					<>
						<img
							src={
								defaultIconTemporaryURL || defaultMediaUrl
							}
							alt={ __(
								'Default icon',
								'acf-field-blocks'
							) }
							width={ iconSize }
							height={ iconSize }
							style={ {
								objectFit: 'contain',
							} }
						/>
						{ defaultIconTemporaryURL && <Spinner /> }
					</>
				);
			}

			// Empty placeholder
			return (
				<Placeholder
					className="block-editor-media-placeholder"
					withIllustration
					style={ {
						height: `${ iconSize }px`,
					} }
				/>
			);
		}

		const { type, value } = fieldValue;

		switch ( type ) {
			case 'dashicons':
				return (
					<span
						className={ `dashicons ${ value }` }
						style={ {
							fontSize: `${ iconSize }px`,
							width: `${ iconSize }px`,
							height: `${ iconSize }px`,
						} }
						aria-hidden="true"
					/>
				);

			case 'media_library':
				if ( ! mediaUrl ) {
					return (
						<Placeholder
							className="block-editor-media-placeholder"
							withIllustration
							style={ {
								height: `${ iconSize }px`,
							} }
						/>
					);
				}
				return (
					<img
						src={ mediaUrl }
						alt=""
						width={ iconSize }
						height={ iconSize }
						style={ {
							objectFit: 'contain',
						} }
					/>
				);

			case 'url':
				return (
					<img
						src={ value }
						alt=""
						width={ iconSize }
						height={ iconSize }
						style={ {
							objectFit: 'contain',
						} }
					/>
				);

			default:
				// Custom icon tab type - URL resolved by REST API.
				if ( fieldValue?.url ) {
					return (
						<img
							src={ fieldValue.url }
							alt=""
							width={ iconSize }
							height={ iconSize }
							style={ {
								objectFit: 'contain',
							} }
						/>
					);
				}
				return null;
		}
	};

	return (
		<>
			{ controls }
			<figure { ...blockProps }><span className="afb-icon-wrapper">{ renderIcon() }</span></figure>
		</>
	);
}